package com.totoro.listing.service;

import com.totoro.listing.dto.TagDto;
import com.totoro.listing.entity.Tag;
import com.totoro.listing.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<TagDto> getAllTags() {
        return tagRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TagDto createTag(String name) {
        String slug = toSlug(name);

        if (tagRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Tag with slug '" + slug + "' already exists");
        }
        if (tagRepository.existsByName(name)) {
            throw new IllegalArgumentException("Tag with name '" + name + "' already exists");
        }

        Tag tag = Tag.builder()
                .name(name)
                .slug(slug)
                .build();
        tag = tagRepository.save(tag);
        return toDto(tag);
    }

    @Transactional
    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new IllegalArgumentException("Tag not found");
        }
        tagRepository.deleteById(id);
    }

    // ==================== Helpers ====================

    private TagDto toDto(Tag tag) {
        return TagDto.builder()
                .id(tag.getId())
                .name(tag.getName())
                .slug(tag.getSlug())
                .build();
    }

    /**
     * Convert Vietnamese or any Unicode name to URL-safe slug.
     * Example: "Máy lạnh" → "may-lanh"
     */
    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");

    private String toSlug(String input) {
        String noWhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        // Remove Vietnamese diacritics
        String slug = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = slug.toLowerCase(Locale.ROOT);
        // Remove consecutive hyphens
        slug = slug.replaceAll("-{2,}", "-");
        // Remove leading/trailing hyphens
        slug = slug.replaceAll("^-|-$", "");
        return slug;
    }
}
