package com.demstorage

import org.jetbrains.exposed.spring.SpringTransactionManager
import org.springframework.boot.jdbc.DataSourceBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Primary

@Configuration
class DatabaseConfiguration {

    /**
     * DataSourceBuilder는 HikariCP 의존성이 있어야 동작함.
     */
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    fun dataSourceProperties(): DataSourceProperties {
        return DataSourceProperties()
    }

    @Bean
    fun transactionManager(dataSource: DataSource): SpringTransactionManager {
        return SpringTransactionManager(dataSource)
    }
}
