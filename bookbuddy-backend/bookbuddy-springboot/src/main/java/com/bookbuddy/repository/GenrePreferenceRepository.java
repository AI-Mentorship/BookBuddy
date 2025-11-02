package com.bookbuddy.repository;

import com.bookbuddy.dto.GenrePreferenceResponse;
import com.bookbuddy.model.GenrePreference;
import com.bookbuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenrePreferenceRepository extends JpaRepository<GenrePreference, Long> {
    List<GenrePreference> findByUser(User user);
}
