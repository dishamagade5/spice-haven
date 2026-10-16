package com.spicehaven;

import com.spicehaven.dto.Dto.PaymentVerificationRequest;
import com.spicehaven.entity.Customer;
import com.spicehaven.entity.CustomerOrder;
import com.spicehaven.exception.ApiExceptions;
import com.spicehaven.repository.OrderRepository;
import com.spicehaven.service.OrderService;
import com.spicehaven.service.PaymentService;
import com.spicehaven.service.RazorPayService;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class PaymentServiceTests {
    @Test
    void marksOrderPaidOnlyAfterSignedCapturedUpiPaymentMatchesAmount() throws Exception {
        OrderService orderService = mock(OrderService.class);
        OrderRepository orders = mock(OrderRepository.class);
        RazorPayService razorPayService = mock(RazorPayService.class);
        PaymentService service = new PaymentService(orderService, orders, razorPayService);
        CustomerOrder order = pendingOrder();
        when(orders.findByIdForUpdate(42L)).thenReturn(Optional.of(order));
        when(razorPayService.verifySignature("order_gateway_42", "pay_gateway_42", "valid-signature"))
                .thenReturn(true);
        when(razorPayService.fetchPayment("pay_gateway_42")).thenReturn(new JSONObject()
                .put("order_id", "order_gateway_42")
                .put("status", "captured")
                .put("method", "upi")
                .put("currency", "INR")
                .put("amount", 4250));
        when(orders.save(order)).thenReturn(order);

        service.verifyPayment(
                new PaymentVerificationRequest(42L, "order_gateway_42", "pay_gateway_42", "valid-signature"),
                "guest@example.com");

        assertEquals("PAID", order.getPaymentStatus());
        assertEquals("pay_gateway_42", order.getRazorpayPaymentId());
        verify(orderService).responseForCustomer(order);
    }

    @Test
    void invalidSignatureDoesNotFetchOrMarkPaymentAsPaid() {
        OrderService orderService = mock(OrderService.class);
        OrderRepository orders = mock(OrderRepository.class);
        RazorPayService razorPayService = mock(RazorPayService.class);
        PaymentService service = new PaymentService(orderService, orders, razorPayService);
        CustomerOrder order = pendingOrder();
        when(orders.findByIdForUpdate(42L)).thenReturn(Optional.of(order));
        when(razorPayService.verifySignature("order_gateway_42", "pay_gateway_42", "bad-signature"))
                .thenReturn(false);

        assertThrows(ApiExceptions.BadRequest.class, () -> service.verifyPayment(
                new PaymentVerificationRequest(42L, "order_gateway_42", "pay_gateway_42", "bad-signature"),
                "guest@example.com"));

        assertEquals("PENDING", order.getPaymentStatus());
        verify(razorPayService, never()).fetchPayment(anyString());
        verify(orders, never()).save(any(CustomerOrder.class));
    }

    private CustomerOrder pendingOrder() {
        Customer customer = new Customer();
        customer.setEmail("guest@example.com");

        CustomerOrder order = new CustomerOrder();
        order.setOrderId(42L);
        order.setCustomer(customer);
        order.setPaymentMethod("RAZORPAY_UPI");
        order.setPaymentStatus("PENDING");
        order.setRazorpayOrderId("order_gateway_42");
        order.setTotalAmount(new BigDecimal("42.50"));
        return order;
    }
}
