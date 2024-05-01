package com.demstorage.node.service

import com.demstorage.node.NodeIpDuplicatedException
import com.demstorage.node.domain.Node
import com.demstorage.node.domain.NodeIpAddress
import com.demstorage.node.domain.NodeUUID
import com.demstorage.node.repository.NodeRepository
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface NodeOperations {
    fun register(nodeIpAddress: NodeIpAddress): NodeUUID
}

@Transactional
class StandardNodeOperations(
    private val nodeRepository: NodeRepository,
) : NodeOperations {
    override fun register(nodeIpAddress: NodeIpAddress): NodeUUID {
        val node = nodeRepository.findByIpAddress(nodeIpAddress)
        if (node != null) throw NodeIpDuplicatedException()

        return nodeRepository.save(
            Node.create(
                uuid = NodeUUID(UUID.randomUUID().toString()),
                ipAddress = nodeIpAddress,
            )
        ).uuid
    }
}
