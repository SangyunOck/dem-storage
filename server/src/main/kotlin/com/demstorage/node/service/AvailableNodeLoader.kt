package com.demstorage.node.service

import com.demstorage.node.domain.Node
import com.demstorage.node.domain.NodeIpAddress
import com.demstorage.stubs.CheckNodeRequest
import com.demstorage.stubs.NodeOperationsGrpc
import io.github.oshai.kotlinlogging.KotlinLogging
import io.grpc.ManagedChannel
import io.grpc.ManagedChannelBuilder

interface AvailableNodeLoader {
    fun load(): List<Node>
}

class StandardAvailableNodeLoader(
    private val nodeOperations: NodeOperations
) : AvailableNodeLoader {

    private val logger = KotlinLogging.logger {}

    private fun buildChannel(ipAddress: NodeIpAddress): ManagedChannel {
        return ManagedChannelBuilder.forAddress(ipAddress.value, 8000)
            .usePlaintext()
            .build()
    }

    override fun load(): List<Node> {
        val nodes = nodeOperations.findAll()
        if (nodes.isEmpty()) return emptyList()

        val availableNodes = nodes.mapNotNull { node ->
            val channel = buildChannel(node.ipAddress)
            val stub = NodeOperationsGrpc.newBlockingStub(channel)

            runCatching {
                val request = CheckNodeRequest.newBuilder().build()
                val response = stub.checkNode(request)

                if (response.isAvailable) {
                    node
                } else null
            }.onFailure { e ->
                logger.error(e) { "Failed to check node: ${node.ipAddress}" }
            }.getOrNull()
        }

        return availableNodes
    }
}
