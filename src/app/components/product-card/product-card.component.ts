import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
    @Input() product!: Product;

    getTotalStock(): number {
        if (!this.product.variants) return 0;
        return this.product.variants.reduce((acc, v) => {
            // Handle both _stock (backend raw) and stock properties
            const stock = v._stock ?? v.stock ?? 0;
            return acc + stock;
        }, 0);
    }

    isOutOfStock(): boolean {
        return this.getTotalStock() === 0;
    }
}
