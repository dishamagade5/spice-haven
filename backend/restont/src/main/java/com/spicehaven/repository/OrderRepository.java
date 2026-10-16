package com.spicehaven.repository;

import com.spicehaven.entity.CustomerOrder;
import com.spicehaven.entity.Enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByCustomer_EmailOrderByCreatedAtDesc(String email);
    Page<CustomerOrder> findByOrderStatus(OrderStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from CustomerOrder o where o.orderId = :orderId")
    Optional<CustomerOrder> findByIdForUpdate(@Param("orderId") Long orderId);

    long countByOrderStatus(OrderStatus status);

    @Query("select coalesce(sum(o.totalAmount), 0) from CustomerOrder o where o.orderStatus <> :excluded")
    BigDecimal revenueExcluding(OrderStatus excluded);
}
