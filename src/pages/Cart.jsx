import React from "react";
import { Link } from "react-router-dom";

import { useCartStore } from "@/stores/useCartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, ArrowLeft, ArrowRight, Minus, Plus, Trash2, Truck, Tag, } from "lucide-react";
export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, getSubtotal, getShipping, getTax, getTotal, getItemCount, } = useCartStore();
    if (items.length === 0) {
        return (<div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <ShoppingBag className="w-24 h-24 text-muted-foreground/20 mx-auto mb-6"/>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added any items yet. Start exploring our
            collection to find something you love.
          </p>
          <Link to="/products">
            <Button size="lg">
              <ArrowLeft className="w-5 h-5"/>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>);
    }
    const subtotal = getSubtotal();
    const shipping = getShipping();
    const tax = getTax();
    const total = getTotal();
    return (<div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Shopping Cart ({getItemCount()})
          </h1>
          <button onClick={clearCart} className="text-sm text-error hover:text-error/80 transition-colors">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (<div key={item.id} className="flex gap-4 p-4 bg-surface rounded-2xl border border-border animate-fade-in">
                <div className="relative w-24 h-32 sm:w-32 sm:h-40 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.product.images[0]?.url || "/placeholder.jpg"} alt={item.product.name}  className="object-cover absolute inset-0 w-full h-full object-cover" sizes="128px"/>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {item.product.brand}
                        </p>
                        <Link to={`/products/${item.product.slug}`} className="text-base font-semibold text-foreground hover:text-primary transition-colors">
                          {item.product.name}
                        </Link>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted-foreground hover:text-error">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Size: {item.size}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Color: {item.color}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-surface-hover transition-colors">
                        <Minus className="w-3.5 h-3.5"/>
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-surface-hover transition-colors" disabled={item.quantity >= item.product.stock_quantity}>
                        <Plus className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl border border-border p-6 sticky top-24 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5"/>
                    Shipping
                  </span>
                  <span className="font-medium text-foreground">
                    {shipping === 0 ? (<span className="text-success">Free</span>) : (formatPrice(shipping))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(tax)}
                  </span>
                </div>
                <hr className="border-border"/>
                <div className="flex justify-between text-base">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {shipping > 0 && (<div className="bg-primary/5 rounded-lg p-3 text-sm">
                  <p className="text-primary font-medium flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5"/>
                    Add {formatPrice(100 - subtotal)} more for free shipping!
                  </p>
                </div>)}

              <Link to="/checkout" className="block">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5"/>
                </Button>
              </Link>

              <Link to="/products" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
