package com.petfinder.backend.controller;

import com.petfinder.backend.entity.Post;
import com.petfinder.backend.entity.User;
import com.petfinder.backend.repository.PostRepository;
import com.petfinder.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    // API: Lấy danh sách (Có hỗ trợ tìm kiếm & lọc)
    @GetMapping
    public List<Post> getAllPosts(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String petType
    ) {
        // Nếu title không rỗng, ta vẫn tìm kiếm dù user nhập "mèo" hay "MÈO" (xử lý ở DB hoặc để nguyên tùy bạn)
        // Ở đây ta gọi hàm searchPosts vừa viết ở Repository
        return postRepository.searchPosts(title, location, petType);
    }

    // 👇 ĐÂY LÀ ĐOẠN BẠN ĐANG THIẾU HOẶC CHƯA CHẠY 👇
    @PostMapping
    public Post createPost(@RequestBody Post post) {
        post.setCreatedAt(LocalDateTime.now());
        // Mặc định trạng thái là LOST nếu không gửi lên
        if (post.getStatus() == null) {
            post.setStatus("LOST");
        }
        if (post.getUser() != null && post.getUser().getId() != null) {
            User user = userRepository.findById(post.getUser().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
            post.setUser(user);
        } else {
            post.setUser(null);
        }
        return postRepository.save(post);
    }

    // API: Lấy chi tiết 1 bài viết theo ID
    // GET http://localhost:8080/api/posts/1
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(post -> ResponseEntity.ok(post))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser(@PathVariable Long userId) {
        return postRepository.findByUserId(userId);
    }

    @PutMapping("/{id}")
    public Post updatePost(@PathVariable Long id, @RequestBody Post updateRequest,
                           @RequestParam(required = false) Long userId) {
        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (userId != null && existing.getUser() != null && !existing.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không được sửa bài của người khác");
        }

        existing.setTitle(updateRequest.getTitle());
        existing.setDescription(updateRequest.getDescription());
        existing.setLocation(updateRequest.getLocation());
        existing.setPetType(updateRequest.getPetType());
        existing.setImageUrl(updateRequest.getImageUrl());
        if (updateRequest.getStatus() != null) {
            existing.setStatus(updateRequest.getStatus());
        }
        return postRepository.save(existing);
    }

    // ... import PutMapping, DeleteMapping ...

    // API: Admin cập nhật trạng thái bài viết (VD: Duyệt bài, Đánh dấu đã thấy)
    // PUT http://localhost:8080/api/posts/1/status?status=FOUND
    @PutMapping("/{id}/status")
    public Post updatePostStatus(@PathVariable Long id, @RequestParam String status) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setStatus(status);
        return postRepository.save(post);
    }

    // API: Admin xóa bài viết (Bài rác, lừa đảo)
    // DELETE http://localhost:8080/api/posts/1
    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (userId != null && existing.getUser() != null && !existing.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không được xóa bài của người khác");
        }
        postRepository.delete(existing);
    }
}