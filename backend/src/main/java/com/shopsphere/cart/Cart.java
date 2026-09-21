package com.shopsphere.cart;

import jakarta.persistence.*;
import lombok.*;
import com.shopsphere.user.User;
import java.util.*;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
public class Cart
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @OneToOne(optional = false)
    User user;

    public Cart(UUID id, User user)
    {
        this.id = id;
        this.user = user;
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


}
