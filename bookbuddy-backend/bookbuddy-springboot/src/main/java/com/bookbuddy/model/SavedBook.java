package com.bookbuddy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "saved_book",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "googleBooksId"})
        //Uniqueness for both columns together not individually
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedBook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long savedBookId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String googleBooksId;

}
