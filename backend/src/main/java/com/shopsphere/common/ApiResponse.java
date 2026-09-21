package com.shopsphere.common;

public record ApiResponse<T>(boolean success, T data, String message)
{
    public static <T> ApiResponse<T> ok(T d)
    {
        return new ApiResponse<>(true, d, null);
    }

    public static <T> ApiResponse<T> ok(T d, String m)
    {
        return new ApiResponse<>(true, d, m);
    }
}
