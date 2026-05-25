package com.ra.base_spring_boot.common.exception;

public class HttpConflict extends RuntimeException
{
    public HttpConflict(String message)
    {
        super(message);
    }
}
