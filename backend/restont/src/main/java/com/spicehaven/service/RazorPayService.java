package com.spicehaven.service;

import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.spicehaven.exception.ApiExceptions;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class RazorPayService {
    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    public String getKeyId() {
        requireConfigured();
        return keyId;
    }

    public JSONObject createOrder(long amount, String currency, String receiptId) {
        requireConfigured();
        try {
            JSONObject request = new JSONObject();
            request.put("amount", amount);
            request.put("currency", currency);
            request.put("receipt", receiptId);
            return new RazorpayClient(keyId, keySecret).orders.create(request).toJson();
        } catch (RazorpayException ex) {
            log.warn("Could not create Razorpay order: {}", ex.getMessage());
            throw new ApiExceptions.ServiceUnavailable("Razorpay could not create the payment. Please try again.");
        }
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        requireConfigured();
        try {
            return Utils.verifySignature(orderId + "|" + paymentId, signature, keySecret);
        } catch (RazorpayException ex) {
            log.warn("Razorpay payment signature verification failed: {}", ex.getMessage());
            return false;
        }
    }

    public JSONObject fetchPayment(String paymentId) {
        requireConfigured();
        try {
            Payment payment = new RazorpayClient(keyId, keySecret).payments.fetch(paymentId);
            return payment.toJson();
        } catch (RazorpayException ex) {
            log.warn("Could not fetch Razorpay payment {}: {}", paymentId, ex.getMessage());
            throw new ApiExceptions.ServiceUnavailable("Razorpay could not verify the payment. Please retry.");
        }
    }

    private void requireConfigured() {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new ApiExceptions.ServiceUnavailable(
                    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the backend.");
        }
    }
}
