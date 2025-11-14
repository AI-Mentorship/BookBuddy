package com.bookbuddy.service;

import com.bookbuddy.dto.UserDTO.LoginRequest;
import com.bookbuddy.dto.UserDTO.UserRequest;
import com.bookbuddy.dto.UserDTO.UserResponse;
import com.bookbuddy.exception.EmailAlreadyExistsException;
import com.bookbuddy.exception.InvalidCredentialsException;
import com.bookbuddy.exception.ResourceNotFoundException;
import com.bookbuddy.model.User;
import com.bookbuddy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .email(userRequest.getEmail())
                .password(passwordEncoder.encode(userRequest.getPassword())) // encode password
                .firstName(userRequest.getFirstName())
                .lastName(userRequest.getLastName())
                .birthDate(userRequest.getBirthDate())
                .build();

        User savedUser = userRepository.save(user);

        return UserResponse.builder()
                .userId(savedUser.getUserId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .birthDate(savedUser.getBirthDate())
                .build();
    }

    public UserResponse signIn(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid password");
        }

        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthDate(user.getBirthDate())
                .build();
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));
    }

    public UserResponse updateUserInfo(Long userId, UserRequest userRequest) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        currentUser.setEmail(userRequest.getEmail());
        String hashedPassword = passwordEncoder.encode(userRequest.getPassword());
        currentUser.setPassword(hashedPassword);
        currentUser.setFirstName(userRequest.getFirstName());
        currentUser.setLastName(userRequest.getLastName());
        currentUser.setBirthDate(userRequest.getBirthDate());


        userRepository.save(currentUser);


        return UserResponse.builder().
                userId(currentUser.getUserId()).
                email(currentUser.getEmail()).
                firstName(currentUser.getFirstName()).
                lastName(currentUser.getLastName()).
                birthDate(currentUser.getBirthDate()).
                build();
    }

}
