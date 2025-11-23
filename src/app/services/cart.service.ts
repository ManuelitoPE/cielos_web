import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
    product: Product;
    quantity: number;
    selectedSize: string;
    selectedColor: string;
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

    addToCart(product: Product, size: string, color: string) {
        this.items.update(currentItems => {
            const existingItem = currentItems.find(item =>
                item.product.id === product.id &&
                item.selectedSize === size &&
                item.selectedColor === color
            );

            if (existingItem) {
                return currentItems.map(item =>
                    (item.product.id === product.id && item.selectedSize === size && item.selectedColor === color)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentItems, { product, quantity: 1, selectedSize: size, selectedColor: color }];
        });
        this.isOpen.set(true);
    }

    removeFromCart(productId: string, size: string, color: string) {
        this.items.update(items => items.filter(item =>
            !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
        ));
    }

    updateQuantity(productId: string, size: string, color: string, change: number) {
        this.items.update(currentItems => {
            return currentItems.map(item => {
                if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
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
