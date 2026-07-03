import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, X, Tag, Truck, ArrowRight, ShoppingBag, ChevronRight } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ProductCard } from "../ProductCard";

const COUPONS: Record<string, number> = {
  MAEVEN20: 20,
  WELCOME10: 10,
  VIP15: 15,
};

export function CartPage() {
  const { allProducts, cartItems, updateCartQty, removeFromCart, cartTotal, clearCart, navigate, toast } = useApp();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [shipping, setShipping] = useState("standard");

  const shippingCost = shipping === "express" ? 15 : shipping === "overnight" ? 30 : cartTotal >= 150 ? 0 : 8;
  const discount = appliedCoupon ? (cartTotal * COUPONS[appliedCoupon]) / 100 : 0;
  const tax = (cartTotal - discount) * 0.08;
  const total = cartTotal - discount + shippingCost + tax;

  const applyCoupon = () => {
    if (COUPONS[coupon.toUpperCase()]) {
      setAppliedCoupon(coupon.toUpperCase());
      toast(`Coupon applied! ${COUPONS[coupon.toUpperCase()]}% off ✓`);
    } else {
      toast("Invalid coupon code", "error");
    }
  };

  const recommended = allProducts.filter((p) => !cartItems.find((i) => i.product.id === p.id)).slice(0, 4);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center py-20 px-4">
        <ShoppingBag size={80} className="text-[var(--border)] mb-6" />
        <h2 className="text-3xl font-black mb-3">Your Bag is Empty</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-center max-w-sm">
          Add some pieces you love to begin your order
        </p>
        <button
          onClick={() => navigate("listing", {})}
          className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center gap-2"
        >
          Start Shopping <ArrowRight size={18} />
        </button>

        {/* Recommended */}
        <div className="w-full max-w-[1400px] mt-20 px-4 sm:px-8">
          <h3 className="text-2xl font-black mb-6 text-center">You Might Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommended.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black tracking-tight">My Bag <span className="text-[var(--muted-foreground)] text-2xl font-normal">({cartItems.length})</span></h1>
          <button onClick={clearCart} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Cart Items */}
          <div className="space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="bg-[var(--card)] rounded-2xl p-4 sm:p-5 flex gap-4"
                >
                  {/* Image */}
                  <button
                    onClick={() => navigate("product", { productId: item.product.id })}
                    className="w-24 sm:w-28 h-32 sm:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--accent)]"
                  >
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase">{item.product.brand}</p>
                        <button
                          onClick={() => navigate("product", { productId: item.product.id })}
                          className="font-semibold text-sm sm:text-base leading-snug hover:underline mt-0.5 text-left"
                        >
                          {item.product.name}
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-4 h-4 rounded-full border border-[var(--border)]" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-[var(--muted-foreground)]">Size: {item.size}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty */}
                      <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateCartQty(item.product.id, item.size, item.color, item.quantity - 1)}
                          className="p-2 hover:bg-[var(--accent)] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, item.size, item.color, item.quantity + 1)}
                          className="p-2 hover:bg-[var(--accent)] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-[var(--muted-foreground)]">${item.product.price} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-[var(--card)] rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Tag size={16} /> Promo Code
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-xl text-green-600 dark:text-green-400">
                  <span className="text-sm font-semibold">✓ {appliedCoupon} applied — {COUPONS[appliedCoupon]}% off</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-xs hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Enter code (try MAEVEN20)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)] transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-semibold hover:opacity-90"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="bg-[var(--card)] rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Truck size={16} /> Delivery
              </h3>
              <div className="space-y-3">
                {[
                  { id: "standard", label: "Standard (3-5 days)", price: cartTotal >= 150 ? "Free" : "$8" },
                  { id: "express", label: "Express (1-2 days)", price: "$15" },
                  { id: "overnight", label: "Overnight", price: "$30" },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          shipping === opt.id ? "border-[var(--foreground)]" : "border-[var(--border)]"
                        }`}
                        onClick={() => setShipping(opt.id)}
                      >
                        {shipping === opt.id && <div className="w-2 h-2 rounded-full bg-[var(--foreground)]" />}
                      </div>
                      <span className="text-sm" onClick={() => setShipping(opt.id)}>{opt.label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${opt.price === "Free" ? "text-green-600" : ""}`}>{opt.price}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[var(--card)] rounded-2xl p-5 space-y-3">
              <h3 className="font-bold mb-4">Order Summary</h3>
              {[
                { label: "Subtotal", value: `$${cartTotal.toFixed(2)}` },
                ...(discount > 0 ? [{ label: `Discount (${COUPONS[appliedCoupon!]}%)`, value: `-$${discount.toFixed(2)}` }] : []),
                { label: "Shipping", value: shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}` },
                { label: "Tax (8%)", value: `$${tax.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">{label}</span>
                  <span className={label.includes("Discount") ? "text-green-600 font-medium" : ""}>{value}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-[var(--border)] flex justify-between font-black text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate("checkout")}
                className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-2"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                Secure checkout powered by Stripe
              </p>
              <div className="flex justify-center gap-2">
                {["visa", "mc", "amex", "paypal", "apple"].map((p) => (
                  <div key={p} className="px-2 py-1 rounded bg-[var(--accent)] text-[9px] uppercase font-bold text-[var(--muted-foreground)]">
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <button
              onClick={() => navigate("listing", {})}
              className="w-full py-3 border border-[var(--border)] rounded-2xl text-sm font-medium hover:bg-[var(--accent)] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <section className="mt-16">
            <h3 className="text-2xl font-black mb-6">Complete Your Look</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommended.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} variant="compact" />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
