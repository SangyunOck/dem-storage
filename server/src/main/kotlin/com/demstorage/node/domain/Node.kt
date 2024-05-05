package com.demstorage.node.domain

import java.time.LocalDateTime

@JvmInline
value class NodePeerId(val value: String)

@JvmInline
value class NodeIpAddress(val value: String)

class Node(
    val peerId: NodePeerId,
    val ipAddress: NodeIpAddress,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    companion object {
        fun create(
            peerId: NodePeerId,
            ipAddress: NodeIpAddress,
        ): Node {
            return Node(
                peerId = peerId,
                ipAddress = ipAddress,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
            )
        }
    }
}
