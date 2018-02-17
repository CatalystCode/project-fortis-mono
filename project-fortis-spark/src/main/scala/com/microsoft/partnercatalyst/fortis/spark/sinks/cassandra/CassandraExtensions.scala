package com.microsoft.partnercatalyst.fortis.spark.sinks.cassandra

import com.datastax.spark.connector.cql.{CassandraConnector, Schema}
import org.apache.spark.rdd.RDD
import com.datastax.spark.connector.writer._
import com.datastax.spark.connector._

import scala.reflect.ClassTag

object CassandraExtensions {
  implicit class CassandraRDD[T](val rdd: RDD[T]) extends AnyVal {
    def dedupAndSaveToCassandra(keyspaceName: String, tableName: String)
      (implicit connector: CassandraConnector = CassandraConnector(rdd.sparkContext),
       rwf: RowWriterFactory[T], vt: ClassTag[T]): Unit = {
      val tableDef = Schema.tableFromCassandra(connector, keyspaceName, tableName)
      val rowWriter = implicitly[RowWriterFactory[T]].rowWriter(tableDef, tableDef.primaryKey.map(_.ref))
      val primaryKeySize = tableDef.primaryKey.length

      val keyedByPrimaryKey = rdd.keyBy(value => {
        val buffer = new Array[Any](primaryKeySize)
        rowWriter.readColumnValues(value, buffer)

        buffer.toList
      })

      val deduped = keyedByPrimaryKey.reduceByKey((v1, _) => v1)

      deduped.values.saveToCassandra(keyspaceName, tableName)
    }
  }
}
