package com.petfinder.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.petfinder.backend.entity.Blog;
import com.petfinder.backend.entity.enums.BlogType;

public interface BlogRepository extends JpaRepository<Blog, Long> {

    List<Blog> findByBlogTypeOrderByCreatedAtDesc(BlogType blogType);

    List<Blog> findByUserId(Long userId);

    @Query("SELECT b FROM Blog b LEFT JOIN b.pet p LEFT JOIN b.location l WHERE " +
            "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:location IS NULL OR LOWER(l.province) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:petType IS NULL OR p.petType = :petType) AND " +
            "(:blogType IS NULL OR b.blogType = :blogType)")
    List<Blog> searchBlogs(@Param("title") String title, @Param("location") String location, @Param("petType") String petType, @Param("blogType") BlogType blogType);
}
