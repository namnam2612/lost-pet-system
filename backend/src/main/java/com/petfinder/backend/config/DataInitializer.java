package com.petfinder.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;

import com.petfinder.backend.entity.User;
import com.petfinder.backend.repository.UserRepository;


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

    @Bean
    public CommandLineRunner fixOrphanPaymentsRunner(@Value("${app.db.fix-orphan-payments:false}") boolean fixOrphans, JdbcTemplate jdbc) {
        return args -> {
            if (!fixOrphans) return;
            System.out.println("[DataInitializer] app.db.fix-orphan-payments=true -> checking for orphan payments...");
            try {
                Integer count = jdbc.queryForObject(
                        "SELECT COUNT(*) FROM payments p LEFT JOIN search_requests s ON p.service_id = s.id WHERE s.id IS NULL",
                        Integer.class);
                System.out.println("[DataInitializer] Orphan payments found: " + count);
                if (count != null && count > 0) {
                    System.out.println("[DataInitializer] Deleting orphan payment rows...");
                    int deleted = jdbc.update("DELETE p FROM payments p LEFT JOIN search_requests s ON p.service_id = s.id WHERE s.id IS NULL");
                    System.out.println("[DataInitializer] Deleted orphan payment rows: " + deleted);
                }
            } catch (Exception ex) {
                System.err.println("[DataInitializer] Failed to check/delete orphan payments: " + ex.getMessage());
            }
        };
    }

    @Bean
    public CommandLineRunner dropPostsTableRunner(@Value("${app.db.drop-posts-table:false}") boolean dropPosts, JdbcTemplate jdbc) {
        return args -> {
            if (!dropPosts) return;
            System.out.println("[DataInitializer] app.db.drop-posts-table=true -> attempting to drop posts table if exists...");
            try {
                jdbc.execute("DROP TABLE IF EXISTS posts");
                System.out.println("[DataInitializer] Dropped posts table (if it existed).");
            } catch (Exception ex) {
                System.err.println("[DataInitializer] Failed to drop posts table: " + ex.getMessage());
            }
        };
    }
}

