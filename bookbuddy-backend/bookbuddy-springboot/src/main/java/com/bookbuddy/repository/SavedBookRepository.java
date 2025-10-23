package com.bookbuddy.repository;

import com.bookbuddy.model.SavedBook;
import com.bookbuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedBookRepository extends JpaRepository<SavedBook, Long> {
    // Custom query to get all saved books for a specific user
    List<SavedBook> findByUser_UserId(Long userId);
    //Custom method that finds the row of user id with books idc
    Optional<SavedBook> findByUserAndGoogleBooksId(User user, String googleBooksId);

    @Query("SELECT s.savedBookId FROM SavedBook s WHERE s.user = :user AND s.googleBooksId = :googleBooksId")
    Optional<Long> findSavedBookIdByUserAndGoogleBooksId(@Param("user") User user,
                                                @Param("googleBooksId") String googleBooksId);


    boolean existsByUserAndGoogleBooksId(User user, String googleBooksId);
}
