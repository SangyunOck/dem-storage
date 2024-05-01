package com.demstorage.member.repository

import com.demstorage.member.domain.Member
import com.demstorage.member.domain.MemberId
import com.demstorage.member.domain.MemberPassword
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.upsert

interface MemberRepository {
    fun findByMemberId(memberId: MemberId): Member?
    fun findByMemberIdAndPassword(memberId: MemberId, password: MemberPassword): Member?
    fun save(member: Member): Member
}

class ExposedMemberRepository : MemberRepository {

    override fun findByMemberId(memberId: MemberId): Member? {
        return transaction {
            MemberEntity
                .selectAll()
                .andWhere { MemberEntity.id eq memberId.value }
                .firstOrNull()
                ?.let { MemberEntity.toMember(it) }
        }
    }

    override fun findByMemberIdAndPassword(memberId: MemberId, password: MemberPassword): Member? {
        return transaction {
            MemberEntity
                .selectAll()
                .andWhere { MemberEntity.id eq memberId.value }
                .andWhere { MemberEntity.password eq password.value }
                .firstOrNull()
                ?.let { MemberEntity.toMember(it) }
        }
    }

    override fun save(member: Member): Member {
        return transaction {
            MemberEntity.upsert {
                it[id] = member.id.value
                it[password] = member.password.value
                it[createdAt] = member.createdAt
                it[updatedAt] = member.updatedAt
            }
            member
        }
    }
}

private fun MemberEntity.toMember(resultRow: ResultRow): Member {
    return Member(
        id = MemberId(resultRow[id]),
        password = MemberPassword(resultRow[password]),
        createdAt = resultRow[createdAt],
        updatedAt = resultRow[updatedAt],
    )
}
