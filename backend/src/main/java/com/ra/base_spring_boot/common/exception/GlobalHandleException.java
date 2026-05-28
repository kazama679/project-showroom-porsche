package com.ra.base_spring_boot.common.exception;

import com.ra.base_spring_boot.common.exception.*;
import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalHandleException
{
    /**
     * @param ex MethodArgumentNotValidException
     * @apiNote handle valid exception for validation (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidException(MethodArgumentNotValidException ex)
    {
        Map<String, String> errors = new HashMap<>();
        ex.getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseWrapper.builder()
                        .data(errors)
                        .code(HttpStatus.BAD_REQUEST.value())
                        .status(HttpStatus.BAD_REQUEST)
                        .build()
        );
    }

    /**
     * @param ex MaxUploadSizeExceededException
     * @apiNote handle exception max upload file (400)
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex)
    {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseWrapper.builder()
                        .data(ex.getMessage())
                        .code(HttpStatus.BAD_REQUEST.value())
                        .status(HttpStatus.BAD_REQUEST)
                        .build()
        );
    }

    /**
     * @param ex NoResourceFoundException
     * @apiNote handle exception not found resource (404)
     * */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> handleNoResourceFoundException(NoResourceFoundException ex)
    {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ResponseWrapper.builder()
                        .data(ex.getMessage())
                        .code(HttpStatus.NOT_FOUND.value())
                        .status(HttpStatus.NOT_FOUND)
                        .build()
        );
    }

    /**
     * @param ex UsernameNotFoundException
     * @apiNote handle username not found exception
     * */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<?> handleUsernameNotFoundException(UsernameNotFoundException ex)
    {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ResponseWrapper.builder()
                        .data(ex.getMessage())
                        .code(HttpStatus.NOT_FOUND.value())
                        .status(HttpStatus.NOT_FOUND)
                        .build()
        );
    }

    /**
     * @param ex HttpBadRequest
     * @apiNote handle exception bad request (400)
     * */
    @ExceptionHandler(HttpBadRequest.class)
    public ResponseEntity<?> handleHttpBadReqeust(HttpBadRequest ex)
    {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseWrapper.builder()
                        .data(ex.getMessage())
                        .code(HttpStatus.BAD_REQUEST.value())
                        .status(HttpStatus.BAD_REQUEST)
                        .build()
        );
    }

    /**
     * @param ex HttpUnAuthorized
     * @apiNote handle exception unauthorized (401)
     * */
    @ExceptionHandler(HttpUnAuthorized.class)
    public ResponseEntity<?> handleHttpUnAuthorized(HttpUnAuthorized ex)
    {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ResponseWrapper.builder()
                        .data(ex.getMessage())
                        .code(HttpStatus.UNAUTHORIZED.value())
                        .status(HttpStatus.UNAUTHORIZED)
                        .build()
        );
    }

    /**
     * @param ex HttpForbiden
     * @apiNote handle exception forbiden (403)
     * */
    @ExceptionHandler(HttpForbiden.class)
    public ResponseEntity<?> handleHttpForbiden(HttpForbiden ex)
    {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ResponseWrapper.builder()
                        .data(ex.getMessage())
                        .code(HttpStatus.FORBIDDEN.value())
                        .status(HttpStatus.FORBIDDEN)
                        .build()
        );
    }

    /**
     * @param ex HttpNotFound
     * @apiNote handle exception not found (404)
     * */
    @ExceptionHandler(HttpNotFound.class)
    public ResponseEntity<?> handleHttpNotFound(HttpNotFound ex)
    {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ResponseWrapper.builder()
                        .data(ex.getMessage())
                        .code(HttpStatus.NOT_FOUND.value())
                        .status(HttpStatus.NOT_FOUND)
                        .build()
        );
    }

    /**
     * @param ex HttpConflict
     * @apiNote handle exception conflict (409)
     * */
    @ExceptionHandler(HttpConflict.class)
    public ResponseEntity<?> handleHttpConflict(HttpConflict ex)
    {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ResponseWrapper.builder()
                        .data(ex.getMessage())
                        .code(HttpStatus.CONFLICT.value())
                        .status(HttpStatus.CONFLICT)
                        .build()
        );
    }

    /**
     * @param ex DataIntegrityViolationException
     * @apiNote handle duplicate entries or other SQL constraints (409)
     */
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolationException(org.springframework.dao.DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        if (message != null && message.contains("Duplicate entry")) {
            if (message.contains("uk_email")) {
                message = "The email address is already in use.";
            } else if (message.contains("uk_username")) {
                message = "The username is already taken.";
            } else {
                message = "This record already exists.";
            }
        } else if (ex.getCause() != null && ex.getCause().getCause() != null) {
            String sqlMessage = ex.getCause().getCause().getMessage();
            if (sqlMessage != null && sqlMessage.contains("Duplicate entry")) {
                if (sqlMessage.toLowerCase().contains("email")) {
                    message = "The email address is already in use.";
                } else if (sqlMessage.toLowerCase().contains("username")) {
                    message = "The username is already taken.";
                } else {
                    message = "This record already exists.";
                }
            } else {
                message = "A database error occurred.";
            }
        } else {
            message = "A database constraint was violated.";
        }
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ResponseWrapper.builder()
                        .data(message)
                        .code(HttpStatus.CONFLICT.value())
                        .status(HttpStatus.CONFLICT)
                        .build()
        );
    }

}
