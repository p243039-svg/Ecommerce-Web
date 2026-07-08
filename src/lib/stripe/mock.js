import { generateId } from "@/lib/utils";
// Simulates Stripe payment processing
export async function createPaymentIntent(amount) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
        id: `pi_mock_${generateId()}`,
        amount,
        currency: "usd",
        status: "pending",
        created_at: new Date().toISOString(),
    };
}
export async function confirmPayment(paymentIntentId) {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // 95% success rate for demo
    const isSuccess = Math.random() > 0.05;
    return {
        id: paymentIntentId,
        amount: 0,
        currency: "usd",
        status: isSuccess ? "succeeded" : "failed",
        created_at: new Date().toISOString(),
    };
}
export async function processRefund(paymentIntentId) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        refundId: `re_mock_${generateId()}`,
    };
}
