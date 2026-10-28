package com.spicehaven;

import com.spicehaven.service.RazorPayService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = {
        "RAZORPAY_KEY_ID=rzp_test_config_check",
        "RAZORPAY_KEY_SECRET=test-secret-not-a-real-credential"
})
@ActiveProfiles("test")
class RazorPayConfigurationTests {
    @Autowired
    private RazorPayService razorPayService;

    @Test
    void readsRazorpayKeyIdFromBackendConfiguration() {
        assertEquals("rzp_test_config_check", razorPayService.getKeyId());
    }
}
