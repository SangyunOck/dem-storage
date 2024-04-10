package com.demstorage.member.repository

import org.jetbrains.exposed.sql.Table

object MemberEntity : Table("member") {
    val id = varchar("id", 36)
    override val primaryKey: PrimaryKey
        get() = PrimaryKey(id)
}
