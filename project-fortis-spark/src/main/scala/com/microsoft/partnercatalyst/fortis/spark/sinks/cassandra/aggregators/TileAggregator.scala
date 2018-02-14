package com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.aggregators

import com.microsoft.partnercatalyst.fortis.spark.dba.ConfigurationManager
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.dto.{Event, TileRow}
import com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra.{PeriodType, TileRows}
import org.apache.spark.rdd.RDD
import com.datastax.spark.connector._
import com.microsoft.partnercatalyst.fortis.spark.logging.{FortisTelemetry, Timer}

import FortisTelemetry.{get => Log}

class TileAggregator(configurationManager: ConfigurationManager, keyspace: String) extends (RDD[Event] => Unit) {
  override def apply(events: RDD[Event]): Unit = {
    val defaultZoom = configurationManager.fetchSiteSettings(events.sparkContext).defaultzoom

    // Partition tile rows by partition key of heatmap table which is shared by all other tile aggregation tables
    // as well. This way, the results of all aggregations below will land on the same Cassandra nodes the they were
    // computed on in Spark.
    val tileRows = events.flatMap(TileRows(_, defaultZoom)).repartitionByCassandraReplica("fortis", "heatmap").cache()

    Timer.time(Log.logDependency("sinks.cassandra", s"saveEventPlaces", _, _)) {
      saveEventPlaces(tileRows)
    }

    Timer.time(Log.logDependency("sinks.cassandra", s"savePopularPlaces", _, _)) {
      savePopularPlaces(tileRows)
    }

    Timer.time(Log.logDependency("sinks.cassandra", s"saveHeatmap", _, _)) {
      saveHeatmap(tileRows)
    }

    Timer.time(Log.logDependency("sinks.cassandra", s"saveComputedTiles", _, _)) {
      saveComputedTiles(tileRows)
    }

    Timer.time(Log.logDependency("sinks.cassandra", s"savePopularSources", _, _)) {
      savePopularSources(tileRows)
    }

    Timer.time(Log.logDependency("sinks.cassandra", s"savePopularTopics", _, _)) {
      savePopularTopics(tileRows)
    }

    tileRows.unpersist(blocking = true)
  }

  private[aggregators] def saveEventPlaces(tiles: RDD[TileRow]): Unit = {
    // TODO: ensure unneeded properties are ignored
    val eventPlaces = tiles.filter(tile =>
      // de-dup since event places are period-agnostic
      tile.periodtype == PeriodType.Day.periodTypeName

        // Remove "all" category events
        && tile.externalsourceid != "all"
        && tile.pipelinekey != "all"
    )

    eventPlaces.saveToCassandra(keyspace, "eventplacesbysource")
    eventPlaces.saveToCassandra(keyspace, "eventplaces") // these writes can land on any partition
    eventPlaces.saveToCassandra(keyspace, "eventsbypipeline") // these writes can land on any partition
  }

  private[aggregators] def savePopularPlaces(tiles: RDD[TileRow]): Unit = {
    // TODO: ensure unneeded properties are ignored
    tiles.saveToCassandra(keyspace, "popularplaces")
  }

  private[aggregators] def saveHeatmap(tiles: RDD[TileRow]): Unit = {
    // TODO: ensure unneeded properties are ignored
    tiles.saveToCassandra(keyspace, "heatmap")
  }

  private[aggregators] def saveComputedTiles(tiles: RDD[TileRow]): Unit = {
    // TODO: ensure heatmapid is being ignored by save
    tiles.saveToCassandra(keyspace, "computedtiles")
  }

  private[aggregators] def savePopularSources(tiles: RDD[TileRow]): Unit = {
    // TODO: ensure heatmapid is being ignored by save
    tiles.saveToCassandra(keyspace, "popularsources") // these writes can land on any partition
  }

  private[aggregators] def savePopularTopics(tiles: RDD[TileRow]): Unit = {
    tiles.filter(tile => tile.conjunctiontopic2 == "" && tile.conjunctiontopic3 == "")
      .saveToCassandra(keyspace, "populartopics")
  }
}
