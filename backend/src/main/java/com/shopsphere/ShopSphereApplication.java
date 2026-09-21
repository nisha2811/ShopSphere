package com.shopsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication public class ShopSphereApplication
{
    public static void main(String[] args)
    {
        SpringApplication.run(ShopSphereApplication.class,args);
        System.out.println("ShopSphere backend is running on port 8088...");
    }
}
