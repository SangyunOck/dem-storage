package com.demstorage.member.repository

import com.demstorage.member.domain.Member
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction

interface MemberRepository {
    fun save(member: Member): Member
}

class ExposedMemberRepository : MemberRepository {
    override fun save(member: Member): Member {
        return transaction {
            MemberEntity.insert {
                it[id] = member.id.value
            }
            member
        }
    }
}
