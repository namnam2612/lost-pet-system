package com.petfinder.backend.dto.blog;

import java.time.LocalDate;

import com.petfinder.backend.entity.enums.BlogType;

public class BlogListResponse {

    private Long blogId;
    private BlogType blogType;

    private String petType;
    private String province;
    private String imageUrl;

    private LocalDate createdAt;

    // ===== GETTER / SETTER =====

    public Long getBlogId() {
        return blogId;
    }

    public void setBlogId(Long blogId) {
        this.blogId = blogId;
    }

    public BlogType getBlogType() {
        return blogType;
    }

    public void setBlogType(BlogType blogType) {
        this.blogType = blogType;
    }

    public String getPetType() {
        return petType;
    }

    public void setPetType(String petType) {
        this.petType = petType;
    }

    public String getProvince() {
        return province;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
}
