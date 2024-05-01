package com.demstorage.member.service

import com.demstorage.member.MemberIdDuplicationException
import com.demstorage.member.MemberNotFoundException
import com.demstorage.member.domain.Member
import com.demstorage.member.domain.MemberId
import com.demstorage.member.domain.MemberPassword
import com.demstorage.member.repository.MemberRepository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

interface MemberOperations {
    // 회원가입
    fun join(request: MemberJoinRequest): MemberId

    // 로그인
    fun login(request: MemberLoginRequest): MemberSummary

    data class MemberJoinRequest(
        val id: MemberId,
        val password: MemberPassword,
    )

    data class MemberLoginRequest(
        val id: MemberId,
        val password: MemberPassword,
    )

    data class MemberSummary(
        val id: MemberId,
        val createdAt: LocalDateTime,
    )
}

@Transactional
class StandardMemberOperations(
    private val memberRepository: MemberRepository,
) : MemberOperations {

    override fun join(request: MemberOperations.MemberJoinRequest): MemberId {
        val existMember = memberRepository.findByMemberId(request.id)
        if (existMember != null) {
            throw MemberIdDuplicationException()
        }

        val member = Member.create(
            id = request.id,
            password = request.password,
        )
        return memberRepository.save(member).id
    }

    override fun login(request: MemberOperations.MemberLoginRequest): MemberOperations.MemberSummary {
        val member = memberRepository.findByMemberIdAndPassword(request.id, request.password)
            ?: throw MemberNotFoundException()

        return MemberOperations.MemberSummary(
            id = member.id,
            createdAt = member.createdAt,
        )
    }
}
