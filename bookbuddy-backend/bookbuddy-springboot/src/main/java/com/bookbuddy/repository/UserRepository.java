package com.bookbuddy.repository;

import com.bookbuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Checks if a user exists with the given email
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

}
