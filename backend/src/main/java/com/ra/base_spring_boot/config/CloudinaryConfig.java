package com.ra.base_spring_boot.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dfireq2op");
        config.put("api_key", "516693126687581");
        config.put("api_secret", "L4E20dGNttEQqtcIGALbKY_FKIw");
        return new Cloudinary(config);
    }
}
