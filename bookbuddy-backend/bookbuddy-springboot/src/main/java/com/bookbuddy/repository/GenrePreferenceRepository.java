package com.bookbuddy.repository;

import com.bookbuddy.model.GenrePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenrePreferenceRepository extends JpaRepository<GenrePreference, Long> {

}
