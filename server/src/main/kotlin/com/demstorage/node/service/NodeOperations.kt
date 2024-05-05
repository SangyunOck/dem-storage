package com.demstorage.node.service

import com.demstorage.node.NodeIpDuplicatedException
import com.demstorage.node.domain.Node
import com.demstorage.node.domain.NodeIpAddress
import com.demstorage.node.domain.NodePeerId
import com.demstorage.node.repository.NodeRepository
import org.springframework.transaction.annotation.Transactional

interface NodeOperations {
    fun register(
        ipAddress: NodeIpAddress,
        peerId: NodePeerId,
    ): NodePeerId
}

@Transactional
class StandardNodeOperations(
    private val nodeRepository: NodeRepository,
) : NodeOperations {
    override fun register(
        ipAddress: NodeIpAddress,
        peerId: NodePeerId,
    ): NodePeerId {
        val node = nodeRepository.findByIpAddress(ipAddress)
        if (node != null) throw NodeIpDuplicatedException()

        return nodeRepository.save(
            Node.create(
                peerId = peerId,
                ipAddress = ipAddress,
            )
        ).peerId
    }
}
