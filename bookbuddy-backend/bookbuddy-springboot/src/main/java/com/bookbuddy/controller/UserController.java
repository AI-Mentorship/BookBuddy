package com.bookbuddy.controller;

import com.bookbuddy.dto.UserDTO.LoginRequest;
import com.bookbuddy.dto.UserDTO.UserRequest;
import com.bookbuddy.dto.UserDTO.UserResponse;
import com.bookbuddy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "${frontend.url}") // uses the variable

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

    @PutMapping("/update/{userId}")
    public ResponseEntity <UserResponse> updateUserInfo(@PathVariable Long userId, @RequestBody UserRequest userRequest) {
        UserResponse updatedInfo = userService.updateUserInfo(userId, userRequest);
        return ResponseEntity.status(HttpStatus.OK).body(updatedInfo);
    }

}
