export interface ProductVariant {
    id: number;
    productId: string;
    sku: string;
    size: string;
    color: string;
    stock?: number;
    _stock?: number; // Backend uses _stock
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    variants: ProductVariant[];
}
