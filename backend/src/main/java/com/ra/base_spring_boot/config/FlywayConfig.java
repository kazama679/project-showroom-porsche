package com.ra.base_spring_boot.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Realigns Flyway checksums when a migration file was edited after it was already applied
 * (common in local dev). Remove or disable if you prefer strict validate-only behaviour.
 */
@Configuration
public class FlywayConfig
{
    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy()
    {
        return flyway ->
        {
            flyway.repair();
            flyway.migrate();
        };
    }
}
