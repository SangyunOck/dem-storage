package com.demstorage.controller

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
    }

    @GetMapping("/available-nodes")
    fun getAvailableNodes(): AvailableNodeResponse {
        logger.info { "get available nodes" }
        val nodes = availableNodeLoader.load(DEFAULT_NODE_LIMIT)
        return AvailableNodeResponse(
            nodes = nodes.map {
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
