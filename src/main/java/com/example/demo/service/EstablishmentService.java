package com.example.demo.service;

import com.example.demo.model.Establishment;
import com.example.demo.model.Review;
import com.example.demo.repository.EstablishmentRepository;
import com.example.demo.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EstablishmentService {

    private final EstablishmentRepository establishmentRepository;
    private final ReviewRepository reviewRepository;

    public EstablishmentService(EstablishmentRepository establishmentRepository, ReviewRepository reviewRepository) {
        this.establishmentRepository = establishmentRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<Establishment> getAllEstablishments() {
        return establishmentRepository.findAll();
    }

    public List<Establishment> getEstablishmentsByRatingDesc() {
        return establishmentRepository.findAllByOrderByAverageRatingDesc();
    }

    public Optional<Establishment> getEstablishmentById(Long id) {
        return establishmentRepository.findById(id);
    }

    public List<Establishment> searchEstablishments(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllEstablishments();
        }
        return establishmentRepository.findByNameContainingIgnoreCase(name.trim());
    }

    @Transactional
    public Establishment createEstablishmentWithReview(String name, double latitude, double longitude, int rating, String comment, boolean hasBidet, boolean hasFreeTissue) {
        validateCoordinates(latitude, longitude);
        validateRating(rating);

        Establishment establishment = new Establishment(name, latitude, longitude);
        Review review = new Review(rating, comment, establishment, hasBidet, hasFreeTissue);
        establishment.addReview(review);
        establishment.setAverageRating(rating);

        return establishmentRepository.save(establishment);
    }

    @Transactional
    public Review addReview(Long establishmentId, int rating, String comment, boolean hasBidet, boolean hasFreeTissue) {
        validateRating(rating);

        Establishment establishment = establishmentRepository.findById(establishmentId)
                .orElseThrow(() -> new IllegalArgumentException("Establishment not found with id: " + establishmentId));

        Review review = new Review(rating, comment, establishment, hasBidet, hasFreeTissue);
        establishment.addReview(review);

        recalculateAverageRating(establishment);
        establishmentRepository.save(establishment);

        return review;
    }

    @Transactional
    public void deleteEstablishment(Long id) {
        if (!establishmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Establishment not found with id: " + id);
        }
        establishmentRepository.deleteById(id);
    }

    private void recalculateAverageRating(Establishment establishment) {
        List<Review> reviews = establishment.getReviews();
        if (reviews.isEmpty()) {
            establishment.setAverageRating(0.0);
            return;
        }
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        establishment.setAverageRating(Math.round(average * 10.0) / 10.0);
    }

    private void validateCoordinates(double latitude, double longitude) {
        if (latitude < -90.0 || latitude > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (longitude < -180.0 || longitude > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
    }

    private void validateRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }
}
