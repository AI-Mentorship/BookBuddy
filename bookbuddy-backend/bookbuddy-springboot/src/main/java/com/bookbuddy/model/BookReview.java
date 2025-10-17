package com.bookbuddy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "book_review")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY) //Only returns one query at a time
    @JoinColumn(name = "user_id", nullable = false) //linking user_id in bb_users to user_id in book_review; linking primary key of bb_users to this one
    private User user;

    @Column(nullable = false)
    private String review;

    @Column(nullable = false)
    private String googleBooksId;

}
