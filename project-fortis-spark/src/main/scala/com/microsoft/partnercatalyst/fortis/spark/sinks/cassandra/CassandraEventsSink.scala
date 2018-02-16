package com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra

import java.util.UUID

import com.datastax.driver.core.ConsistencyLevel
import com.datastax.spark.connector._
import com.datastax.spark.connector.cql.CassandraConnector
import com.datastax.spark.connector.writer.WriteConf
import com.microsoft.partnercatalyst.fortis.spark.dba.ConfigurationManager
import com.microsoft.partnercatalyst.fortis.spark.dto.FortisEvent
import com.microsoft.partnercatalyst.fortis.spark.logging.FortisTelemetry.{get => Log}
import com.microsoft.partnercatalyst.fortis.spark.logging.Timer
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.aggregators._
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.dto._
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.SparkSession
import org.apache.spark.streaming.dstream.DStream

import scala.util.{Failure, Success, Try}

object CassandraEventsSink {
  private val KeyspaceName = "fortis"
  private val TableEvent = "events"

  def apply(stream: DStream[FortisEvent], sparkSession: SparkSession, configurationManager: ConfigurationManager): Unit = {
    implicit lazy val connector: CassandraConnector = CassandraConnector(sparkSession.sparkContext)

    val aggregators = Seq[(RDD[Event]) => Unit](
      new ConjunctiveTopicsOffineAggregator(configurationManager, KeyspaceName),
      new TileAggregator(configurationManager, KeyspaceName)
    )

    stream.map(event => event.copy(analysis = event.analysis.copy(
      keywords = event.analysis.keywords.distinct,
      locations = event.analysis.locations.distinct,
      entities = event.analysis.entities.distinct
    )))
    .foreachRDD { eventsRDD => {
        eventsRDD.cache()

        if (!eventsRDD.isEmpty) {
          val batchId = UUID.randomUUID().toString
          val fortisEventsRDD = eventsRDD.map(CassandraEventSchema(_, batchId))

          // Get events unique to this batch.
          // Note: caching is *required* for correct execution, since uniqueEvents is used after writing
          // to the events table (without cache, the second use will re-run dedup post-write, and we'd end up with
          // nothing).
          //
          // A partition failure between writing events and calculating eventsExploded will cause the cache to be
          // skipped, in which case events in that batch will not be aggregated.
          val uniqueEvents = withoutDuplicates(fortisEventsRDD).cache()

          // Write events
          writeFortisEvents(uniqueEvents)

          // Add 2 additional copies of each event to support aggregation by "all" pipelines and sources
          val eventsExploded = uniqueEvents.flatMap(event=>{
            Seq(
              event,
              event.copy(externalsourceid = "all"),
              event.copy(pipelinekey = "all", externalsourceid = "all")
            )
          }).cache()

          // Perform aggregations and write results
          Timer.time(Log.logDependency("sinks.cassandra", s"writeAggregates_all", _, _)) {
            aggregators.foreach(aggregator => writeAggregates(eventsExploded, aggregator))
          }

          eventsExploded.unpersist(blocking = true)
          uniqueEvents.unpersist(blocking = true)
          fortisEventsRDD.unpersist(blocking = true)
          eventsRDD.unpersist(blocking = true)
        }
      }
    }

    def writeFortisEvents(events: RDD[Event]): Unit = {
      val conf = WriteConf.fromSparkConf(events.sparkContext.getConf).copy(
        ifNotExists = true,
        consistencyLevel = ConsistencyLevel.ALL // Ensure write is consistent across all replicas
      )

      Timer.time(Log.logDependency("sinks.cassandra", s"write.$TableEvent", _, _)) {
        events.saveToCassandra(KeyspaceName, TableEvent, writeConf = conf)
      }
    }

    def withoutDuplicates(events: RDD[Event]): RDD[Event] = {
      val eventsRepartitioned = events.repartitionByCassandraReplica(KeyspaceName, TableEvent)

      // new events in batch = [batch] - [events table]
      eventsRepartitioned.leftJoinWithCassandraTable(
        KeyspaceName,
        TableEvent
      ).filter(_._2.isEmpty).map(_._1)
    }

    def writeAggregates(eventsExploded: RDD[Event], aggregator: (RDD[Event] => Unit)): Unit = {
      val name = aggregator.getClass.getSimpleName

      Try {
        Timer.time(Log.logDependency("sinks.cassandra", s"apply.$name", _, _)) {
          aggregator(eventsExploded)
        }
      } match {
        case Failure(ex) => Log.logError(s"Failed performing offline aggregation $name", ex)
        case Success(_) => // rejoice
      }
    }
  }
}