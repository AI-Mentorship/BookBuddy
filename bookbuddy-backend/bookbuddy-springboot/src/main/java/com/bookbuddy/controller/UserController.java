package com.bookbuddy.controller;

import com.bookbuddy.dto.LoginRequest;
import com.bookbuddy.dto.UserRequest;
import com.bookbuddy.dto.UserResponse;
import com.bookbuddy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173") // your frontend URL

public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signUp")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest userRequest) {
        UserResponse savedUser = userService.createUser(userRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PostMapping("/signIn")
    public ResponseEntity<UserResponse> signIn(@RequestBody LoginRequest loginRequest) {
        UserResponse response = userService.signIn(loginRequest);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
