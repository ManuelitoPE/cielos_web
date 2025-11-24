import { Injectable, signal, computed } from '@angular/core';
import { Product, ProductVariant } from '../models/product.model';

export interface CartItem {
    product: Product;
    variant: ProductVariant;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    readonly items = signal<CartItem[]>([]);
    readonly isOpen = signal<boolean>(false);

    readonly total = computed(() =>
        this.items().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    );

    readonly itemCount = computed(() =>
        this.items().reduce((count, item) => count + item.quantity, 0)
    );

    addToCart(product: Product, variant: ProductVariant) {
        this.items.update(currentItems => {
            const existingItem = currentItems.find(item =>
                item.product.id === product.id &&
                item.variant.id === variant.id
            );

            if (existingItem) {
                return currentItems.map(item =>
                    (item.product.id === product.id && item.variant.id === variant.id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentItems, { product, variant, quantity: 1 }];
        });
        this.isOpen.set(true);
    }

    removeFromCart(productId: string, variantId: number) {
        this.items.update(items => items.filter(item =>
            !(item.product.id === productId && item.variant.id === variantId)
        ));
    }

    updateQuantity(productId: string, variantId: number, change: number) {
        this.items.update(currentItems => {
            return currentItems.map(item => {
                if (item.product.id === productId && item.variant.id === variantId) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            });
        });
    }

    toggleCart() {
        this.isOpen.update(open => !open);
    }

    // Checkout logic moved to CheckoutComponent
    /*
    checkout() {
        // ...
    }
    */
}
