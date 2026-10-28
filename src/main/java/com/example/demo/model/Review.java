package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int rating;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean hasBidet = false;

    @Column(nullable = false)
    private boolean hasFreeTissue = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "establishment_id", nullable = false)
    @JsonIgnore
    private Establishment establishment;

    public Review() {
    }

    public Review(int rating, String comment, Establishment establishment) {
        this.rating = rating;
        this.comment = comment;
        this.establishment = establishment;
        this.createdAt = LocalDateTime.now();
    }

    public Review(int rating, String comment, Establishment establishment, boolean hasBidet, boolean hasFreeTissue) {
        this.rating = rating;
        this.comment = comment;
        this.establishment = establishment;
        this.createdAt = LocalDateTime.now();
        this.hasBidet = hasBidet;
        this.hasFreeTissue = hasFreeTissue;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Establishment getEstablishment() {
        return establishment;
    }

    public void setEstablishment(Establishment establishment) {
        this.establishment = establishment;
    }

    public boolean isHasBidet() {
        return hasBidet;
    }

    public void setHasBidet(boolean hasBidet) {
        this.hasBidet = hasBidet;
    }

    public boolean isHasFreeTissue() {
        return hasFreeTissue;
    }

    public void setHasFreeTissue(boolean hasFreeTissue) {
        this.hasFreeTissue = hasFreeTissue;
    }
}
