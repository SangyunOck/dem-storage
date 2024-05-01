package com.demstorage.node

import com.demstorage.node.repository.ExposedNodeRepository
import com.demstorage.node.repository.NodeRepository
import com.demstorage.node.service.StandardNodeOperations
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class NodeConfiguration {

    @Bean
    fun nodeRepository() = ExposedNodeRepository()

    @Bean
    fun nodeOperations(
        nodeRepository: NodeRepository,
    ) = StandardNodeOperations(nodeRepository)
}
