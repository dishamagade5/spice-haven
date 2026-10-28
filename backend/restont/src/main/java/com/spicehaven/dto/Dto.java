package com.spicehaven.dto;

import com.spicehaven.entity.*;
import com.spicehaven.entity.Enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;

/**
 * All request/response objects. Field names match the React frontend (id, name,
 * imagePath, isAvailable...).
 */
public final class Dto {
    private Dto() {
    }

    // ---------- menu ----------
    public record MenuRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Size(max = 50) String category,
            @Size(max = 500) String description,
            @NotNull @DecimalMin("0.0") BigDecimal costPrice,
            @NotNull @DecimalMin("0.0") BigDecimal price,
            boolean removeImage,
            boolean isAvailable,
            boolean isFeatured) {
    }

    public record MenuResponse(Long id, String name, String category, String description, BigDecimal costPrice,
            BigDecimal price, String imagePath, boolean isAvailable, boolean isFeatured) {
        public static MenuResponse from(Menu m) {
            return new MenuResponse(m.getMenuId(), m.getItemName(), m.getCategory(), m.getDescription(),
                    m.getCostPrice(), m.getPrice(), Dto.imagePath(m), m.isAvailable(), m.isFeatured());
        }
    }

    public record PublicMenuResponse(Long id, String name, String category, String description,
            BigDecimal price, String imagePath, boolean isAvailable, boolean isFeatured) {
        public static PublicMenuResponse from(Menu item) {
            return new PublicMenuResponse(item.getMenuId(), item.getItemName(), item.getCategory(),
                    item.getDescription(), item.getPrice(), Dto.imagePath(item), item.isAvailable(), item.isFeatured());
        }
    }

    private static String imagePath(Menu menu) {
        return menu.getImageFileName() == null ? null : "/api/menu/" + menu.getMenuId() + "/image";
    }

    public record PriceRequest(@NotNull @DecimalMin("0.0") BigDecimal price) {
    }

    public record AvailabilityRequest(boolean isAvailable) {
    }

    // ---------- orders ----------
    public record OrderLine(@NotNull Long menuId, @Min(1) @Max(50) int quantity) {
    }

    public record OrderRequest(
            @Size(max = 300) String note,
            @NotBlank @Pattern(regexp = "^(ONLINE|CASH_ON_DELIVERY|PAY_AT_COUNTER)$") String paymentMethod,
            @NotEmpty @Size(max = 50) List<@Valid OrderLine> items) {
    }

    public record OnlineOrderRequest(
            @Size(max = 300) String note,
            @NotEmpty @Size(max = 50) List<@Valid OrderLine> items) {
    }

    public record PaymentVerificationRequest(
            @NotNull Long orderId,
            @NotBlank @Size(max = 100) String razorpayOrderId,
            @NotBlank @Size(max = 100) String razorpayPaymentId,
            @NotBlank @Size(max = 256) String razorpaySignature) {
    }

    public record RazorpayOrderResponse(
            Long orderId, String razorpayOrderId, String keyId, long amount, String currency) {
    }

    public record OrderItemResponse(Long menuId, String name, String category, int quantity, BigDecimal unitPrice) {
    }

    public record OrderResponse(Long orderId, String customerName, String customerEmail, String customerPhone, String note,
            BigDecimal totalAmount, OrderStatus status, String paymentMethod, String paymentStatus, LocalDateTime createdAt,
            String razorpayOrderId, String razorpayPaymentId, List<OrderItemResponse> items, String whatsappUrl) {
        public static OrderResponse from(CustomerOrder o, String whatsappUrl) {
            List<OrderItemResponse> items = o.getItems().stream().map(i -> new OrderItemResponse(
                    i.getMenu().getMenuId(), i.getMenu().getItemName(), i.getMenu().getCategory(),
                    i.getQuantity(), i.getUnitPrice())).toList();
            return new OrderResponse(o.getOrderId(), o.getCustomerName(),
                    o.getCustomer() == null ? null : o.getCustomer().getEmail(), o.getCustomerPhone(), o.getNote(),
                    o.getTotalAmount(), o.getOrderStatus(), o.getPaymentMethod(), o.getPaymentStatus(),
                    o.getCreatedAt(), o.getRazorpayOrderId(), o.getRazorpayPaymentId(), items, whatsappUrl);
        }
    }

    // ---------- reservations ----------
    public record ReservationRequest(
            @NotBlank @Size(max = 100) String customerName,
            @NotBlank @Pattern(regexp = "^\\+?[0-9]{10,13}$", message = "must be a valid phone number") String phoneNumber,
            @NotBlank @Email @Size(max = 150) String email,
            @NotNull @FutureOrPresent LocalDate reservationDate,
            @NotNull LocalTime reservationTime,
            @Min(1) @Max(30) int numberOfGuests,
            @Size(max = 500) String message) {
    }

    public record ReservationResponse(Long id, String customerName, String phoneNumber, String email,
            LocalDate reservationDate, LocalTime reservationTime, int numberOfGuests,
            String message, ReservationStatus status, LocalDateTime createdAt) {
        public static ReservationResponse from(Reservation r) {
            return new ReservationResponse(r.getReservationId(), r.getCustomerName(), r.getPhoneNumber(), r.getEmail(),
                    r.getReservationDate(), r.getReservationTime(), r.getNumberOfGuests(), r.getMessage(),
                    r.getStatus(), r.getCreatedAt());
        }
    }

    // ---------- auth / misc ----------
    public record StatusRequest(@NotBlank String status) {
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record CustomerRegistrationRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Pattern(regexp = "^\\+?[0-9]{10,13}$", message = "must be a valid phone number") String phone,
            @NotBlank @Size(min = 8, max = 72) String password) {
    }

    public record CustomerProfile(Long id, String fullName, String email, String phone) {
    }

    public record CustomerAdminRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Pattern(regexp = "^\\+?[0-9]{10,13}$", message = "must be a valid phone number") String phone) {
    }

    public record CustomerAdminResponse(Long id, String fullName, String email, String phone, LocalDateTime createdAt) {
        public static CustomerAdminResponse from(Customer customer) {
            return new CustomerAdminResponse(customer.getCustomerId(), customer.getFullName(), customer.getEmail(),
                    customer.getPhone(), customer.getCreatedAt());
        }
    }

    public record TokenResponse(String token, long expiresInMinutes, String name,
            Long id, String email, String phone, String role) {
    }

    public record StatsResponse(long totalItems, long availableItems, long unavailableItems,
            long totalOrders, long pendingOrders, BigDecimal revenue) {
    }

    public record ApiError(int status, String message, Map<String, String> errors) {
    }

    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
        public static <T> PageResponse<T> from(Page<T> source) {
            return new PageResponse<>(source.getContent(), source.getNumber(), source.getSize(),
                    source.getTotalElements(), source.getTotalPages());
        }
    }
}
