package com.demstorage.member.repository

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object MemberEntity : Table("member") {
    val id = varchar("id", 50)
    val password = varchar("password", 50)
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
    override val primaryKey: PrimaryKey
        get() = PrimaryKey(id)
}
