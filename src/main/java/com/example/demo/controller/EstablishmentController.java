package com.example.demo.controller;

import com.example.demo.model.Establishment;
import com.example.demo.model.Review;
import com.example.demo.service.EstablishmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/establishments")
public class EstablishmentController {

    private final EstablishmentService establishmentService;

    public EstablishmentController(EstablishmentService establishmentService) {
        this.establishmentService = establishmentService;
    }

    @GetMapping
    public ResponseEntity<List<Establishment>> getAllEstablishments(
            @RequestParam(required = false) String name) {
        if (name != null && !name.trim().isEmpty()) {
            return ResponseEntity.ok(establishmentService.searchEstablishments(name));
        }
        return ResponseEntity.ok(establishmentService.getAllEstablishments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Establishment> getEstablishmentById(@PathVariable Long id) {
        return establishmentService.getEstablishmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Establishment> createEstablishment(@RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            double latitude = ((Number) request.get("latitude")).doubleValue();
            double longitude = ((Number) request.get("longitude")).doubleValue();
            int rating = ((Number) request.get("rating")).intValue();
            String comment = (String) request.get("comment");
            boolean hasBidet = request.get("hasBidet") != null && (Boolean) request.get("hasBidet");
            boolean hasFreeTissue = request.get("hasFreeTissue") != null && (Boolean) request.get("hasFreeTissue");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Establishment establishment = establishmentService.createEstablishmentWithReview(
                    name.trim(), latitude, longitude, rating, comment, hasBidet, hasFreeTissue);
            return ResponseEntity.status(HttpStatus.CREATED).body(establishment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Review> addReview(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            int rating = ((Number) request.get("rating")).intValue();
            String comment = (String) request.get("comment");
            boolean hasBidet = request.get("hasBidet") != null && (Boolean) request.get("hasBidet");
            boolean hasFreeTissue = request.get("hasFreeTissue") != null && (Boolean) request.get("hasFreeTissue");

            Review review = establishmentService.addReview(id, rating, comment, hasBidet, hasFreeTissue);
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEstablishment(@PathVariable Long id) {
        try {
            establishmentService.deleteEstablishment(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
