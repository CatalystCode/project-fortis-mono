package com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.aggregators

import com.microsoft.partnercatalyst.fortis.spark.dba.ConfigurationManager
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.dto.{Event, TileRow}
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.{PeriodType, TileRows}
import org.apache.spark.rdd.RDD
import com.datastax.spark.connector._
import com.microsoft.partnercatalyst.fortis.spark.logging.{FortisTelemetry, Timer}
import FortisTelemetry.{get => Log}
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.Constants._
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.CassandraExtensions._

class TileAggregator(configurationManager: ConfigurationManager) extends (RDD[Event] => Unit) {
  val LogName = "sinks.cassandra.write"

  override def apply(events: RDD[Event]): Unit = {
    val defaultZoom = configurationManager.fetchSiteSettings(events.sparkContext).defaultzoom

    // Partition tile rows by partition key of heatmap table which is shared by most other tile aggregation tables
    // as well. This way, the results of all aggregations below will land on the same Cassandra nodes the they were
    // computed on in Spark.
    val tileRows = toTileRows(events, defaultZoom).repartitionByCassandraReplica(KeyspaceName, Table.HeatMap).cache()

    Timer.time(Log.logDependency(LogName, Table.HeatMap, _, _)) {
      tileRows.saveToCassandra(KeyspaceName, Table.HeatMap)
    }

    Timer.time(Log.logDependency(LogName, s"${Table.EventPlaces},${Table.EventPlacesByPipeline},${Table.EventPlacesBySource}", _, _)) {
      val eventPlaces = toEventPlaces(tileRows).cache()
      eventPlaces.dedupAndSaveToCassandra(KeyspaceName, Table.EventPlacesBySource)
      eventPlaces.dedupAndSaveToCassandra(KeyspaceName, Table.EventPlaces)
      eventPlaces.dedupAndSaveToCassandra(KeyspaceName, Table.EventPlacesByPipeline)
    }

    Timer.time(Log.logDependency(LogName, Table.PopularPlaces, _, _)) {
      tileRows.dedupAndSaveToCassandra(KeyspaceName, Table.PopularPlaces)
    }

    Timer.time(Log.logDependency(LogName, Table.ComputedTiles, _, _)) {
      tileRows.dedupAndSaveToCassandra(KeyspaceName, Table.ComputedTiles)
    }

    Timer.time(Log.logDependency(LogName, Table.PopularSources, _, _)) {
      // below writes can land on any partition
      tileRows.dedupAndSaveToCassandra(KeyspaceName, Table.PopularSources)
    }

    Timer.time(Log.logDependency(LogName, Table.PopularTopics, _, _)) {
      val popularTopics = toPopularTopics(tileRows)
      popularTopics.dedupAndSaveToCassandra(KeyspaceName, Table.PopularTopics)
    }

    tileRows.unpersist(blocking = true)
  }

  private[aggregators] def toTileRows(events: RDD[Event], defaultZoom: Int): RDD[TileRow] = {
    events.flatMap(TileRows(_, defaultZoom))
  }

  private[aggregators] def toEventPlaces(tiles: RDD[TileRow]): RDD[TileRow] = {
    tiles.filter(tile =>
      // de-dup since event places are period-agnostic
      tile.periodtype == PeriodType.Day.periodTypeName

        // Remove "all" category events
        && tile.externalsourceid != "all"
        && tile.pipelinekey != "all"
    )
  }

  private[aggregators] def toPopularTopics(tiles: RDD[TileRow]): RDD[TileRow] = {
    tiles.filter(tile => tile.conjunctiontopic2 == "" && tile.conjunctiontopic3 == "")
  }
}