import { Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { PaymentRequestBody } from "./models/PaymentsRequestBody";

// TEST : sk_test_51NputjKvy7BFowS9fdbY0S1Zjp0HDC2WRZwp8vRzyHSAsUOSOxfzWNCF0nboryWA8Jp5ZJZVHWgPQI8orwTzYCZD00dGeVzihA
// TRUE : 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

@Injectable()
export class PaymentsService {
    private stripe;

    constructor() {
        this.stripe = new Stripe(
            "sk_test_51NputjKvy7BFowS9fdbY0S1Zjp0HDC2WRZwp8vRzyHSAsUOSOxfzWNCF0nboryWA8Jp5ZJZVHWgPQI8orwTzYCZD00dGeVzihA",
            {
                apiVersion: "2023-08-16"
            }
        );
    }

    createPayment(paymentRequestBody: PaymentRequestBody): Promise<any> {
        let sumAmount = 0;
        //    paymentRequestBody.products.forEach((product) => {
        //      sumAmount = sumAmount + product.price * product.quantity;
        //    });
        return this.stripe.paymentIntents.create({
            amount: 4000,
            currency: "eur",
            payment_method_types: ["card"]
        });
    }

    async confirmPayment(paymentIntentId): Promise<any> {
        return await this.stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: "pm_card_visa"
        });
    }
}
