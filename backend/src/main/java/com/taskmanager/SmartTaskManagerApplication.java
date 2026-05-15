package com.taskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoAuditing
@EnableCaching
@EnableScheduling
@EnableAsync
public class SmartTaskManagerApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartTaskManagerApplication.class, args);
    }
}
