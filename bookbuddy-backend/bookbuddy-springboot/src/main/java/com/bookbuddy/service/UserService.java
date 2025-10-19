package com.bookbuddy.service;

import com.bookbuddy.exception.EmailAlreadyExistsException;
import com.bookbuddy.model.User;
import com.bookbuddy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        // Save the user, returns the row the user is saved
        //This is an object of the User Table
        return userRepository.save(user);
    }
}
