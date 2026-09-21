package com.shopsphere.exception;
import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException
{
    private final HttpStatus status;

    public ApiException(String m,HttpStatus s)
    {
        super(m);
        status=s;
    }

    public HttpStatus getStatus()
    {
        return status;
    }
}
