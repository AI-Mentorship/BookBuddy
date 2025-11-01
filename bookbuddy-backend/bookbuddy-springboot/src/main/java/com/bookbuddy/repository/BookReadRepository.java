package com.bookbuddy.repository;

import com.bookbuddy.model.BookRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookReadRepository extends JpaRepository <BookRead, Long> {

}
