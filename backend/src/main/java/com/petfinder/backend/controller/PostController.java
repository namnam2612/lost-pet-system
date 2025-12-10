package com.petfinder.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts") // Đảm bảo dòng này đúng chính tả
public class PostController {

    @GetMapping
    public String getAllPosts() {
        return "Kết nối thành công! Đây là danh sách thú cưng.";
    }
}
//