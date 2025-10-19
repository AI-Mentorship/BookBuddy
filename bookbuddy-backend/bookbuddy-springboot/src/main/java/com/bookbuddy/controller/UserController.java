package com.bookbuddy.controller;

import com.bookbuddy.dto.UserRequest;
import com.bookbuddy.dto.UserResponse;
import com.bookbuddy.model.User;
import com.bookbuddy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")

public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest userRequest) {
        //convert request -> entity
        User user = User.builder().
                email(userRequest.getEmail())
                .password(userRequest.getPassword())
                .firstName(userRequest.getFirstName())
                .lastName(userRequest.getLastName())
                .birthDate(userRequest.getBirthDate())
                .build();

        User savedUser = userService.createUser(user);

        UserResponse userResponse = UserResponse.builder().
                userId(savedUser.getUserId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName()).
                birthDate(savedUser.getBirthDate()).
                build();

        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

}
