package com.bookbuddy.repository;

import com.bookbuddy.model.ReadBook;
import com.bookbuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadBookRepository extends JpaRepository <ReadBook, Long> {
    boolean existsByUserAndGoogleBooksId(User user, String googleBooksId);

    @Query("SELECT r.readBookId FROM ReadBook r WHERE r.user = :user AND r.googleBooksId = :googleBooksId")
    Optional<Long> findReadBookIdByUserAndGoogleBooksId(@Param("user") User user,
                                                         @Param("googleBooksId") String googleBooksId);

    List<ReadBook> findByUser_UserId(Long userId);

    Optional<ReadBook> findByUserAndGoogleBooksId(User user, String googleBooksId);

}
