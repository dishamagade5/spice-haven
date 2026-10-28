package com.spicehaven.exception;

public final class ApiExceptions {
    private ApiExceptions() {
    }

    public static class NotFound extends RuntimeException {
        public NotFound(String m) {
            super(m);
        }
    }

    public static class Conflict extends RuntimeException {
        public Conflict(String m) {
            super(m);
        }
    }

    public static class BadRequest extends RuntimeException {
        public BadRequest(String m) {
            super(m);
        }
    }

    public static class Unauthorized extends RuntimeException {
        public Unauthorized(String m) {
            super(m);
        }
    }

    public static class ServiceUnavailable extends RuntimeException {
        public ServiceUnavailable(String m) {
            super(m);
        }
    }
}
