package com.shopsphere.payment;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import com.shopsphere.order.Order;
import java.math.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class Payment
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @JsonIgnore
    @OneToOne(optional = false)
    Order order;

    @Enumerated(EnumType.STRING)
    PaymentStatus status;

    BigDecimal amount;

    Instant createdAt = Instant.now();

    public Payment(UUID id, Order order, PaymentStatus status, BigDecimal amount, Instant createdAt)
    {
        this.id = id;
        this.order = order;
        this.status = status;
        this.amount = amount;
        this.createdAt = createdAt;
    }

    public UUID getId()
    {
        return id;
    }

    public void setId(UUID id)
    {
        this.id = id;
    }

    public Order getOrder()
    {
        return order;
    }

    public void setOrder(Order order)
    {
        this.order = order;
    }

    public PaymentStatus getStatus()
    {
        return status;
    }

    public void setStatus(PaymentStatus status)
    {
        this.status = status;
    }

    public BigDecimal getAmount()
    {
        return amount;
    }

    public void setAmount(BigDecimal amount)
    {
        this.amount = amount;
    }

    public Instant getCreatedAt()
    {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt)
    {
        this.createdAt = createdAt;
    }


}
