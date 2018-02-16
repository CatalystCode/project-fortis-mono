package com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.aggregators

import com.datastax.spark.connector._
import com.datastax.spark.connector.writer.SqlRowWriter
import com.microsoft.partnercatalyst.fortis.spark.dba.ConfigurationManager
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.CassandraConjunctiveTopics
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.dto.{ConjunctiveTopic, Event}
import org.apache.spark.rdd.RDD
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.Constants._

class ConjunctiveTopicsOffineAggregator(configurationManager: ConfigurationManager) extends (RDD[Event] => Unit) {
  override def apply(events: RDD[Event]): Unit = {
    val topics = aggregate(events).cache()
    topics.count() match {
      case 0 => return
      case _ =>
        implicit val rowWriter: SqlRowWriter.Factory.type = SqlRowWriter.Factory
        topics.saveToCassandra(KeyspaceName, Table.ConjunctiveTopics)
    }

    topics.unpersist(blocking = true)
  }

  private[aggregators] def aggregate(events: RDD[Event]): RDD[ConjunctiveTopic] = {
    val siteSettings = configurationManager.fetchSiteSettings(events.sparkContext)
    val conjunctiveTopics = events.flatMap(CassandraConjunctiveTopics(_, siteSettings.defaultzoom))

    conjunctiveTopics.keyBy(r=>{(
      r.pipelinekey, r.externalsourceid,
      r.periodtype, r.perioddate,
      r.topic, r.conjunctivetopic,
      r.tileid, r.tilez
    )}).reduceByKey((a,b)=>{
      a.copy(mentioncount = a.mentioncount+b.mentioncount)
    }).values
  }
}
