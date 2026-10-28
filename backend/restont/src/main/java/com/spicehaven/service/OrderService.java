package com.spicehaven.service;

import com.spicehaven.dto.Dto.*;
import com.spicehaven.entity.*;
import com.spicehaven.entity.Enums.OrderStatus;
import com.spicehaven.exception.ApiExceptions;
import com.spicehaven.repository.MenuRepository;
import com.spicehaven.repository.OrderRepository;
import com.spicehaven.repository.CustomerRepository;
import com.spicehaven.dto.Dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final MenuRepository menus;
    private final OrderRepository orders;
    private final CustomerRepository customers;

    @Value("${spicehaven.whatsapp.number:}")
    private String whatsappNumber;

    /**
     * Prices always come from the database; the client only sends menuId +
     * quantity.
     */
    @Transactional
    public OrderResponse create(OrderRequest req, String customerEmail) {
        if ("ONLINE".equals(req.paymentMethod())) {
            throw new ApiExceptions.BadRequest("Online orders must be paid through Razorpay UPI");
        }
        CustomerOrder saved = persistOrder(req.items(), req.note(), req.paymentMethod(), "UNPAID", customerEmail);
        return OrderResponse.from(saved, whatsappUrl(saved));
    }

    @Transactional
    public CustomerOrder createPendingOnline(OnlineOrderRequest req, String customerEmail) {
        return persistOrder(req.items(), req.note(), "RAZORPAY_UPI", "PENDING", customerEmail);
    }

    private CustomerOrder persistOrder(List<OrderLine> lines, String note, String paymentMethod,
            String paymentStatus, String customerEmail) {
        Map<Long, Integer> qty = new LinkedHashMap<>();
        lines.forEach(i -> qty.merge(i.menuId(), i.quantity(), Integer::sum));

        List<Menu> found = menus.findAllByMenuIdInAndDeletedFalse(qty.keySet());
        if (found.size() != qty.size())
            throw new ApiExceptions.NotFound("One or more menu items do not exist");

        CustomerOrder order = new CustomerOrder();
        Customer customer = customers.findByEmail(customerEmail)
                .orElseThrow(() -> new ApiExceptions.Unauthorized("Customer account not found"));
        order.setCustomer(customer);
        order.setCustomerName(customer.getFullName());
        order.setCustomerPhone(customer.getPhone());
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentStatus);
        order.setNote(note == null || note.isBlank() ? null : note.trim());

        BigDecimal total = BigDecimal.ZERO;
        for (Menu m : found) {
            if (!m.isAvailable())
                throw new ApiExceptions.Conflict(m.getItemName() + " is currently unavailable");
            int q = qty.get(m.getMenuId());
            OrderItem line = new OrderItem();
            line.setMenu(m);
            line.setQuantity(q);
            line.setUnitPrice(m.getPrice());
            order.addItem(line);
            total = total.add(m.getPrice().multiply(BigDecimal.valueOf(q)));
        }
        order.setTotalAmount(total);
        return orders.save(order);
    }

    /**
     * Customers have no accounts: an order is visible only with its id AND the
     * phone number used.
     */
    @Transactional(readOnly = true)
    public OrderResponse track(Long id, String phone) {
        CustomerOrder o = orders.findById(id).orElseThrow(() -> new ApiExceptions.NotFound("Order not found"));
        if (!digits(o.getCustomerPhone()).endsWith(digits(phone)) || digits(phone).length() < 10)
            throw new ApiExceptions.NotFound("Order not found");
        return OrderResponse.from(o, null);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> list(String status, int page, int size) {
        PageRequest p = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100)),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = (status == null || status.isBlank())
                ? orders.findAll(p)
                : orders.findByOrderStatus(parse(status), p);
        return PageResponse.from(result.map(o -> OrderResponse.from(o, null)));
    }

    @Transactional(readOnly = true)
    public OrderResponse get(Long id) {
        return OrderResponse.from(orders.findById(id).orElseThrow(() -> new ApiExceptions.NotFound("Order not found")),
                null);
    }

    public OrderResponse responseForCustomer(CustomerOrder order) {
        return OrderResponse.from(order, whatsappUrl(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listForCustomer(String email) {
        return orders.findByCustomer_EmailOrderByCreatedAtDesc(email).stream()
                .map(o -> OrderResponse.from(o, whatsappUrl(o))).toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        CustomerOrder o = orders.findById(id).orElseThrow(() -> new ApiExceptions.NotFound("Order not found"));
        o.setOrderStatus(parse(status));
        return OrderResponse.from(orders.save(o), null);
    }

    @Transactional(readOnly = true)
    public StatsResponse stats() {
        long total = menus.countByDeletedFalse(), avail = menus.countByDeletedFalseAndAvailableTrue();
        return new StatsResponse(total, avail, total - avail, orders.count(),
                orders.countByOrderStatus(OrderStatus.PENDING), orders.revenueExcluding(OrderStatus.CANCELLED));
    }

    private OrderStatus parse(String s) {
        try {
            return OrderStatus.valueOf(s.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiExceptions.BadRequest("Unknown order status: " + s);
        }
    }

    private String digits(String s) {
        return s == null ? "" : s.replaceAll("\\D", "");
    }

    private String whatsappUrl(CustomerOrder o) {
        if (whatsappNumber == null || whatsappNumber.isBlank()) return null;
        StringBuilder sb = new StringBuilder("New Order #").append(o.getOrderId()).append('\n')
                .append("Name: ").append(o.getCustomerName()).append('\n')
                .append("Phone: ").append(o.getCustomerPhone()).append("\n\n");
        for (OrderItem i : o.getItems())
            sb.append(i.getQuantity()).append(" x ").append(i.getMenu().getItemName()).append(" - Rs.")
                    .append(i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())).stripTrailingZeros()
                            .toPlainString())
                    .append('\n');
        sb.append("\nTotal: Rs.").append(o.getTotalAmount().stripTrailingZeros().toPlainString());
        if (o.getNote() != null)
            sb.append("\nNote: ").append(o.getNote());
        String text = URLEncoder.encode(sb.toString(), StandardCharsets.UTF_8).replace("+", "%20");
        return "https://wa.me/" + whatsappNumber + "?text=" + text;
    }
}
