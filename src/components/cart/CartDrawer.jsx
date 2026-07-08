import React from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
export function CartDrawer({ isOpen, onClose }) {
    const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    return (<>
      {/* Backdrop */}
      {isOpen && (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose}/>)}

      {/* Drawer */}
      <div className={cn("fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface border-l border-border z-50 shadow-2xl", "transition-transform duration-300 ease-out", isOpen ? "translate-x-0" : "translate-x-full")}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary"/>
            <h2 className="text-lg font-semibold">Cart ({mounted ? getItemCount() : 0})</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto h-[calc(100%-180px)] px-6 py-4">
          {(!mounted || items.length === 0) ? (<div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4"/>
              <p className="text-lg font-medium text-foreground mb-1">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Add items to get started
              </p>
              <Button variant="outline" onClick={onClose}>
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>) : (<div className="space-y-4">
              {items.map((item) => (<div key={item.id} className="flex gap-4 p-3 rounded-xl bg-muted/50 animate-fade-in">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.product.images[0]?.url || "/placeholder.jpg"} alt={item.product.name} className="object-cover w-full h-full absolute inset-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.size} / {item.color}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-surface-hover transition-colors">
                        <Minus className="w-3 h-3"/>
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-surface-hover transition-colors">
                        <Plus className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="self-start p-1 rounded hover:bg-surface-hover transition-colors">
                    <X className="w-4 h-4 text-muted-foreground"/>
                  </button>
                </div>))}
            </div>)}
        </div>

        {/* Footer */}
        {(mounted && items.length > 0) && (<div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-border bg-surface">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(getSubtotal())}
              </span>
            </div>
            <Link to="/cart" onClick={onClose}>
              <Button className="w-full" size="lg">
                View Cart
                <ArrowRight className="w-4 h-4"/>
              </Button>
            </Link>
          </div>)}
      </div>
    </>);
}
