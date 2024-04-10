package com.demstorage.grpc

import com.demstorage.stubs.MemberOperationsGrpc
import com.demstorage.stubs.RegisterMemberRequest
import com.demstorage.stubs.RegisterMemberResponse
import io.grpc.stub.StreamObserver
import net.devh.boot.grpc.server.service.GrpcService

@GrpcService
class GrpcMemberOperations : MemberOperationsGrpc.MemberOperationsImplBase() {

    override fun registerMember(
        request: RegisterMemberRequest,
        responseObserver: StreamObserver<RegisterMemberResponse>
    ) {
        println("register member, $request")
        super.registerMember(request, responseObserver)
    }
}
