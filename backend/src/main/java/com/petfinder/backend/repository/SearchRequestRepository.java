package com.petfinder.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.petfinder.backend.entity.SearchRequest;

@Repository
public interface SearchRequestRepository extends JpaRepository<SearchRequest, Long> {
    List<SearchRequest> findByUserId(Long userId);
}