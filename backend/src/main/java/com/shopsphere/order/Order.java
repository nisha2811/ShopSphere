package com.shopsphere.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import com.shopsphere.payment.PaymentStatus;
import com.shopsphere.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders", indexes = @Index(name = "idx_order_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class Order
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(optional = false)
    User user;

    @OneToMany(mappedBy = "order", fetch = FetchType.EAGER)
    @OrderBy("id asc")
    java.util.List<OrderItem> items = new java.util.ArrayList<>();

    @Enumerated(EnumType.STRING)
    OrderStatus status = OrderStatus.PLACED;

    @Enumerated(EnumType.STRING)
    PaymentStatus paymentStatus = PaymentStatus.PENDING;

    String paymentMethod;

    @Column(precision = 12, scale = 2)
    BigDecimal subtotal;

    @Column(precision = 12, scale = 2)
    BigDecimal discount;

    @Column(precision = 12, scale = 2)
    BigDecimal tax;

    @Column(precision = 12, scale = 2)
    BigDecimal shippingCost;

    @Column(precision = 12, scale = 2)
    BigDecimal total;

    @Column(length = 1000)
    String shippingAddress;

    Instant createdAt = Instant.now();
    Instant updatedAt;

    public Order(UUID id, User user, List<OrderItem> items, OrderStatus status, PaymentStatus paymentStatus, String paymentMethod, BigDecimal subtotal, BigDecimal discount, BigDecimal tax, BigDecimal shippingCost, BigDecimal total, String shippingAddress, Instant createdAt, Instant updatedAt)
    {
        this.id = id;
        this.user = user;
        this.items = items;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.subtotal = subtotal;
        this.discount = discount;
        this.tax = tax;
        this.shippingCost = shippingCost;
        this.total = total;
        this.shippingAddress = shippingAddress;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId()
    {
        return id;
    }

    public void setId(UUID id)
    {
        this.id = id;
    }

    public User getUser()
    {
        return user;
    }

    public void setUser(User user)
    {
        this.user = user;
    }

    public List<OrderItem> getItems()
    {
        return items;
    }

    public void setItems(List<OrderItem> items)
    {
        this.items = items;
    }

    public OrderStatus getStatus()
    {
        return status;
    }

    public void setStatus(OrderStatus status)
    {
        this.status = status;
    }

    public PaymentStatus getPaymentStatus()
    {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus)
    {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod()
    {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod)
    {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getSubtotal()
    {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal)
    {
        this.subtotal = subtotal;
    }

    public BigDecimal getDiscount()
    {
        return discount;
    }

    public void setDiscount(BigDecimal discount)
    {
        this.discount = discount;
    }

    public BigDecimal getTax()
    {
        return tax;
    }

    public void setTax(BigDecimal tax)
    {
        this.tax = tax;
    }

    public BigDecimal getShippingCost()
    {
        return shippingCost;
    }

    public void setShippingCost(BigDecimal shippingCost)
    {
        this.shippingCost = shippingCost;
    }

    public BigDecimal getTotal()
    {
        return total;
    }

    public void setTotal(BigDecimal total)
    {
        this.total = total;
    }

    public String getShippingAddress()
    {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress)
    {
        this.shippingAddress = shippingAddress;
    }

    public Instant getCreatedAt()
    {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt)
    {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt()
    {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt)
    {
        this.updatedAt = updatedAt;
    }


}
