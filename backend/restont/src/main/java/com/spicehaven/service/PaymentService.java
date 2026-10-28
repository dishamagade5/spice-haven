package com.spicehaven.service;

import com.spicehaven.dto.Dto.OnlineOrderRequest;
import com.spicehaven.dto.Dto.OrderResponse;
import com.spicehaven.dto.Dto.PaymentVerificationRequest;
import com.spicehaven.dto.Dto.RazorpayOrderResponse;
import com.spicehaven.entity.CustomerOrder;
import com.spicehaven.exception.ApiExceptions;
import com.spicehaven.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private static final String CURRENCY = "INR";

    private final OrderService orderService;
    private final OrderRepository orders;
    private final RazorPayService razorPayService;

    @Transactional
    public RazorpayOrderResponse createOrder(OnlineOrderRequest request, String customerEmail) {
        CustomerOrder order = orderService.createPendingOnline(request, customerEmail);
        long amountInPaise;
        try {
            amountInPaise = order.getTotalAmount().movePointRight(2).longValueExact();
        } catch (ArithmeticException ex) {
            throw new ApiExceptions.BadRequest("Order total cannot be represented as a Razorpay amount");
        }
        if (amountInPaise <= 0) {
            throw new ApiExceptions.BadRequest("Razorpay payments must be greater than zero");
        }

        JSONObject gatewayOrder = razorPayService.createOrder(amountInPaise, CURRENCY, "order_" + order.getOrderId());
        String gatewayOrderId = gatewayOrder.optString("id", "");
        if (gatewayOrderId.isBlank()) {
            throw new ApiExceptions.ServiceUnavailable("Razorpay returned an invalid payment order.");
        }
        order.setRazorpayOrderId(gatewayOrderId);
        orders.save(order);
        return new RazorpayOrderResponse(order.getOrderId(), gatewayOrderId, razorPayService.getKeyId(),
                amountInPaise, CURRENCY);
    }

    @Transactional
    public OrderResponse verifyPayment(PaymentVerificationRequest request, String customerEmail) {
        CustomerOrder order = orders.findByIdForUpdate(request.orderId())
                .orElseThrow(() -> new ApiExceptions.NotFound("Order not found"));
        if (order.getCustomer() == null || !order.getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new ApiExceptions.NotFound("Order not found");
        }
        if (!"RAZORPAY_UPI".equals(order.getPaymentMethod())) {
            throw new ApiExceptions.Conflict("This order is not a Razorpay UPI order");
        }
        if ("PAID".equals(order.getPaymentStatus())) {
            if (request.razorpayOrderId().equals(order.getRazorpayOrderId())
                    && request.razorpayPaymentId().equals(order.getRazorpayPaymentId())) {
                return orderService.responseForCustomer(order);
            }
            throw new ApiExceptions.Conflict("A different payment has already been recorded for this order");
        }
        if (!"PENDING".equals(order.getPaymentStatus())
                || order.getRazorpayOrderId() == null
                || !order.getRazorpayOrderId().equals(request.razorpayOrderId())) {
            throw new ApiExceptions.Conflict("This payment order is not awaiting verification");
        }

        if (!razorPayService.verifySignature(request.razorpayOrderId(), request.razorpayPaymentId(),
                request.razorpaySignature())) {
            throw new ApiExceptions.BadRequest("Razorpay payment signature is invalid");
        }

        JSONObject payment = razorPayService.fetchPayment(request.razorpayPaymentId());
        long expectedAmount = order.getTotalAmount().movePointRight(2).longValueExact();
        if (!request.razorpayOrderId().equals(payment.optString("order_id"))
                || !"captured".equalsIgnoreCase(payment.optString("status"))
                || !"upi".equalsIgnoreCase(payment.optString("method"))
                || !CURRENCY.equalsIgnoreCase(payment.optString("currency"))
                || payment.optLong("amount", -1) != expectedAmount) {
            throw new ApiExceptions.Conflict("Razorpay payment does not match this order or is not captured");
        }

        order.setRazorpayPaymentId(request.razorpayPaymentId());
        order.setPaymentStatus("PAID");
        CustomerOrder saved = orders.save(order);
        return orderService.responseForCustomer(saved);
    }
}
