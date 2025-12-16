package com.petfinder.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petfinder.backend.dto.blog.BlogDetailResponse;
import com.petfinder.backend.dto.blog.BlogListResponse;
import com.petfinder.backend.dto.blog.CreateBlogRequest;
import com.petfinder.backend.entity.Blog;
import com.petfinder.backend.entity.Location;
import com.petfinder.backend.entity.Pet;
import com.petfinder.backend.entity.enums.BlogStatus;
import com.petfinder.backend.entity.enums.BlogType;
import com.petfinder.backend.repository.BlogRepository;
import com.petfinder.backend.repository.UserRepository;
import com.petfinder.backend.service.BlogService;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService blogService;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    public BlogController(BlogService blogService, BlogRepository blogRepository, UserRepository userRepository) {
        this.blogService = blogService;
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createBlog(@RequestBody CreateBlogRequest request) {

        Blog blog = new Blog();
        blog.setBlogType(request.getBlogType());
        blog.setTitle(request.getTitle());

        Pet pet = new Pet();
        pet.setPetType(request.getPetType());
        pet.setDescription(request.getDescription());
        if (request.getImageUrl() != null) pet.setImageUrl(request.getImageUrl());

        Location location = new Location();
        location.setProvince(request.getLocation() != null ? request.getLocation() : request.getProvince());
        location.setDistrict(request.getDistrict());
        location.setDetailAddress(request.getDetailAddress());


        if (request.getUserId() != null) {
            userRepository.findById(request.getUserId()).ifPresent(blog::setUser);
        }

        Blog saved = blogService.createBlog(blog, pet, location);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlog(@PathVariable Long id, @RequestBody Map<String, Object> body, @RequestParam(required = false) Long userId) {
        Optional<Blog> maybe = blogRepository.findById(id);
        if (maybe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Blog blog = maybe.get();
        if (userId != null && blog.getUser() != null && !blog.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "not allowed"));
        }

        if (body.containsKey("title")) blog.setTitle((String) body.get("title"));
        if (body.containsKey("petType")) {
            if (blog.getPet() == null) {
                Pet p = new Pet();
                p.setBlog(blog);
                p.setPetType("UNKNOWN");
                blog.setPet(p);
            }
            blog.getPet().setPetType((String) body.get("petType"));
        }
        if (body.containsKey("description")) {
            if (blog.getPet() == null) {
                Pet p = new Pet();
                p.setBlog(blog);
                p.setPetType("UNKNOWN");
                blog.setPet(p);
            }
            blog.getPet().setDescription((String) body.get("description"));
        }
        if (body.containsKey("imageUrl")) {
            if (blog.getPet() == null) {
                Pet p = new Pet();
                p.setBlog(blog);
                p.setPetType("UNKNOWN");
                blog.setPet(p);
            }
            blog.getPet().setImageUrl((String) body.get("imageUrl"));
        }
        // support both 'province' and frontend 'location' fields
        if (body.containsKey("province") || body.containsKey("location")) {
            String prov = (String) (body.containsKey("province") ? body.get("province") : body.get("location"));
            if (blog.getLocation() == null) {
                Location loc = new Location();
                loc.setBlog(blog);
                blog.setLocation(loc);
            }
            blog.getLocation().setProvince(prov);
        }
        if (body.containsKey("status")) {
            try {
                blog.setBlogStatus(BlogStatus.valueOf((String) body.get("status")));
            } catch (Exception ignored) {}
        }

        Blog saved = blogRepository.save(blog);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        Optional<Blog> maybe = blogRepository.findById(id);
        if (maybe.isEmpty()) return ResponseEntity.notFound().build();
        Blog blog = maybe.get();
        if (userId != null && blog.getUser() != null && !blog.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "not allowed"));
        }
        blogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<BlogListResponse> getBlogs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String petType,
            @RequestParam(required = false) String type) {

        BlogType blogType = null;
        if (type != null && !type.isBlank()) {
            try {
                blogType = BlogType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore invalid type
            }
        }

        String searchTitle = (title != null && !title.isBlank()) ? title : null;
        String searchLocation = (location != null && !location.isBlank()) ? location : null;
        String searchPetType = (petType != null && !petType.isBlank()) ? petType : null;

        return blogService.searchBlogs(searchTitle, searchLocation, searchPetType, blogType);
    }

    @GetMapping("/user/{userId}")
    public List<BlogListResponse> getBlogsByUser(@PathVariable Long userId) {
        return blogService.getBlogsByUser(userId);
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
