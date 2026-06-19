package com.totoro.listing.repository;

import com.totoro.listing.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findBySlug(String slug);

    List<Tag> findBySlugIn(List<String> slugs);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);
}
