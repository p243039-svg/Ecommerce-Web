import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToastStore } from "@/stores/useToastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatCardNumber, detectCardBrand, validateZipCode, validatePhone, isValidUUID, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { countries, states } from "@/lib/geo-data";
import { sendOrderConfirmation } from "@/lib/resend";
import { createPaymentIntent, confirmPayment } from "@/lib/stripe/mock";

import { Link } from "react-router-dom";
import { MapPin, CreditCard, ClipboardCheck, CheckCircle, ArrowLeft, ArrowRight, Lock, ShoppingBag, } from "lucide-react";
const steps = [
    { id: "shipping", label: "Shipping", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: ClipboardCheck },
    { id: "confirmation", label: "Done", icon: CheckCircle },
];
export default function CheckoutPage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const items = useCartStore((s) => s.items);
    const getSubtotal = useCartStore((s) => s.getSubtotal);
    const getShipping = useCartStore((s) => s.getShipping);
    const getTax = useCartStore((s) => s.getTax);
    const getTotal = useCartStore((s) => s.getTotal);
    const clearCart = useCartStore((s) => s.clearCart);
    const addToast = useToastStore((s) => s.addToast);
    const settings = useSettingsStore();
    const [currentStep, setCurrentStep] = useState("shipping");
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState("");
    // Shipping form
    const [address, setAddress] = useState({
        fullName: user ? `${user.first_name} ${user.last_name || ""}` : "",
        phone: user?.phone || "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "PK", // Set default to Pakistan as discussed in context or just use first
    });
    // Payment form
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [payment, setPayment] = useState({
        cardNumber: "",
        cardHolder: "",
        expiryDate: "",
        cvv: "",
    });
    const COD_FEE = 200;
    const getFullTotal = () => {
        let total = getTotal();
        if (paymentMethod === "cod") {
            total += COD_FEE;
        }
        return total;
    };
    if (!user) {
        return (<div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center animate-fade-in">
          <Lock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sign in to Checkout
          </h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to complete your purchase.
          </p>
          <Link to="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>);
    }
    if (items.length === 0 && currentStep !== "confirmation") {
        return (<div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center animate-fade-in">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Add items to your cart before checking out.
          </p>
          <Link to="/products">
            <Button size="lg">Shop Now</Button>
          </Link>
        </div>
      </div>);
    }
    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
    const handleShippingNext = () => {
        if (!address.fullName ||
            !address.phone ||
            !address.street ||
            !address.city ||
            !address.state ||
            !address.zipCode ||
            !address.country) {
            addToast({ type: "warning", title: "Please fill in all address fields" });
            return;
        }
        if (!validatePhone(address.phone)) {
            addToast({ type: "warning", title: "Please enter a valid phone number" });
            return;
        }
        if (!validateZipCode(address.zipCode)) {
            addToast({ type: "warning", title: "Please enter a valid ZIP code" });
            return;
        }
        setCurrentStep("payment");
    };
    const handlePaymentNext = () => {
        if (paymentMethod === "card") {
            const num = payment.cardNumber.replace(/\s/g, "");
            if (num.length < 13 || !payment.cardHolder || !payment.expiryDate || !payment.cvv) {
                addToast({ type: "warning", title: "Please fill in all payment fields" });
                return;
            }
        }
        setCurrentStep("review");
    };
    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            const totalAmount = getFullTotal();
            if (paymentMethod === "card") {
                const pi = await createPaymentIntent(totalAmount);
                const result = await confirmPayment(pi.id);
                if (result.status !== "succeeded") {
                    addToast({
                        type: "error",
                        title: "Payment failed",
                        description: "Please try again or use a different card.",
                    });
                    setIsProcessing(false);
                    return;
                }
            }
            // IMPROVED USER SYNC (Prevent foreign key violations)
            let finalUserId = null;
            const MOCK_ADMIN_ID = "00000000-0000-0000-0000-000000000000";
            if (user?.id && isValidUUID(user.id) && user.id !== MOCK_ADMIN_ID) {
                try {
                    // Double check if user exists in public.users
                    const { data: pUser } = await supabase
                        .from("users")
                        .select("id")
                        .eq("id", user.id)
                        .single();
                    if (pUser) {
                        finalUserId = user.id;
                    }
                    else {
                        // Attempt to create profile if missing
                        const { error: syncError } = await supabase
                            .from("users")
                            .insert({
                            id: user.id,
                            email: user.email,
                            first_name: user.first_name || settings.storeName,
                            last_name: user.last_name || "Customer",
                            role: "customer"
                        });
                        if (!syncError)
                            finalUserId = user.id;
                    }
                }
                catch (e) {
                    console.warn("Profile check failed, proceeding as guest-linked order");
                }
            }
            else {
                console.log("Processing as guest or mock-admin order (no user_id link)");
            }
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert({
                user_id: finalUserId,
                full_name: address.fullName,
                email: user?.email,
                phone: address.phone,
                address: address.street,
                city: address.city,
                state: address.state,
                country: address.country, // Store code or name? Usually code is better but UI shows name.
                zip_code: address.zipCode,
                payment_method: paymentMethod,
                subtotal: getSubtotal(),
                shipping_cost: getShipping() + (paymentMethod === "cod" ? COD_FEE : 0),
                tax: getTax(),
                total: totalAmount,
                status: "pending",
            })
                .select()
                .single();
            if (orderError)
                throw orderError;
            // Insert Order Items
            const orderItems = items.map((item) => ({
                order_id: orderData.id,
                product_id: item.productId,
                product_name: item.product.name,
                quantity: item.quantity,
                price_at_purchase: item.product.price,
                size: item.size,
                color: item.color,
            }));
            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems);
            if (itemsError)
                throw itemsError;
            // SEND EMAIL NOTIFICATION
            await sendOrderConfirmation(user?.email || "", orderData.id, items, totalAmount);
            setOrderId(orderData.id.slice(0, 8).toUpperCase());
            clearCart();
            setCurrentStep("confirmation");
            addToast({ type: "success", title: "Order placed successfully!" });
        }
        catch (err) {
            console.error("CRITICAL CHECKOUT ERROR:", err);
            addToast({
                type: "error",
                title: "Order failed",
                description: err.message || "Something went wrong. Please check your connection or contact support."
            });
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (<div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, i) => (<React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${i <= currentStepIndex
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border text-muted-foreground"}`}>
                  <step.icon className="w-5 h-5"/>
                </div>
                <span className={cn("text-[10px] sm:text-xs mt-2 font-medium hidden sm:block", i <= currentStepIndex
                ? "text-primary"
                : "text-muted-foreground")}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (<div className={`flex-1 h-0.5 mx-3 mt-[-20px] transition-colors ${i < currentStepIndex ? "bg-primary" : "bg-border"}`}/>)}
            </React.Fragment>))}
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {/* Shipping Step */}
          {currentStep === "shipping" && (<div className="bg-surface rounded-2xl border border-border p-6 lg:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Full Name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} placeholder="John Doe"/>
                </div>
                <div className="sm:col-span-2">
                  <Input label="Phone Number" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="+92 300 1234567" type="tel"/>
                </div>
                <div className="sm:col-span-2">
                  <Input label="Street Address" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="123 Main Street"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground ml-1">Country</label>
                  <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value, state: "" })} className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                    {countries.map((c) => (<option key={c.code} value={c.code}>
                        {c.name}
                      </option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground ml-1">State / Province</label>
                  <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} disabled={!address.country} className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50">
                    <option value="">Select State</option>
                    {(states[address.country] || []).map((s) => (<option key={s} value={s}>
                        {s}
                      </option>))}
                  </select>
                </div>
                <Input label="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City Name"/>
                <Input label="ZIP / Postal Code" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} placeholder="10001"/>
              </div>
              <div className="flex justify-between mt-8">
                <Link to="/cart">
                  <Button variant="ghost">
                    <ArrowLeft className="w-4 h-4"/>
                    Back to Cart
                  </Button>
                </Link>
                <Button onClick={handleShippingNext}>
                  Continue to Payment
                  <ArrowRight className="w-4 h-4"/>
                </Button>
              </div>
            </div>)}

          {/* Payment Step */}
          {currentStep === "payment" && (<div className="bg-surface rounded-2xl border border-border p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button type="button" onClick={() => setPaymentMethod("card")} className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${paymentMethod === "card"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-surface text-muted-foreground hover:border-border/80"}`}>
                  <CreditCard className="w-8 h-8"/>
                  <span className="font-bold uppercase tracking-widest text-xs text-center">Credit / Debit Card</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod("cod")} className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${paymentMethod === "cod"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-surface text-muted-foreground hover:border-border/80"}`}>
                  <ShoppingBag className="w-8 h-8"/>
                  <span className="font-bold uppercase tracking-widest text-xs text-center">Cash on Delivery</span>
                </button>
              </div>

              {paymentMethod === "card" ? (<div className="space-y-4 animate-slide-up">
                  <div>
                    <Input label="Card Number" value={payment.cardNumber} onChange={(e) => setPayment({
                    ...payment,
                    cardNumber: formatCardNumber(e.target.value),
                })} placeholder="4242 4242 4242 4242" maxLength={19} icon={<CreditCard className="w-4 h-4"/>}/>
                    {payment.cardNumber && (<p className="text-xs text-muted-foreground mt-1">
                        {detectCardBrand(payment.cardNumber)?.toUpperCase() || ""}
                      </p>)}
                  </div>
                  <Input label="Cardholder Name" value={payment.cardHolder} onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value })} placeholder="JOHN DOE"/>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry Date" value={payment.expiryDate} onChange={(e) => setPayment({ ...payment, expiryDate: e.target.value })} placeholder="MM/YY" maxLength={5}/>
                    <Input label="CVV" value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="123" maxLength={4} type="password"/>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5"/>
                    This is a mock payment form. No real charges will be made.
                  </div>
                </div>) : (<div className="p-8 border-2 border-dashed border-border rounded-2xl text-center animate-fade-in bg-muted/20">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-primary"/>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Cash on Delivery</h3>
                  <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                    Pay with cash upon delivery. Please note there is an additional 
                    <span className="font-bold text-foreground mx-1">{formatPrice(COD_FEE)}</span> 
                    shipping surcharge for this service.
                  </p>
                </div>)}
              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setCurrentStep("shipping")}>
                  <ArrowLeft className="w-4 h-4"/>
                  Back
                </Button>
                <Button onClick={handlePaymentNext}>
                  Review Order
                  <ArrowRight className="w-4 h-4"/>
                </Button>
              </div>
            </div>)}

          {/* Review Step */}
          {currentStep === "review" && (<div className="space-y-6">
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Order Review
                </h2>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (<div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.product.images[0]?.url || "/placeholder.jpg"} alt={item.product.name}  className="object-cover absolute inset-0 w-full h-full object-cover" sizes="64px"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.size} / {item.color} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>))}
                </div>

                <hr className="my-4 border-border"/>

                {/* Address Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Ship to:</h4>
                    <p className="text-muted-foreground">
                      {address.fullName}
                      <br />
                      {address.phone}
                      <br />
                      {address.street}
                      <br />
                      {address.city}, {address.state} {address.zipCode}
                      <br />
                      {countries.find(c => c.code === address.country)?.name || address.country}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Payment:</h4>
                    <p className="text-muted-foreground uppercase tracking-wider font-bold">
                      {paymentMethod === "card" ? (<>
                          Card •••• {payment.cardNumber.replace(/\s/g, "").slice(-4)}
                          <br />
                          <span className="text-[10px] font-normal opacity-60">Verified Payment</span>
                        </>) : ("Cash on Delivery")}
                    </p>
                  </div>
                </div>

                <hr className="my-4 border-border"/>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {getShipping() === 0 ? (<span className="text-success">Free</span>) : (formatPrice(getShipping()))}
                    </span>
                  </div>
                  {paymentMethod === "cod" && (<div className="flex justify-between text-primary font-medium animate-slide-right">
                      <span>COD Surcharge</span>
                      <span>{formatPrice(COD_FEE)}</span>
                    </div>)}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(getTax())}</span>
                  </div>
                  <hr className="border-border"/>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(getFullTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep("payment")}>
                  <ArrowLeft className="w-4 h-4"/>
                  Back
                </Button>
                <Button size="lg" onClick={handlePlaceOrder} isLoading={isProcessing}>
                  <Lock className="w-4 h-4"/>
                  Place Order — {formatPrice(getFullTotal())}
                </Button>
              </div>
            </div>)}

          {/* Confirmation */}
          {currentStep === "confirmation" && (<div className="text-center py-12 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success"/>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Thank You!
              </h2>
              <p className="text-muted-foreground mb-2">
                Your order has been placed successfully.
              </p>
              <Badge variant="gold" size="md">
                Order #{orderId}
              </Badge>
              <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
                We&apos;ve sent a confirmation email with your order details.
                You can track your order from your profile.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link to="/profile/orders">
                  <Button variant="outline">View Orders</Button>
                </Link>
                <Link to="/products">
                  <Button>Continue Shopping</Button>
                </Link>
              </div>
            </div>)}
        </div>
      </div>
    </div>);
}
