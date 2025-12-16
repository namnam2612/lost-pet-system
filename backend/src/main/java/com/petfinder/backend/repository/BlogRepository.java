package com.petfinder.backend.repository;

import com.petfinder.backend.entity.Blog;
import com.petfinder.backend.entity.enums.BlogType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Long> {

    List<Blog> findByBlogTypeOrderByCreatedAtDesc(BlogType blogType);
}
