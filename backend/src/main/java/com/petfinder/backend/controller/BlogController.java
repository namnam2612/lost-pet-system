package com.petfinder.backend.controller;

import com.petfinder.backend.dto.blog.BlogDetailResponse;
import com.petfinder.backend.dto.blog.BlogListResponse;
import com.petfinder.backend.dto.blog.CreateBlogRequest;
import com.petfinder.backend.entity.Blog;
import com.petfinder.backend.entity.Location;
import com.petfinder.backend.entity.Pet;
import com.petfinder.backend.entity.enums.BlogType;
import com.petfinder.backend.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @PostMapping
    public ResponseEntity<?> createBlog(@RequestBody CreateBlogRequest request) {

        Blog blog = new Blog();
        blog.setBlogType(request.getBlogType());

        Pet pet = new Pet();
        pet.setPetType(request.getPetType());
        pet.setDescription(request.getDescription());
        if (request.getImageUrl() != null) pet.setImageUrl(request.getImageUrl());

        Location location = new Location();
        location.setProvince(request.getProvince());
        location.setDistrict(request.getDistrict());
        location.setDetailAddress(request.getDetailAddress());


        return ResponseEntity.ok(
                blogService.createBlog(blog, pet, location)
        );
    }

    @GetMapping
    public List<BlogListResponse> getBlogs(
            @RequestParam BlogType type) {
        return blogService.getAllBlogs(type);
    }

    @GetMapping("/{id}")
    public BlogDetailResponse getBlogDetail(@PathVariable Long id) {
        return blogService.getBlogDetail(id);
    }

    @PutMapping("/{id}/image")
    public ResponseEntity<?> updateBlogImage(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String imageUrl = body.get("imageUrl");
        if (imageUrl == null) return ResponseEntity.badRequest().body("imageUrl is required");
        Blog updated = blogService.updateBlogImage(id, imageUrl);
        return ResponseEntity.ok().body("updated");
    }

}
