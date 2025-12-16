package com.petfinder.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.petfinder.backend.dto.AuthResponse;
import com.petfinder.backend.dto.UserUpdateRequest;
import com.petfinder.backend.entity.User;
import com.petfinder.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public AuthResponse getUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new AuthResponse(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole(),
                u.getBankName(), u.getBankAccountNumber(), u.getBankAccountHolder(), u.getQrImageUrl());
    }

    @PutMapping("/{id}")
    public AuthResponse updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest req) {
        User u = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (req.getName() != null && !req.getName().isBlank()) {
            u.setName(req.getName());
        }
        if (req.getPhone() == null || req.getPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập số điện thoại");
        }
        u.setPhone(req.getPhone());
        // Nếu có thông tin ngân hàng / QR (thường admin sẽ cung cấp)
        if (req.getBankName() != null) u.setBankName(req.getBankName());
        if (req.getBankAccountNumber() != null) u.setBankAccountNumber(req.getBankAccountNumber());
        if (req.getBankAccountHolder() != null) u.setBankAccountHolder(req.getBankAccountHolder());
        if (req.getQrImageUrl() != null) u.setQrImageUrl(req.getQrImageUrl());
        User saved = userRepository.save(u);
        return new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getPhone(), saved.getRole(),
                saved.getBankName(), saved.getBankAccountNumber(), saved.getBankAccountHolder(), saved.getQrImageUrl());
    }

    // Lấy thông tin admin chính (namnam2612@petfinder.vn) để hiển thị thanh toán cho user
    @GetMapping("/admin")
    public AuthResponse getAdminPaymentInfo() {
        try {
            System.out.println("DEBUG: Fetching main admin user (namnam2612@petfinder.vn)");
            var adminOpt = userRepository.findByEmail("namnam2612@petfinder.vn");
            System.out.println("DEBUG: Admin found: " + adminOpt.isPresent());
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                System.out.println("DEBUG: Admin details - id:" + admin.getId() + ", name:" + admin.getName() + 
                    ", bankName:" + admin.getBankName() + ", bankAccountNumber:" + admin.getBankAccountNumber() + 
                    ", qrImageUrl:" + admin.getQrImageUrl());
                return new AuthResponse(admin.getId(), admin.getName(), admin.getEmail(), admin.getPhone(), admin.getRole(),
                        admin.getBankName(), admin.getBankAccountNumber(), admin.getBankAccountHolder(), admin.getQrImageUrl());
            } else {
                // If namnam2612 not found, try to get any admin
                System.out.println("DEBUG: namnam2612@petfinder.vn not found, trying to find any admin");
                adminOpt = userRepository.findFirstByRoleIgnoreCase("ADMIN");
                if (adminOpt.isPresent()) {
                    User admin = adminOpt.get();
                    System.out.println("DEBUG: Found fallback admin - id:" + admin.getId() + ", name:" + admin.getName());
                    return new AuthResponse(admin.getId(), admin.getName(), admin.getEmail(), admin.getPhone(), admin.getRole(),
                            admin.getBankName(), admin.getBankAccountNumber(), admin.getBankAccountHolder(), admin.getQrImageUrl());
                } else {
                    System.out.println("DEBUG: No admin found at all, returning placeholder");
                    return new AuthResponse(0L, "Admin", "namnam2612@petfinder.vn", "0912345678", "ADMIN", null, null, null, null);
                }
            }
        } catch (Exception e) {
            System.err.println("ERROR in getAdminPaymentInfo: " + e.getMessage());
            e.printStackTrace();
            return new AuthResponse(0L, "Admin", "namnam2612@petfinder.vn", "0912345678", "ADMIN", null, null, null, null);
        }
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }
}





