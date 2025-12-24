package com.petfinder.backend.dto.blog;

import java.time.LocalDate;

import com.petfinder.backend.entity.enums.BlogStatus;
import com.petfinder.backend.entity.enums.BlogType;
import com.petfinder.backend.dto.user.UserSummary; 

public class BlogDetailResponse {

    private Long id;
    private BlogType blogType;
    private BlogStatus blogStatus;
    private String title;

    private LocalDate createdAt;

    // PET
    private String petType;
    private String description;

    // LOCATION
    private String province;
    private String district;
    private String ward;
    private String detailAddress;
    private String imageUrl;
    private UserSummary user;

    // ===== GETTER / SETTER =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BlogType getBlogType() {
        return blogType;
    }

    public void setBlogType(BlogType blogType) {
        this.blogType = blogType;
    }

    public BlogStatus getBlogStatus() {
        return blogStatus;
    }

    public void setBlogStatus(BlogStatus blogStatus) {
        this.blogStatus = blogStatus;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public String getPetType() {
        return petType;
    }

    public void setPetType(String petType) {
        this.petType = petType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getWard() {
        return ward;
    }

    public void setWard(String ward) {
        this.ward = ward;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public UserSummary getUser() {
        return user;
    }

    public void setUser(UserSummary user) {
        this.user = user;
    }
} 
