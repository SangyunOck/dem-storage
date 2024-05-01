package com.demstorage.member.domain

@JvmInline
value class MemberId(val value: String)

class Member(
    val id: MemberId
) {
    companion object {
        fun create(id: MemberId): Member {
            return Member(id)
        }
    }
}
