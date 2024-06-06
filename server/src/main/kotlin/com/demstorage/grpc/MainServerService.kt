package com.demstorage.grpc

import com.demstorage.node.domain.NodeIpAddress
import com.demstorage.node.domain.NodePeerId
import com.demstorage.node.service.AvailableNodeLoader
import com.demstorage.node.service.NodeOperations
import com.demstorage.stubs.ListAvailableNodesRequest
import com.demstorage.stubs.ListAvailableNodesResponse
import com.demstorage.stubs.ListAvailableNodesResponse.Node
import com.demstorage.stubs.MainServerOperationsGrpc
import com.demstorage.stubs.RegisterNodeRequest
import com.demstorage.stubs.RegisterNodeResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.grpc.stub.StreamObserver
import net.devh.boot.grpc.server.service.GrpcService

@GrpcService
class MainServerService(
    private val nodeOperations: NodeOperations,
    private val availableNodeLoader: AvailableNodeLoader,
) : MainServerOperationsGrpc.MainServerOperationsImplBase() {

    private val logger = KotlinLogging.logger {}
    override fun registerNode(
        request: RegisterNodeRequest,
        responseObserver: StreamObserver<RegisterNodeResponse>
    ) {

        logger.info { "register node, request: $request" }

        nodeOperations.register(
            ipAddress = NodeIpAddress(request.nodeIp),
            peerId = NodePeerId(request.peerId)
        )

        val response = RegisterNodeResponse.newBuilder().build()
        responseObserver.onNext(response)
        responseObserver.onCompleted()
    }

    override fun listAvailableNodes(
        request: ListAvailableNodesRequest,
        responseObserver: StreamObserver<ListAvailableNodesResponse>
    ) {
        logger.info { "get available nodes" }
        val nodes = availableNodeLoader.load(limit = 3)

        val response = ListAvailableNodesResponse.newBuilder().apply {
            nodes.forEach {
                addNodes(
                    Node.newBuilder().apply {
                        setNodeIp(it.ipAddress.value)
                        setPeerId(it.peerId.value)
                    }
                )
            }
        }.build()
        responseObserver.onNext(response)
        responseObserver.onCompleted()
    }
}
