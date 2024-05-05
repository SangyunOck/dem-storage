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

    @GetMapping("/available-nodes")
    fun getAvailableNodes(): AvailableNodeResponse {
        logger.info { "get available nodes" }
        val nodes = availableNodeLoader.load()
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
