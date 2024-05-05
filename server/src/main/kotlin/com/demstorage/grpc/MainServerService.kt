package com.demstorage.grpc

import com.demstorage.node.domain.NodeIpAddress
import com.demstorage.node.domain.NodePeerId
import com.demstorage.node.service.NodeOperations
import com.demstorage.stubs.MainServerOperationsGrpc
import com.demstorage.stubs.RegisterNodeRequest
import com.demstorage.stubs.RegisterNodeResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.grpc.stub.StreamObserver
import net.devh.boot.grpc.server.service.GrpcService

@GrpcService
class MainServerService(
    private val nodeOperations: NodeOperations,
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
}
