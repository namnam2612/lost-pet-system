package com.petfinder.backend.dto;

public class AuthResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountHolder;
    private String qrImageUrl;

    public AuthResponse(Long id, String name, String email, String phone, String role) {
        this(id, name, email, phone, role, null, null, null, null);
    }

    public AuthResponse(Long id, String name, String email, String phone, String role,
                        String bankName, String bankAccountNumber, String bankAccountHolder, String qrImageUrl) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.bankName = bankName;
        this.bankAccountNumber = bankAccountNumber;
        this.bankAccountHolder = bankAccountHolder;
        this.qrImageUrl = qrImageUrl;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public String getBankName() {
        return bankName;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public String getBankAccountHolder() {
        return bankAccountHolder;
    }

    public String getQrImageUrl() {
        return qrImageUrl;
    }
}

