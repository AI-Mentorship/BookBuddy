package com.bookbuddy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "books_read")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BooksRead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long readBookId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String googleBooksId;

    @Column(nullable = true)
    private String private_review;

    @Column(nullable = false)
    private double private_rating;
}
