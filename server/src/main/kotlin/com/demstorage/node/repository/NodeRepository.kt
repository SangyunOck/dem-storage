package com.demstorage.node.repository

import com.demstorage.node.domain.Node
import com.demstorage.node.domain.NodeIpAddress
import com.demstorage.node.domain.NodeUUID
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.upsert

interface NodeRepository {
    fun save(node: Node): Node
    fun findByIpAddress(ipAddress: NodeIpAddress): Node?
}

class ExposedNodeRepository : NodeRepository {

    override fun findByIpAddress(ipAddress: NodeIpAddress): Node? {
        return transaction {
            NodeEntity
                .selectAll()
                .andWhere { NodeEntity.ipAddress eq ipAddress.value }
                .firstOrNull()
                ?.let { NodeEntity.toNode(it) }
        }
    }

    override fun save(node: Node): Node {
        return transaction {
            NodeEntity.upsert {
                it[uuid] = node.uuid.value
                it[ipAddress] = node.ipAddress.value
                it[createdAt] = node.createdAt
                it[updatedAt] = node.updatedAt
            }
            node
        }
    }
}

private fun NodeEntity.toNode(row: ResultRow): Node {
    return Node(
        uuid = NodeUUID(row[uuid]),
        ipAddress = NodeIpAddress(row[ipAddress]),
        createdAt = row[createdAt],
        updatedAt = row[updatedAt],
    )
}
