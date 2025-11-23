import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

declare const Culqi: any;

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
    cartService = inject(CartService);
    router = inject(Router);

    // TODO: Replace with your actual Public Key
    culqiPublicKey = 'pk_test_YOUR_PUBLIC_KEY';

    formData = {
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zip: '',
        paymentMethod: 'card',
        cardNumber: '',
        expiry: '',
        cvc: '',
        phoneNumber: '',
        approvalCode: '' // For Yape/Plin OTP
    };

    isProcessing = signal(false);
    isSuccess = signal(false);
    errorMessage = signal('');

    constructor() {
        this.initCulqi();
    }

    initCulqi() {
        if (typeof Culqi !== 'undefined') {
            Culqi.publicKey = this.culqiPublicKey;
        } else {
            // Retry if script hasn't loaded yet
            setTimeout(() => this.initCulqi(), 500);
        }
    }

    async onSubmit() {
        if (this.cartService.items().length === 0) return;
        this.isProcessing.set(true);
        this.errorMessage.set('');

        try {
            // 1. Create Token with Culqi
            const token = await this.createCulqiToken();

            // 2. Send Token to Backend
            await this.processBackendPayment(token);

            // 3. Success
            this.isSuccess.set(true);
            // this.cartService.clearCart(); // Implement if available
        } catch (error: any) {
            console.error('Payment Error:', error);
            this.errorMessage.set(error.message || 'Payment failed. Please try again.');
        } finally {
            this.isProcessing.set(false);
        }
    }

    private createCulqiToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (typeof Culqi === 'undefined') {
                reject(new Error('Culqi not initialized'));
                return;
            }

            // Configure Culqi settings
            Culqi.settings({
                title: 'Clothing Store',
                currency: 'PEN',
                description: 'Order Payment',
                amount: Math.round(this.cartService.total() * 100)
            });

            // Prepare payload based on method
            if (this.formData.paymentMethod === 'card') {
                // For cards, Culqi usually intercepts the form or we use custom token creation
                // Using custom token creation for better control
                // Note: In v4, we typically use Culqi.options and Culqi.open() or custom fields.
                // For this custom UI, we'll use the token generation directly if supported, 
                // or assume we are passing data to Culqi.

                // Simulating the token creation call for the custom UI inputs
                // In a real custom UI integration, you'd use Culqi.token.create()
                // mapping your inputs to what Culqi expects.

                // MAPPING DATA TO CULQI EXPECTED FORMAT
                (window as any).Culqi.token.create({
                    card_number: this.formData.cardNumber,
                    cvv: this.formData.cvc,
                    expiration_month: this.formData.expiry.split('/')[0],
                    expiration_year: '20' + this.formData.expiry.split('/')[1],
                    email: this.formData.email,
                }).then((token: any) => {
                    resolve(token.id);
                }).catch((err: any) => {
                    reject(new Error(err.user_message || 'Invalid card data'));
                });

            } else if (this.formData.paymentMethod === 'yape' || this.formData.paymentMethod === 'plin') {
                // For Yape/Plin (using Yape as example for Culqi)
                // Culqi Yape integration usually requires a specific payload
                (window as any).Culqi.token.create({
                    amount: Math.round(this.cartService.total() * 100),
                    currency_code: 'PEN',
                    email: this.formData.email,
                    payment_code: this.formData.approvalCode, // OTP
                    phone_number: this.formData.phoneNumber,
                    source_id: 'yape' // or appropriate source for Plin if supported
                }).then((token: any) => {
                    resolve(token.id);
                }).catch((err: any) => {
                    reject(new Error(err.user_message || 'Invalid Yape/Plin data'));
                });
            } else {
                // Bank Transfer (Manual) - No token needed, just process
                resolve('manual_transfer');
            }
        });
    }

    private async processBackendPayment(token: string) {
        if (token === 'manual_transfer') return; // Skip backend charge for manual

        const response = await fetch('http://localhost:3000/api/payments/charge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: token,
                amount: this.cartService.total(),
                email: this.formData.email
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Payment processing failed on server');
        }
    }

    backToStore() {
        this.router.navigate(['/']);
    }
}
