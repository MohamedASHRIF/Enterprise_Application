package com.enterprise.employee_service.web;

import com.enterprise.employee_service.web.dto.ResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class Advice {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDto<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex){
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(new ResponseDto<>(false, errors, "Validation failed"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseDto<Void>> handleRuntime(RuntimeException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ResponseDto<>(false, null, ex.getMessage()));
    }
}
