package com.petfinder.backend.config;

import com.petfinder.backend.entity.User;
import com.petfinder.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository, BCryptPasswordEncoder encoder) {
        return args -> {
            String adminEmail = "admin@petfinder.vn";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(encoder.encode("admin123"));
                admin.setPhone("0000000000");
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }

            String secondAdminEmail = "namnam2612@petfinder.vn";
            if (!userRepository.existsByEmail(secondAdminEmail)) {
                User admin2 = new User();
                admin2.setName("namnam2612");
                admin2.setEmail(secondAdminEmail);
                admin2.setPassword(encoder.encode("namnam2612"));
                admin2.setPhone("0912345678");
                admin2.setRole("ADMIN");
                userRepository.save(admin2);
            }
        };
    }
}

