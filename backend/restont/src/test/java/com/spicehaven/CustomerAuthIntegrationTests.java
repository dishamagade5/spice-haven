package com.spicehaven;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerAuthIntegrationTests {
    @Autowired
    private MockMvc mvc;

    @Test
    void localFrontendCanPreflightAdminLoginAndLoadDashboard() throws Exception {
        String frontendOrigin = "http://localhost:5173";

        mvc.perform(options("/api/admin/auth/login")
                .header("Origin", frontendOrigin)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", frontendOrigin));

        MvcResult login = mvc.perform(post("/api/admin/auth/login")
                .header("Origin", frontendOrigin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"admin@example.com","password":"test-admin-password"}
                        """))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", frontendOrigin))
                .andReturn();
        String token = extractToken(login.getResponse().getContentAsString());

        mvc.perform(get("/api/admin/stats")
                .header("Origin", frontendOrigin)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", frontendOrigin));
    }

    @Test
    void configuredAdditionalFrontendOriginRemainsAllowed() throws Exception {
        mvc.perform(get("/api/menu").header("Origin", "https://spicehaven-test.example"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://spicehaven-test.example"));
    }

    @Test
    void registrationPersistsAccountAndAllowsLoginAndProfileFetch() throws Exception {
        String registration = """
                {"fullName":"Sam Customer","email":"sam@example.com","phone":"+919876543210","password":"correct-horse"}
                """;
        mvc.perform(post("/api/customer/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registration))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("sam@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));

        MvcResult login = mvc.perform(post("/api/customer/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"sam@example.com","password":"correct-horse"}
                        """))
                .andExpect(status().isOk())
                .andReturn();
        String token = extractToken(login.getResponse().getContentAsString());

        mvc.perform(get("/api/customer/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Sam Customer"))
                .andExpect(jsonPath("$.phone").value("+919876543210"));
    }

    @Test
    void duplicateRegistrationIsRejected() throws Exception {
        String registration = """
                {"fullName":"Duplicate Customer","email":"duplicate@example.com","phone":"9876543210","password":"correct-horse"}
                """;
        mvc.perform(post("/api/customer/register").contentType(MediaType.APPLICATION_JSON).content(registration))
                .andExpect(status().isOk());
        mvc.perform(post("/api/customer/register").contentType(MediaType.APPLICATION_JSON).content(registration))
                .andExpect(status().isConflict());
    }

    @Test
    void adminMenuCustomerOrdersAndReservationsUseTheDatabase() throws Exception {
        MvcResult adminLogin = mvc.perform(post("/api/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"admin@example.com","password":"test-admin-password"}
                        """))
                .andExpect(status().isOk())
                .andReturn();
        String adminToken = extractToken(adminLogin.getResponse().getContentAsString());

        byte[] originalImage = java.util.Base64.getDecoder().decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC");
        MockMultipartFile originalUpload = new MockMultipartFile("image", "dish.png", "image/png", originalImage);
        MvcResult createdMenu = mvc.perform(multipart("/api/admin/menu")
                .header("Authorization", "Bearer " + adminToken)
                .file(menuDetails("""
                        {"name":"Database Dish","category":"Dinner","description":"Test dish","costPrice":120.50,"price":250.00,"removeImage":false,"isAvailable":true,"isFeatured":true}
                        """))
                .file(originalUpload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.costPrice").value(120.5))
                .andExpect(jsonPath("$.price").value(250))
                .andExpect(jsonPath("$.imagePath").value(org.hamcrest.Matchers.matchesPattern("/api/menu/\\d+/image")))
                .andReturn();
        long menuId = extractId(createdMenu.getResponse().getContentAsString(), "id");

        byte[] replacementImage = java.util.Base64.getDecoder().decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/nNsAAAAASUVORK5CYII=");
        MockMultipartHttpServletRequestBuilder updateMenu = multipart(HttpMethod.PUT, "/api/admin/menu/" + menuId)
                .header("Authorization", "Bearer " + adminToken)
                .file(menuDetails("""
                        {"name":"Updated Database Dish","category":"Dinner","description":"Updated test dish","costPrice":140.00,"price":260.00,"removeImage":false,"isAvailable":true,"isFeatured":true}
                        """))
                .file(new MockMultipartFile("image", "replacement.png", "image/png", replacementImage));
        mvc.perform(updateMenu)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.costPrice").value(140))
                .andExpect(jsonPath("$.imagePath").value(org.hamcrest.Matchers.matchesPattern("/api/menu/\\d+/image")));

        mvc.perform(get("/api/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Updated Database Dish"))
                .andExpect(jsonPath("$[0].price").value(260))
                .andExpect(jsonPath("$[0].isFeatured").value(true))
                .andExpect(jsonPath("$[0].costPrice").doesNotExist());
        mvc.perform(get("/api/menu/" + menuId + "/image"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(content().bytes(replacementImage));
        try (var storedImages = Files.list(Path.of("target/test-menu-images"))) {
            org.junit.jupiter.api.Assertions.assertEquals(1, storedImages.count());
        }

        MvcResult registered = mvc.perform(post("/api/customer/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"fullName":"Order Customer","email":"order@example.com","phone":"9876543210","password":"correct-horse"}
                        """))
                .andExpect(status().isOk())
                .andReturn();
        String customerToken = extractToken(registered.getResponse().getContentAsString());
        long customerId = extractId(registered.getResponse().getContentAsString(), "id");

        mvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"paymentMethod":"PAY_AT_COUNTER","items":[{"menuId":""" + menuId + """
                        ,"quantity":2}]}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalAmount").value(520))
                .andExpect(jsonPath("$.customerName").value("Order Customer"));

        mvc.perform(get("/api/customer/orders").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].items[0].name").value("Updated Database Dish"));

        String reservationDate = LocalDate.now(ZoneId.of("Asia/Kolkata")).plusDays(1).toString();
        MvcResult createdReservation = mvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"customerName":"Reservation Guest","phoneNumber":"9876543210","email":"guest@example.com","reservationDate":""" + "\"" + reservationDate + "\"" + """
                        ,"reservationTime":"19:30:00","numberOfGuests":3,"message":"No peanuts"}
                        """))
                .andExpect(status().isCreated())
                .andReturn();
        long reservationId = extractId(createdReservation.getResponse().getContentAsString(), "id");

        mvc.perform(patch("/api/admin/reservations/" + reservationId + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"status":"CONFIRMED"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mvc.perform(patch("/api/admin/orders/1/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"status":"PREPARING"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PREPARING"));

        mvc.perform(get("/api/admin/orders?page=0&size=1").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].orderId").value(1))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
        mvc.perform(get("/api/admin/reservations?page=0&size=1").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(reservationId))
                .andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/admin/customers").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.email == 'order@example.com')]").exists());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(
                        "/api/admin/customers/" + customerId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"fullName":"Updated Order Customer","email":"order@example.com","phone":"9876543210"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Order Customer"));
        mvc.perform(delete("/api/admin/customers/" + customerId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/admin/orders/1").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("Order Customer"));

        mvc.perform(delete("/api/admin/menu/" + menuId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/menu")).andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        mvc.perform(get("/api/menu/" + menuId + "/image")).andExpect(status().isNotFound());
        try (var storedImages = Files.list(Path.of("target/test-menu-images"))) {
            org.junit.jupiter.api.Assertions.assertEquals(0, storedImages.count());
        }
    }

    private MockMultipartFile menuDetails(String json) {
        return new MockMultipartFile("dish", "dish.json", MediaType.APPLICATION_JSON_VALUE,
                json.getBytes(StandardCharsets.UTF_8));
    }

    private String extractToken(String response) {
        Matcher matcher = Pattern.compile("\"token\":\"([^\"]+)\"").matcher(response);
        if (!matcher.find()) throw new AssertionError("Authentication response did not contain a token");
        return matcher.group(1);
    }

    private long extractId(String response, String property) {
        Matcher matcher = Pattern.compile("\"" + property + "\":(\\d+)").matcher(response);
        if (!matcher.find()) throw new AssertionError("Response did not contain " + property);
        return Long.parseLong(matcher.group(1));
    }
}
