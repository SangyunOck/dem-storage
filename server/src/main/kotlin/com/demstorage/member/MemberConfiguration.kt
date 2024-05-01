package com.demstorage.member

import com.demstorage.member.repository.ExposedMemberRepository
import com.demstorage.member.repository.MemberRepository
import com.demstorage.member.service.MemberOperations
import com.demstorage.member.service.StandardMemberOperations
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class MemberConfiguration {

    @Bean
    fun memberRepository() = ExposedMemberRepository()

    @Bean
    fun memberOperations(
        memberRepository: MemberRepository,
    ): MemberOperations {
        return StandardMemberOperations(memberRepository)
    }
}
