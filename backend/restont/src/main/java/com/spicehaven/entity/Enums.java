package com.spicehaven.entity;

public final class Enums {
    private Enums() {
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, PREPARING, COMPLETED, CANCELLED
    }

    public enum ReservationStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }
}
