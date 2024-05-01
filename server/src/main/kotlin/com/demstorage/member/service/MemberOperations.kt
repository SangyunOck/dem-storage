package com.demstorage.member.service

import com.demstorage.member.domain.Member
import com.demstorage.member.domain.MemberId
import com.demstorage.member.repository.MemberRepository
import org.springframework.transaction.annotation.Transactional

interface MemberOperations {
    fun create(id: MemberId): Member
}

@Transactional
class StandardMemberOperations(
    private val memberRepository: MemberRepository,
) : MemberOperations {
    override fun create(id: MemberId): Member {
        val member = Member.create(id)
        return memberRepository.save(member)
    }
}
