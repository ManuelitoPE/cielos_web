import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

import { CheckoutComponent } from './components/checkout/checkout.component';

export const routes: Routes = [
    { path: '', component: ProductListComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: 'checkout', component: CheckoutComponent },
    { path: '**', redirectTo: '' }
];
