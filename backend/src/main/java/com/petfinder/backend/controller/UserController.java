package com.petfinder.backend.controller;

import com.petfinder.backend.dto.AuthResponse;
import com.petfinder.backend.dto.UserUpdateRequest;
import com.petfinder.backend.entity.User;
import com.petfinder.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public AuthResponse getUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new AuthResponse(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole());
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
        User saved = userRepository.save(u);
        return new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getPhone(), saved.getRole());
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }
}

