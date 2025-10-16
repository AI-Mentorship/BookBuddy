package com.bookbuddy.repository;

import com.bookbuddy.model.SavedBooks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SavedBooksRepository extends JpaRepository<SavedBooks, Long> {
    // Custom query to get all saved books for a specific user
    List<SavedBooks> findByUser_UserId(Long userId);
}
