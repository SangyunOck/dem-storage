package com.demstorage

import org.jetbrains.exposed.spring.SpringTransactionManager
import org.springframework.boot.jdbc.DataSourceBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class DemStorageConfiguration {

    /**
     * DataSourceBuilder는 HikariCP 의존성이 있어야 동작함.
     */
    @Bean
    fun datasource(): DataSource = DataSourceBuilder.create()
        .url("jdbc:sqlite:./database.db")
        .driverClassName("org.sqlite.JDBC")
        .build()

    @Bean
    fun transactionManager(dataSource: DataSource): SpringTransactionManager {
        return SpringTransactionManager(dataSource)
    }
}
