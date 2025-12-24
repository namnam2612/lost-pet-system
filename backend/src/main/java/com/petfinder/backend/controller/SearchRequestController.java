package com.petfinder.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petfinder.backend.entity.SearchRequest;
import com.petfinder.backend.repository.PaymentRepository;
import com.petfinder.backend.repository.SearchRequestRepository;
import com.petfinder.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/services")
public class SearchRequestController {

    @Autowired
    private SearchRequestRepository requestRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    // API: Gửi yêu cầu dịch vụ mới (trước đây là search-requests)
    @PostMapping
    public SearchRequest createRequest(@RequestBody SearchRequest request) {
        request.setCreatedAt(LocalDateTime.now());
        request.setStatus("CREATED");
        // Ensure default price if not provided
        if (request.getPrice() == null) request.setPrice(500000L);

        // Link user if provided in request body (e.g., { ..., user: { id: 1 } })
        if (request.getUser() != null && request.getUser().getId() != null) {
            userRepository.findById(request.getUser().getId()).ifPresent(request::setUser);
        }
        return requestRepository.save(request);
    }

    // API Admin 1: Lấy tất cả yêu cầu dịch vụ
    // GET http://localhost:8080/api/services
    @GetMapping
    public List<SearchRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    // API: Lấy danh sách yêu cầu của một user cụ thể
    @GetMapping("/user/{userId}")
    public List<SearchRequest> getRequestsByUser(@PathVariable Long userId) {
        return requestRepository.findByUserId(userId);
    }

    // API Admin 2: Cập nhật trạng thái dịch vụ
    // PUT http://localhost:8080/api/services/1/status?status=PROCESSING
    @PutMapping("/{id}/status")
    public SearchRequest updateStatus(@PathVariable Long id, @RequestParam String status) {
        SearchRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu!"));

        request.setStatus(status);
        return requestRepository.save(request);
    }

    // API: Admin xác nhận thanh toán -> cập nhật SearchRequest và tạo bản ghi Payment
    // PUT http://localhost:8080/api/services/1/payment with body: {status: 'PAID', billImageUrl: '...'}
    @PutMapping("/{id}/payment")
    public ResponseEntity<Void> updatePaymentStatus(@PathVariable Long id, @RequestBody PaymentRequest paymentRequest) {
        System.out.println("DEBUG: Running FIXED version for id " + id);
        SearchRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // If admin explicitly sends a status field (e.g., {status: 'PAID' or 'PAYMENT_INVALID'}) then update paymentStatus
        if (paymentRequest.getStatus() != null) {
            String s = paymentRequest.getStatus().toUpperCase();
            request.setPaymentStatus(s);

            // Nếu Admin xác nhận ĐÃ THANH TOÁN, kích hoạt trạng thái ĐANG TÌM KIẾM (nếu đơn đang mới tạo)
            if ("PAID".equalsIgnoreCase(s) && ("CREATED".equalsIgnoreCase(request.getStatus()) || "PENDING".equalsIgnoreCase(request.getStatus()))) {
                request.setStatus("PROCESSING");
            }

            // If admin marks the bill as invalid, mark the search request so frontend can show refund option
            if ("PAYMENT_INVALID".equalsIgnoreCase(s)) {
                request.setStatus("PAYMENT_INVALID");
            }
        }

        // If the client only uploads a bill image (user submitted bill), record it and set request to PROCESSING
        if (paymentRequest.getBillImageUrl() != null) {
            request.setBillImageUrl(paymentRequest.getBillImageUrl());
            // Do NOT mark as PAID here — admin must review and confirm payment.
            // Set paymentStatus to PENDING_VERIFICATION so Admin knows to check it
            request.setPaymentStatus("PENDING_VERIFICATION");
            if (!"FOUND".equalsIgnoreCase(request.getStatus())) {
                request.setStatus("PROCESSING");
            }
        }

        requestRepository.save(request);
        return ResponseEntity.ok().build();
    }

    // Admin decision: mark whether the missing pet was found or not
    // PUT http://localhost:8080/api/services/{id}/decision?found=true
    @PutMapping("/{id}/decision")
    public SearchRequest decideFound(@PathVariable Long id, @RequestParam boolean found) {
        SearchRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (found) {
            request.setStatus("FOUND");
        } else {
            // mark as NOT_FOUND but do not refund automatically
            request.setStatus("NOT_FOUND");
        }

        return requestRepository.save(request);
    }

    // Inner class để nhận request body
    public static class PaymentRequest {
        private String status;
        private String billImageUrl;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getBillImageUrl() { return billImageUrl; }
        public void setBillImageUrl(String billImageUrl) { this.billImageUrl = billImageUrl; }
    }
}