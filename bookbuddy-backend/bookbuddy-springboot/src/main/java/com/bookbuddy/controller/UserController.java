package com.bookbuddy.controller;

import com.bookbuddy.model.User;
import com.bookbuddy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            User savedUser = userService.createUser(user);
            return ResponseEntity
                    .status(201)
                    .body("User created successfully with ID: " + savedUser.getUserId());
        } catch (Exception e) {
            // Handle any exception that occurs during save
            return ResponseEntity
                    .status(400)
                    .body("Failed to create user: " + e.getMessage());
        }
    }

}
