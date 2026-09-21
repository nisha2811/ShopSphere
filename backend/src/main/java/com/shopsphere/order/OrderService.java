package com.shopsphere.order;

import com.shopsphere.audit.AuditLog;
import com.shopsphere.audit.AuditLogRepository;
import com.shopsphere.cart.Cart;
import com.shopsphere.cart.CartItem;
import com.shopsphere.cart.CartItemRepository;
import com.shopsphere.cart.CartRepository;
import com.shopsphere.exception.ApiException;
import com.shopsphere.payment.Payment;
import com.shopsphere.payment.PaymentRepository;
import com.shopsphere.payment.PaymentStatus;
import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService
{
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("12.00");
    private static final BigDecimal TAX_RATE = new BigDecimal("0.05");
    private final UserRepository users;
    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final OrderItemRepository orderItems;
    private final PaymentRepository payments;
    private final AuditLogRepository audit;

    public OrderService(UserRepository users,
                        CartRepository carts, CartItemRepository cartItems, ProductRepository products, OrderRepository orders, OrderItemRepository orderItems, PaymentRepository payments, AuditLogRepository audit) {
        this.users = users; this.carts = carts; this.cartItems = cartItems; this.products = products; this.orders = orders; this.orderItems = orderItems; this.payments = payments; this.audit = audit;
    }

    private User user(String email) { return users.findByEmailIgnoreCase(email).orElseThrow(); }

    @Transactional
    public Order place(String email, String address, String paymentMethod) {
        User user = user(email);
        Cart cart = carts.findByUserId(user.getId()).orElseThrow(() -> new ApiException("Cart is empty", HttpStatus.BAD_REQUEST));
        List<CartItem> cartItemsForOrder = cartItems.findByCartId(cart.getId());
        if (cartItemsForOrder.isEmpty()) throw new ApiException("Cart is empty", HttpStatus.BAD_REQUEST);
        for (CartItem item : cartItemsForOrder) {
            Product product = products.findById(item.getProduct().getId()).orElseThrow();
            if (!product.isActive() || product.getStockQuantity() < item.getQuantity()) throw new ApiException("Insufficient stock for " + product.getName(), HttpStatus.CONFLICT);
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(address);
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cartItemsForOrder) subtotal = subtotal.add(price(item.getProduct()).multiply(BigDecimal.valueOf(item.getQuantity())));
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        order.setPaymentMethod(paymentMethod); order.setSubtotal(subtotal); order.setDiscount(BigDecimal.ZERO); order.setTax(tax); order.setShippingCost(SHIPPING_FEE); order.setTotal(subtotal.add(tax).add(SHIPPING_FEE));
        order = orders.save(order);

        for (CartItem item : cartItemsForOrder) {
            Product product = products.findById(item.getProduct().getId()).orElseThrow();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity()); products.save(product);
            OrderItem orderItem = new OrderItem(); orderItem.setOrder(order); orderItem.setProduct(product); orderItem.setQuantity(item.getQuantity()); orderItem.setUnitPrice(price(product)); orderItems.save(orderItem);
        }
        Payment payment = new Payment(); payment.setOrder(order); payment.setAmount(order.getTotal()); payment.setStatus(PaymentStatus.SUCCESS); payments.save(payment);
        order.setPaymentStatus(PaymentStatus.SUCCESS); orders.save(order); cartItems.deleteAll(cartItemsForOrder);
        AuditLog log = new AuditLog(); log.setUser(user); log.setAction("ORDER_PLACED"); log.setEntityType("ORDER"); log.setEntityId(order.getId().toString()); log.setDescription("Customer placed order"); audit.save(log);
        return order;
    }

    public List<Order> mine(String email) { return orders.findByUserIdOrderByCreatedAtDesc(user(email).getId()); }

    public Order get(String email, UUID id) {
        Order order = orders.findById(id).orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        if (!order.getUser().getEmail().equalsIgnoreCase(email) && !user(email).getRole().equals("ADMIN")) throw new ApiException("Forbidden", HttpStatus.FORBIDDEN);
        return order;
    }

    @Transactional
    public Order cancel(String email, UUID id) {
        Order order = get(email, id);
        if (!(order.getStatus() == OrderStatus.PLACED || order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.PROCESSING)) throw new ApiException("Order cannot be cancelled at this stage", HttpStatus.BAD_REQUEST);
        for (OrderItem item : orderItems.findByOrderId(id)) { Product product = item.getProduct(); product.setStockQuantity(product.getStockQuantity() + item.getQuantity()); products.save(product); }
        order.setStatus(OrderStatus.CANCELLED); order.setPaymentStatus(PaymentStatus.REFUNDED); order.setUpdatedAt(Instant.now()); return orders.save(order);
    }

    @Transactional
    public Order status(UUID id, OrderStatus next, User admin) {
        Order order = orders.findById(id).orElseThrow();
        if (!allowed(order.getStatus(), next)) throw new ApiException("Invalid order status transition", HttpStatus.BAD_REQUEST);
        order.setStatus(next); order.setUpdatedAt(Instant.now()); Order saved = orders.save(order);
        AuditLog log = new AuditLog(); log.setUser(admin); log.setAction("ORDER_STATUS_CHANGED"); log.setEntityType("ORDER"); log.setEntityId(id.toString()); log.setDescription(next.name()); audit.save(log);
        return saved;
    }

    private boolean allowed(OrderStatus current, OrderStatus next) { return switch (current) { case PLACED -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED; case CONFIRMED -> next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED; case PROCESSING -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED; case SHIPPED -> next == OrderStatus.OUT_FOR_DELIVERY; case OUT_FOR_DELIVERY -> next == OrderStatus.DELIVERED; default -> false; }; }
    private BigDecimal price(Product product) { return product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(product.getPrice()) < 0 ? product.getDiscountPrice() : product.getPrice(); }
}
