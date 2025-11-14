package com.bookbuddy.dto.UserDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder //easy and clear way to build objects
public class UserRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
}
