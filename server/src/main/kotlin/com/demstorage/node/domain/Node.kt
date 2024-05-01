package com.demstorage.node.domain

import java.time.LocalDateTime

@JvmInline
value class NodeUUID(val value: String)

@JvmInline
value class NodeIpAddress(val value: String)

class Node(
    val uuid: NodeUUID,
    val ipAddress: NodeIpAddress,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    companion object {
        fun create(
            uuid: NodeUUID,
            ipAddress: NodeIpAddress,
        ): Node {
            return Node(
                uuid = uuid,
                ipAddress = ipAddress,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
            )
        }
    }
}
