package com.shopsphere.wishlist;

import java.util.UUID;

public record WishlistResponse(UUID id, WishlistProductResponse product)
{

}