package com.ra.base_spring_boot.common.exception;

public class HttpUnAuthorized extends RuntimeException
{
    public HttpUnAuthorized(String message)
    {
        super(message);
    }
}
