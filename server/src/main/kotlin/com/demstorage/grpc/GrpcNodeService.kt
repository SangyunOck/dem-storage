package com.demstorage.grpc

import com.demstorage.node.domain.NodeIpAddress
import com.demstorage.node.service.NodeOperations
import com.demstorage.stubs.NodeOperationsGrpc
import com.demstorage.stubs.RegisterNodeRequest
import com.demstorage.stubs.RegisterNodeResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.grpc.stub.StreamObserver
import net.devh.boot.grpc.server.service.GrpcService

@GrpcService
class GrpcNodeService(
    private val nodeOperations: NodeOperations,
) : NodeOperationsGrpc.NodeOperationsImplBase() {

    private val logger = KotlinLogging.logger {}
    override fun registerNode(
        request: RegisterNodeRequest,
        responseObserver: StreamObserver<RegisterNodeResponse>
    ) {

        logger.info { "register node, request: $request" }

        val nodeUUID = nodeOperations.register(NodeIpAddress(request.nodeIp))

        val response = RegisterNodeResponse.newBuilder()
            .setNodeUuid(nodeUUID.value)
            .setNodeIp(request.nodeIp)
            .build()
        responseObserver.onNext(response)
        responseObserver.onCompleted()
    }
}
