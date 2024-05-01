package com.demstorage.grpc

import com.demstorage.member.domain.MemberId
import com.demstorage.member.service.MemberOperations
import com.demstorage.stubs.MemberOperationsGrpc
import com.demstorage.stubs.RegisterMemberRequest
import com.demstorage.stubs.RegisterMemberResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import io.grpc.stub.StreamObserver
import net.devh.boot.grpc.server.service.GrpcService

@GrpcService
class GrpcMemberOperations(
    private val memberOperations: MemberOperations,
) : MemberOperationsGrpc.MemberOperationsImplBase() {

    override fun registerMember(
        request: RegisterMemberRequest,
        responseObserver: StreamObserver<RegisterMemberResponse>
    ) {
        logger.info { "register member, request: $request" }

        memberOperations.create(
            id = MemberId(request.peerId)
        )

        val response = RegisterMemberResponse.newBuilder().build()
        responseObserver.onNext(response)
        responseObserver.onCompleted()
    }

    companion object {
        private val logger = KotlinLogging.logger {}
    }
}
