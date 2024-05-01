package com.demstorage

import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class DatabaseInitConfiguration(dataSource: DataSource) {

    init {
        val connection = dataSource.connection
        connection.createStatement().use {
            it.execute("DROP TABLE IF EXISTS member")
            it.execute(
                """
                CREATE TABLE member (
                    id varchar(36) PRIMARY KEY
                )
                """.trimIndent()
            )
        }
    }
}
