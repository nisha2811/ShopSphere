package com.shopsphere.exception;

import java.time.Instant;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalExceptionHandler
{
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    @ExceptionHandler(ApiException.class) ResponseEntity<?> api(ApiException e)
    {
     return ResponseEntity.status(e.getStatus()).body(Map.of(
             "timestamp", Instant.now(),
             "status", e.getStatus().value(),
             "error", e.getStatus().name(),
             "message", e.getMessage()
     ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException e)
    {
         Map<String, String> errors = new LinkedHashMap<>();
         e.getBindingResult().getFieldErrors().forEach(x -> errors.put(x.getField(), x.getDefaultMessage()));

         return ResponseEntity.badRequest().body(Map.of(
                 "timestamp", Instant.now(),
                 "status", 400,
                 "error", "VALIDATION_ERROR",
                 "message", "Invalid request",
                 "errors", errors
         ));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ResponseEntity<?> optimistic(ObjectOptimisticLockingFailureException e)
    {
         return ResponseEntity.status(409).body(Map.of(
                 "timestamp", Instant.now(),
                 "status", 409,
                 "error", "CONFLICT",
                 "message", "The item was changed by another request. Please try again."
         ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> data(DataIntegrityViolationException e)
    {
         return ResponseEntity.status(409).body(Map.of(
                 "timestamp", Instant.now(),
                 "status", 409,
                 "error", "CONFLICT",
                 "message", "The requested operation conflicts with existing data."
         ));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<?> other(Exception e)
    {
         log.error("Unhandled API exception", e);

         return ResponseEntity.status(500).body(Map.of(
                 "timestamp", Instant.now(),
                 "status", 500,
                 "error", "INTERNAL_SERVER_ERROR",
                 "message", "An unexpected error occurred."
         ));
    }
}
