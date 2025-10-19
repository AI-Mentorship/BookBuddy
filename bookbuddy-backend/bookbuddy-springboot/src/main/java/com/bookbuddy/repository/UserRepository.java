package com.bookbuddy.repository;

import com.bookbuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Checks if a user exists with the given email
    boolean existsByEmail(String email);
}
