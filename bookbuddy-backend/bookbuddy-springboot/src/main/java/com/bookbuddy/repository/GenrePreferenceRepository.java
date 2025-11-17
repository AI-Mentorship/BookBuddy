package com.bookbuddy.repository;

import com.bookbuddy.model.GenrePreference;
import com.bookbuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface GenrePreferenceRepository extends JpaRepository<GenrePreference, Long> {
    List<GenrePreference> findByUser(User user);
    
    @Modifying
    @Query("DELETE FROM GenrePreference g WHERE g.user = :user")
    void deleteByUser(@Param("user") User user);
}
