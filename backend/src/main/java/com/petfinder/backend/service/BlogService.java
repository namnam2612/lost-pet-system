package com.petfinder.backend.service;

import com.petfinder.backend.dto.blog.BlogDetailResponse;
import com.petfinder.backend.dto.blog.BlogListResponse;
import com.petfinder.backend.entity.Blog;
import com.petfinder.backend.entity.Location;
import com.petfinder.backend.entity.Pet;
import com.petfinder.backend.entity.enums.BlogType;
import com.petfinder.backend.repository.BlogRepository;
import com.petfinder.backend.repository.LocationRepository;
import com.petfinder.backend.repository.PetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.petfinder.backend.dto.blog.BlogResponse;
import java.util.List;
import java.util.stream.Collectors;
import java.util.List;
import java.util.stream.Collectors;

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
            res.setBlogId(blog.getBlogId());
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

    public List<BlogListResponse> getAllBlogs(BlogType type) {

        List<Blog> blogs = blogRepository.findByBlogTypeOrderByCreatedAtDesc(type);

        return blogs.stream().map(blog -> {
            BlogListResponse res = new BlogListResponse();
            res.setBlogId(blog.getBlogId());
            res.setBlogType(blog.getBlogType());
            res.setCreatedAt(blog.getCreatedAt());

            if (blog.getPet() != null) {
                res.setPetType(blog.getPet().getPetType());
                res.setImageUrl(blog.getPet().getImageUrl());
            }

            if (blog.getLocation() != null) {
                res.setProvince(blog.getLocation().getProvince());
            }

            return res;
        }).collect(Collectors.toList());
    }

    public BlogDetailResponse getBlogDetail(Long blogId) {

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        BlogDetailResponse res = new BlogDetailResponse();

        res.setBlogId(blog.getBlogId());
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





