package com.petfinder.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petfinder.backend.dto.blog.BlogDetailResponse;
import com.petfinder.backend.dto.blog.BlogListResponse;
import com.petfinder.backend.dto.blog.BlogResponse;
import com.petfinder.backend.dto.user.UserSummary;
import com.petfinder.backend.entity.Blog;
import com.petfinder.backend.entity.Location;
import com.petfinder.backend.entity.Pet;
import com.petfinder.backend.entity.enums.BlogType;
import com.petfinder.backend.repository.BlogRepository;
import com.petfinder.backend.repository.LocationRepository;
import com.petfinder.backend.repository.PetRepository;

@Service
@Transactional
public class BlogService {

    private final BlogRepository blogRepository;
    private final PetRepository petRepository;
    private final LocationRepository locationRepository;

    // ✅ CONSTRUCTOR VIẾT TAY
    public BlogService(BlogRepository blogRepository,
                       PetRepository petRepository,
                       LocationRepository locationRepository) {
        this.blogRepository = blogRepository;
        this.petRepository = petRepository;
        this.locationRepository = locationRepository;
    }

    public Blog createBlog(Blog blog, Pet pet, Location location) {

        // liên kết 2 chiều
        pet.setBlog(blog);
        blog.setPet(pet);

        location.setBlog(blog);
        blog.setLocation(location);

        return blogRepository.save(blog);
    }

    public List<BlogResponse> getAllBlogs() {

        return blogRepository.findAll().stream().map(blog -> {

            BlogResponse res = new BlogResponse();
            res.setBlogId(blog.getBlogId()); // Keep for compatibility if needed, or update DTO
            res.setBlogType(blog.getBlogType());
            res.setBlogStatus(blog.getBlogStatus());
            res.setCreatedAt(blog.getCreatedAt());

            if (blog.getPet() != null) {
                res.setPetType(blog.getPet().getPetType());
                res.setDescription(blog.getPet().getDescription());
                res.setImageUrl(blog.getPet().getImageUrl());
            }

            if (blog.getLocation() != null) {
                res.setProvince(blog.getLocation().getProvince());
                res.setDistrict(blog.getLocation().getDistrict());
                res.setWard(blog.getLocation().getWard());
                res.setDetailAddress(blog.getLocation().getDetailAddress());
            }

            return res;
        }).collect(Collectors.toList());
    }

    public List<BlogListResponse> searchBlogs(String title, String location, String petType, BlogType type) {
        List<Blog> blogs;
        if (title == null && location == null && petType == null && type == null) {
            blogs = blogRepository.findAll();
        } else {
            blogs = blogRepository.searchBlogs(title, location, petType, type);
        }
        // Sort by newest
        blogs.sort((a, b) -> {
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            int cmp = b.getCreatedAt().compareTo(a.getCreatedAt());
            if (cmp != 0) return cmp;
            return b.getBlogId().compareTo(a.getBlogId());
        });

        return blogs.stream().map(blog -> {
            BlogListResponse res = new BlogListResponse();
            res.setId(blog.getBlogId());
            res.setBlogType(blog.getBlogType());
            res.setTitle(blog.getTitle());
            res.setStatus(blog.getBlogStatus().name());
            res.setCreatedAt(blog.getCreatedAt());

            if (blog.getPet() != null) {
                res.setPetType(blog.getPet().getPetType());
                res.setImageUrl(blog.getPet().getImageUrl());
                res.setDescription(blog.getPet().getDescription());
            }

            if (blog.getLocation() != null) {
                res.setLocation(blog.getLocation().getProvince());
            }

            return res;
        }).collect(Collectors.toList());
    }

    public List<BlogListResponse> getBlogsByUser(Long userId) {
        List<Blog> blogs = blogRepository.findByUserId(userId);
        return blogs.stream().map(blog -> {
            BlogListResponse res = new BlogListResponse();
            res.setId(blog.getBlogId());
            res.setBlogType(blog.getBlogType());
            res.setTitle(blog.getTitle());
            res.setStatus(blog.getBlogStatus().name());
            res.setCreatedAt(blog.getCreatedAt());

            if (blog.getPet() != null) {
                res.setPetType(blog.getPet().getPetType());
                res.setImageUrl(blog.getPet().getImageUrl());
                res.setDescription(blog.getPet().getDescription());
            }

            if (blog.getLocation() != null) {
                res.setLocation(blog.getLocation().getProvince());
            }

            return res;
        }).collect(Collectors.toList());
    }

    public BlogDetailResponse getBlogDetail(Long blogId) {

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        BlogDetailResponse res = new BlogDetailResponse();

        res.setId(blog.getBlogId());
        res.setBlogType(blog.getBlogType());
        res.setTitle(blog.getTitle());
        res.setBlogStatus(blog.getBlogStatus());
        res.setCreatedAt(blog.getCreatedAt());

        if (blog.getPet() != null) {
            res.setPetType(blog.getPet().getPetType());
            res.setDescription(blog.getPet().getDescription());
            res.setImageUrl(blog.getPet().getImageUrl());
        }

        if (blog.getLocation() != null) {
            res.setProvince(blog.getLocation().getProvince());
            res.setDistrict(blog.getLocation().getDistrict());
            res.setWard(blog.getLocation().getWard());
            res.setDetailAddress(blog.getLocation().getDetailAddress());
        }

        if (blog.getUser() != null) {
            var u = blog.getUser();
            res.setUser(new UserSummary(u.getId(), u.getName(), u.getPhone(), u.getEmail(), u.getRole()));
        }

        return res;
    }

    public Blog updateBlogImage(Long blogId, String imageUrl) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        if (blog.getPet() == null) {
            throw new RuntimeException("Blog has no pet to attach image to");
        }
        blog.getPet().setImageUrl(imageUrl);
        return blogRepository.save(blog);
    }


}
