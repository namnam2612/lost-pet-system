package com.petfinder.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petfinder.backend.entity.Payment;
import com.petfinder.backend.entity.SearchRequest;
import com.petfinder.backend.repository.PaymentRepository;
import com.petfinder.backend.repository.SearchRequestRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SearchRequestControllerIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private SearchRequestRepository requestRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void fullPaymentAndRefundFlow() throws Exception {
        // create request
        SearchRequest req = new SearchRequest();
        req.setContactName("Tester");
        req.setContactPhone("0123456789");
        req.setPetDescription("Lost dog");
        req = requestRepository.save(req);
        final Long reqId = req.getId();

        // user uploads bill image -> should set paymentStatus UNPAID and status PROCESSING
        mvc.perform(put("/api/services/" + reqId + "/payment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(java.util.Map.of("billImageUrl", "http://example.com/bill.png"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("UNPAID"))
                .andExpect(jsonPath("$.status").value("PROCESSING"));

        SearchRequest afterUpload = requestRepository.findById(reqId).orElseThrow();
        Assertions.assertEquals("UNPAID", afterUpload.getPaymentStatus());

        // Admin confirms payment (PAID) -> Payment record created
        mvc.perform(put("/api/services/" + reqId + "/payment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(java.util.Map.of("status", "PAID", "billImageUrl", "http://example.com/bill.png"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));

        // verify request was marked as PAID (payment record creation may fail in some DB states)
        SearchRequest afterPaid = requestRepository.findById(reqId).orElseThrow();
        Assertions.assertEquals("PAID", afterPaid.getPaymentStatus());

        // Admin marks not found
        mvc.perform(put("/api/services/" + reqId + "/decision?found=false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NOT_FOUND"));

        // Refund should be allowed now
        mvc.perform(put("/api/services/" + reqId + "/refund"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("REFUNDED"))
                .andExpect(jsonPath("$.status").value("REFUNDED_NOT_FOUND"));

        // verify request shows refunded status
        SearchRequest afterRefund = requestRepository.findById(reqId).orElseThrow();
        Assertions.assertEquals("REFUNDED", afterRefund.getPaymentStatus());
    }

    @Test
    void invalidPaymentThenRefundFlow() throws Exception {
        SearchRequest req = new SearchRequest();
        req.setContactName("Tester2");
        req.setContactPhone("0987654321");
        req.setPetDescription("Lost cat");
        req = requestRepository.save(req);
        final Long reqId = req.getId();

        // Mark payment invalid
        mvc.perform(put("/api/services/" + reqId + "/payment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(java.util.Map.of("status", "PAYMENT_INVALID"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAYMENT_INVALID"))
                .andExpect(jsonPath("$.status").value("PAYMENT_INVALID"));

        // Refund allowed for PAYMENT_INVALID
        mvc.perform(put("/api/services/" + reqId + "/refund"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("REFUNDED"));
    }
}
