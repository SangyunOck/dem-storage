package com.demstorage.member.domain

import java.time.LocalDateTime

@JvmInline
value class MemberId(val value: String)
@JvmInline
value class MemberPassword(val value: String)

class Member(
    val id: MemberId,
    val password: MemberPassword,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    companion object {
        fun create(
            id: MemberId,
            password: MemberPassword,
        ): Member {
            return Member(
                id = id,
                password = password,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
            )
        }
    }
}
