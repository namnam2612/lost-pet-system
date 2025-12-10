package com.petfinder.backend.repository;

import com.petfinder.backend.entity.SearchRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchRequestRepository extends JpaRepository<SearchRequest, Long> {
    // Hiện tại chưa cần hàm custom nào
}