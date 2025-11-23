import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);
    private cartService = inject(CartService);

    product = signal<Product | null>(null);
    selectedSize = signal<string | null>(null);
    selectedColor = signal<string | null>(null);

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (id) {
                    return this.productService.getProduct(id);
                }
                return [];
            })
        ).subscribe(product => {
            this.product.set(product);
            // Reset selections when product changes
            this.selectedSize.set(null);
            this.selectedColor.set(null);
        });
    }

    selectSize(size: string) {
        this.selectedSize.set(size);
    }

    selectColor(color: string) {
        this.selectedColor.set(color);
    }

    addToCart() {
        const p = this.product();
        const size = this.selectedSize();
        const color = this.selectedColor();

        if (p && size && color) {
            this.cartService.addToCart(p, size, color);
            // Optional: Reset selections or show feedback
        }
    }
}
