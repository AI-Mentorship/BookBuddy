package com.bookbuddy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "saved_books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedBooks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long savedBookId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String googleBooksId;


}
