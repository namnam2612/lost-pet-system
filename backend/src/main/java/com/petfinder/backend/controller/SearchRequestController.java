package com.petfinder.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petfinder.backend.entity.SearchRequest;
import com.petfinder.backend.entity.Payment;
import com.petfinder.backend.repository.SearchRequestRepository;
import com.petfinder.backend.repository.PaymentRepository;

@RestController
@RequestMapping("/api/services")
public class SearchRequestController {

    @Autowired
    private SearchRequestRepository requestRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // API: Gửi yêu cầu dịch vụ mới (trước đây là search-requests)
    @PostMapping
    public SearchRequest createRequest(@RequestBody SearchRequest request) {
        request.setCreatedAt(LocalDateTime.now());
        request.setStatus("PENDING");
        // Ensure default price if not provided
        if (request.getPrice() == null) request.setPrice(500000L);
        return requestRepository.save(request);
    }

    // API Admin 1: Lấy tất cả yêu cầu dịch vụ
    // GET http://localhost:8080/api/services
    @GetMapping
    public List<SearchRequest> getAllRequests() {
        return requestRepository.findAll();
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
    public SearchRequest updatePaymentStatus(@PathVariable Long id, @RequestBody PaymentRequest paymentRequest) {
        SearchRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        System.out.println("[SearchRequestController] updatePaymentStatus called for id=" + id + " payload status=" + paymentRequest.getStatus() + " billImageUrl=" + paymentRequest.getBillImageUrl());

        // If admin explicitly sends a status field (e.g., {status: 'PAID'}) then update paymentStatus
        if (paymentRequest.getStatus() != null) {
            request.setPaymentStatus(paymentRequest.getStatus());
            // When admin confirms payment, mark the service status as PAID (not COMPLETED)
            if ("PAID".equalsIgnoreCase(paymentRequest.getStatus())) {
                request.setStatus("PAID");
            }
        }

        // If the client only uploads a bill image (user submitted bill), record it and set request to PROCESSING
        if (paymentRequest.getBillImageUrl() != null) {
            request.setBillImageUrl(paymentRequest.getBillImageUrl());
            // Do NOT mark as PAID here — admin must review and confirm payment.
            // But update service status so admin sees it needs attention.
            if (!"COMPLETED".equalsIgnoreCase(request.getStatus())) {
                request.setStatus("PROCESSING");
            }
        }

        SearchRequest saved = requestRepository.save(request);

        // create Payment record when status set to PAID (admin confirmed)
        if (paymentRequest.getStatus() != null && "PAID".equalsIgnoreCase(paymentRequest.getStatus())) {
            try {
                Payment payment = new Payment();
                payment.setService(saved);
                payment.setAmount(saved.getPrice());
                payment.setMethod("BANK_TRANSFER");
                payment.setStatus("PAID");
                payment.setBillImageUrl(paymentRequest.getBillImageUrl());
                // save via repository
                paymentRepository.save(payment);
                System.out.println("[SearchRequestController] Created Payment record for service id=" + saved.getId());
            } catch (Exception e) {
                System.err.println("Failed to create payment record: " + e.getMessage());
            }
        }

        return saved;
    }

    // Admin decision: mark whether the missing pet was found or not
    // PUT http://localhost:8080/api/services/{id}/decision?found=true
    @PutMapping("/{id}/decision")
    public SearchRequest decideFound(@PathVariable Long id, @RequestParam boolean found) {
        SearchRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (found) {
            request.setStatus("COMPLETED");
        } else {
            // mark as NOT_FOUND but do not refund automatically
            request.setStatus("NOT_FOUND");
        }

        return requestRepository.save(request);
    }

    // Admin initiates refund: sets paymentStatus to REFUNDED and keeps status as NOT_FOUND
    // PUT http://localhost:8080/api/services/{id}/refund
    @PutMapping("/{id}/refund")
    public SearchRequest refundPayment(@PathVariable Long id) {
        SearchRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Only allow refund when payment was confirmed
        if (!"PAID".equalsIgnoreCase(request.getPaymentStatus())) {
            throw new RuntimeException("Cannot refund a request that is not paid");
        }

        request.setPaymentStatus("REFUNDED");
        request.setStatus("NOT_FOUND");

        // Optionally, create a refund Payment record (status REFUNDED)
        try {
            Payment refund = new Payment();
            refund.setService(request);
            refund.setAmount(request.getPrice());
            refund.setMethod("REFUND");
            refund.setStatus("REFUNDED");
            paymentRepository.save(refund);
        } catch (Exception e) {
            System.err.println("Failed to create refund record: " + e.getMessage());
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