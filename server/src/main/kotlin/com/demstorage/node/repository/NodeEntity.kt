package com.demstorage.node.repository

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object NodeEntity : Table("node") {
    val peerId = varchar("peer_id", 255)
    val ipAddress = varchar("ip_address", 255)
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")

    override val primaryKey: PrimaryKey
        get() = PrimaryKey(peerId)
}
