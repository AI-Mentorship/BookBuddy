package com.bookbuddy.service;

import com.bookbuddy.model.User;
import com.bookbuddy.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        // Optional: check for duplicate email
        if (userRepository.checkEmailExists(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Save the user
        return userRepository.save(user);
    }
}
