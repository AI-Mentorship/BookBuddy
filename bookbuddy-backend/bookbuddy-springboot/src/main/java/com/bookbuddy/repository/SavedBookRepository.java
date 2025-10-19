package com.bookbuddy.repository;

import com.bookbuddy.model.SavedBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SavedBookRepository extends JpaRepository<SavedBook, Long> {
    // Custom query to get all saved books for a specific user
    List<SavedBook> findByUser_UserId(Long userId);
}
