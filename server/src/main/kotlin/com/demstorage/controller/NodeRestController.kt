package com.demstorage.controller

import com.demstorage.node.domain.Node
import com.demstorage.node.domain.NodeIpAddress
import com.demstorage.node.domain.NodePeerId
import com.demstorage.node.service.AvailableNodeLoader
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/node")
class NodeRestController(
    private val availableNodeLoader: AvailableNodeLoader,
) {
    private val logger = KotlinLogging.logger {}

    companion object {
        private const val DEFAULT_NODE_LIMIT = 3
        private val STATIC_NODES = listOf(
            Node.create(
                peerId = NodePeerId("peerId1"),
                ipAddress = NodeIpAddress("123.456.789")
            ),
            Node.create(
                peerId = NodePeerId("peerId2"),
                ipAddress = NodeIpAddress("111.222.333")
            ),
            Node.create(
                peerId = NodePeerId("peerId3"),
                ipAddress = NodeIpAddress("123.123.123")
            ),
        )
    }

    @GetMapping("/available-nodes")
    fun getAvailableNodes(): AvailableNodeResponse {
        logger.info { "get available nodes" }
        // Todo Node 정상 연결된 후 교체 (STATIC_NODES -> nodes)
        val nodes = availableNodeLoader.load(DEFAULT_NODE_LIMIT)
        return AvailableNodeResponse(
            nodes = STATIC_NODES.map {
                AvailableNode(
                    peerId = it.peerId.value,
                    ipAddress = it.ipAddress.value,
                )
            }
        )
    }

    data class AvailableNode(
        val peerId: String,
        val ipAddress: String,
    )

    data class AvailableNodeResponse(
        val nodes: List<AvailableNode>,
    )
}
