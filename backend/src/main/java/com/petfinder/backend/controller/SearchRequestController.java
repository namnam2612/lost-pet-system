package com.petfinder.backend.controller;

import com.petfinder.backend.entity.SearchRequest;
import com.petfinder.backend.repository.SearchRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/search-requests")
public class SearchRequestController {

    @Autowired
    private SearchRequestRepository requestRepository;

    // API: Gửi yêu cầu tìm kiếm mới
    @PostMapping
    public SearchRequest createRequest(@RequestBody SearchRequest request) {
        request.setCreatedAt(LocalDateTime.now());
        request.setStatus("PENDING");
        return requestRepository.save(request);
    }

    // API Admin 1: Lấy tất cả yêu cầu để xem
    // GET http://localhost:8080/api/search-requests
    @GetMapping
    public List<SearchRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    // API Admin 2: Cập nhật trạng thái (Ví dụ: Đã tìm thấy, Đang xử lý)
    // PUT http://localhost:8080/api/search-requests/1/status?status=PROCESSING
    @PutMapping("/{id}/status")
    public SearchRequest updateStatus(@PathVariable Long id, @RequestParam String status) {
        SearchRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu!"));

        request.setStatus(status);
        return requestRepository.save(request);
    }

    // API: Admin xác nhận thanh toán
    // PUT http://localhost:8080/api/search-requests/1/payment?status=PAID
    @PutMapping("/{id}/payment")
    public SearchRequest updatePaymentStatus(@PathVariable Long id, @RequestParam String status) {
        SearchRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setPaymentStatus(status); // Đảm bảo trong Entity SearchRequest đã có field này (nếu chưa có thì thêm vào nhé!)
        return requestRepository.save(request);
    }
}