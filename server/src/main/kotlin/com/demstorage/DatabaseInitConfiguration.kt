package com.demstorage

import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class DatabaseInitConfiguration(dataSource: DataSource) {

    init {
        val connection = dataSource.connection
        connection.createStatement().use {
            /**
             * 회원 정보 테이블 생성
             */
            it.execute("DROP TABLE IF EXISTS member")
            it.execute(
                """
                CREATE TABLE member (
                    id varchar(50) PRIMARY KEY COMMENT '회원 아이디',
                    password varchar(50) NOT NULL COMMENT '비밀번호',
                    created_at datetime NOT NULL COMMENT '생성일시',
                    updated_at datetime NOT NULL COMMENT '수정일시'
                )
                """.trimIndent()
            )

            /**
             * Node 정보 테이블 생성
             */
            it.execute("DROP TABLE IF EXISTS node")
            it.execute(
                """
                CREATE TABLE node (
                    peer_id varchar(255) PRIMARY KEY COMMENT '노드 peer 아이디',
                    ip_address varchar(255) NOT NULL COMMENT '노드 ip 주소',
                    created_at datetime NOT NULL COMMENT '생성일시',
                    updated_at datetime NOT NULL COMMENT '수정일시'
                )
                """.trimIndent()
            )
        }
    }
}
