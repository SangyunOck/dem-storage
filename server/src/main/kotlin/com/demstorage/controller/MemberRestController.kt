package com.demstorage.controller

import com.demstorage.member.domain.MemberId
import com.demstorage.member.domain.MemberPassword
import com.demstorage.member.service.MemberOperations
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/member")
class MemberRestController(
    private val memberOperations: MemberOperations,
) {
    private val logger = KotlinLogging.logger {}

    @PostMapping
    fun join(
        @RequestBody request: MemberJoinRequest,
    ) {
        logger.info { "join member, request: $request" }
        memberOperations.join(
            MemberOperations.MemberJoinRequest(
                id = MemberId(request.id),
                password = MemberPassword(request.password),
            )
        )
    }

    @PostMapping("/login")
    fun login(
        @RequestBody request: MemberLoginRequest,
    ): MemberLoginResponse {
        logger.info { "login member, request: $request" }
        val member = memberOperations.login(
            MemberOperations.MemberLoginRequest(
                id = MemberId(request.id),
                password = MemberPassword(request.password),
            )
        )

        return MemberLoginResponse(
            id = member.id.value,
            createdAt = member.createdAt,
        )
    }

    data class MemberJoinRequest(
        val id: String,
        val password: String,
    )

    data class MemberLoginRequest(
        val id: String,
        val password: String,
    )

    data class MemberLoginResponse(
        val id: String,
        val createdAt: LocalDateTime,
    )
}
