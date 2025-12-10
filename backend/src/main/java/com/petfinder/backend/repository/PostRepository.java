package com.petfinder.backend.repository;

import com.petfinder.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Viết câu lệnh SQL (JPQL) để tìm kiếm linh hoạt
    // Logic: Nếu tham số truyền vào là NULL thì bỏ qua điều kiện đó (lấy tất cả)
    @Query("SELECT p FROM Post p WHERE " +
            "(:title IS NULL OR p.title LIKE %:title%) AND " +
            "(:location IS NULL OR p.location LIKE %:location%) AND " +
            "(:petType IS NULL OR p.petType = :petType)")
    List<Post> searchPosts(
            @Param("title") String title,
            @Param("location") String location,
            @Param("petType") String petType
    );

    List<Post> findByUserId(Long userId);
}