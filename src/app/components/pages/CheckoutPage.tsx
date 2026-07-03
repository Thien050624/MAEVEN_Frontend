import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight, CreditCard, Smartphone, Lock, ArrowLeft, Package } from "lucide-react";
import { useApp } from "../../context/AppContext";

type Step = "shipping" | "delivery" | "payment" | "confirmation";

const steps: Step[] = ["shipping", "delivery", "payment", "confirmation"];
const stepLabels = { shipping: "Shipping", delivery: "Delivery", payment: "Payment", confirmation: "Confirmed" };

export function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, navigate, toast, isLoggedIn, user } = useApp();
  const [step, setStep] = useState<Step>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple">("card");
  const [form, setForm] = useState({
    firstName: user?.name.split(" ")[0] || "",
    lastName: user?.name.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });
  const [delivery, setDelivery] = useState("standard");
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const orderId = `MAE-${Math.floor(100000 + Math.random() * 900000)}`;

  const shippingCost = delivery === "express" ? 15 : delivery === "overnight" ? 30 : cartTotal >= 150 ? 0 : 8;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shippingCost + tax;

  const currentStepIdx = steps.indexOf(step);

  const handleNext = () => {
    const nextIdx = currentStepIdx + 1;
    if (nextIdx < steps.length) setStep(steps[nextIdx]);
    if (steps[nextIdx] === "confirmation") {
      setOrderPlaced(true);
      clearCart();
    }
  };

  const formatCard = (val: string) => val.replace(/\s/g, "").match(/.{1,4}/g)?.join(" ").substr(0, 19) || val;

  const OrderSummary = () => (
    <div className="bg-[var(--card)] rounded-2xl p-6 sticky top-24">
      <h3 className="font-bold mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => (
          <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
            <div className="relative w-12 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--accent)]">
              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--foreground)] text-[var(--background)] rounded-full text-[9px] flex items-center justify-center font-bold">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.product.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Size: {item.size}</p>
            </div>
            <span className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)] pt-4 space-y-2">
        {[
          { label: "Subtotal", value: `$${cartTotal.toFixed(2)}` },
          { label: "Shipping", value: shippingCost === 0 ? "Free" : `$${shippingCost}` },
          { label: "Tax", value: `$${tax.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="pt-3 border-t border-[var(--border)] flex justify-between font-black">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-8"
          >
            <Check size={48} className="text-green-600" />
          </motion.div>
          <h1 className="text-4xl font-black mb-3">Order Confirmed!</h1>
          <p className="text-[var(--muted-foreground)] mb-2">Thank you for your purchase</p>
          <div className="bg-[var(--card)] rounded-2xl p-6 my-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Order Number</span>
              <span className="font-bold font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Estimated Delivery</span>
              <span className="font-semibold">June 10–13, 2026</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Total Paid</span>
              <span className="font-bold text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("account", { tab: "orders" })}
              className="flex items-center justify-center gap-2 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold"
            >
              <Package size={18} /> Track Your Order
            </button>
            <button
              onClick={() => navigate("home")}
              className="py-4 border border-[var(--border)] rounded-2xl font-medium text-sm hover:bg-[var(--accent)] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate("cart")} className="p-2 rounded-xl hover:bg-[var(--accent)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-2xl font-black tracking-tight">Checkout</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-10">
          {steps.slice(0, 3).map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${currentStepIdx > i ? "cursor-pointer" : ""}`}
                onClick={() => currentStepIdx > i && setStep(s)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStepIdx > i ? "bg-green-500 text-white" :
                  step === s ? "bg-[var(--foreground)] text-[var(--background)]" :
                  "bg-[var(--accent)] text-[var(--muted-foreground)]"
                }`}>
                  {currentStepIdx > i ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === s ? "" : "text-[var(--muted-foreground)]"}`}>
                  {stepLabels[s]}
                </span>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-px mx-3 transition-colors ${currentStepIdx > i ? "bg-green-500" : "bg-[var(--border)]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === "shipping" && (
                <div className="space-y-5">
                  <h2 className="text-xl font-black">Shipping Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: "firstName", label: "First Name", placeholder: "Alexandra" },
                      { key: "lastName", label: "Last Name", placeholder: "Rivera" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-sm font-medium mb-1.5 block">{label}</label>
                        <input
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: "email", label: "Email", placeholder: "alex@email.com", type: "email" },
                      { key: "phone", label: "Phone", placeholder: "+1 (555) 000-0000", type: "tel" },
                    ].map(({ key, label, placeholder, type }) => (
                      <div key={key}>
                        <label className="text-sm font-medium mb-1.5 block">{label}</label>
                        <input
                          type={type}
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Address</label>
                    <input
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="123 Fashion Avenue, Apt 4B"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors text-sm"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { key: "city", label: "City", placeholder: "New York" },
                      { key: "state", label: "State", placeholder: "NY" },
                      { key: "zip", label: "ZIP Code", placeholder: "10001" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-sm font-medium mb-1.5 block">{label}</label>
                        <input
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] transition-colors text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    Continue to Delivery <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {step === "delivery" && (
                <div className="space-y-5">
                  <h2 className="text-xl font-black">Delivery Options</h2>
                  {[
                    { id: "standard", label: "Standard Delivery", sub: "3-5 business days", price: cartTotal >= 150 ? "Free" : "$8.00" },
                    { id: "express", label: "Express Delivery", sub: "1-2 business days", price: "$15.00" },
                    { id: "overnight", label: "Overnight Delivery", sub: "Next business day", price: "$30.00" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setDelivery(opt.id)}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        delivery === opt.id ? "border-[var(--foreground)] bg-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          delivery === opt.id ? "border-[var(--foreground)]" : "border-[var(--border)]"
                        }`}>
                          {delivery === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[var(--foreground)]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{opt.sub}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${opt.price === "Free" ? "text-green-600" : ""}`}>{opt.price}</span>
                    </label>
                  ))}
                  <button onClick={handleNext} className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center justify-center gap-2">
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {step === "payment" && (
                <div className="space-y-5">
                  <h2 className="text-xl font-black">Payment</h2>
                  <div className="flex gap-3">
                    {[
                      { id: "card" as const, label: "Credit Card", renderIcon: () => <CreditCard size={22} /> },
                      { id: "paypal" as const, label: "PayPal", renderIcon: () => <span className="text-xl font-black text-blue-600">P</span> },
                      { id: "apple" as const, label: "Apple Pay", renderIcon: () => <span className="text-xl font-bold"> Pay</span> },
                    ].map(({ id, label, renderIcon }) => (
                      <button
                        key={id}
                        onClick={() => setPaymentMethod(id)}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all text-xs font-medium ${
                          paymentMethod === id ? "border-[var(--foreground)] bg-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                        }`}
                      >
                        {renderIcon()}
                        {label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                        <div className="flex justify-between items-start mb-8">
                          <span className="text-xs tracking-widest opacity-70">MAEVEN</span>
                          <CreditCard size={24} className="opacity-70" />
                        </div>
                        <p className="text-lg font-mono tracking-widest mb-4">
                          {cardForm.number || "•••• •••• •••• ••••"}
                        </p>
                        <div className="flex justify-between text-xs">
                          <span className="opacity-70">{cardForm.name || "CARD HOLDER"}</span>
                          <span className="opacity-70">{cardForm.expiry || "MM/YY"}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Card Number</label>
                        <input
                          value={cardForm.number}
                          onChange={(e) => setCardForm((f) => ({ ...f, number: formatCard(e.target.value) }))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Cardholder Name</label>
                        <input
                          value={cardForm.name}
                          onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value.toUpperCase() }))}
                          placeholder="ALEXANDRA RIVERA"
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: "expiry", label: "Expiry (MM/YY)", placeholder: "06/28" },
                          { key: "cvv", label: "CVV", placeholder: "•••" },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="text-sm font-medium mb-1.5 block">{label}</label>
                            <input
                              type={key === "cvv" ? "password" : "text"}
                              value={cardForm[key as keyof typeof cardForm]}
                              onChange={(e) => setCardForm((f) => ({ ...f, [key]: e.target.value }))}
                              placeholder={placeholder}
                              maxLength={key === "cvv" ? 3 : 5}
                              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--foreground)] text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className="p-8 rounded-2xl border border-[var(--border)] text-center">
                      <p className="text-3xl font-black text-blue-600 mb-2">Pay<span className="text-blue-400">Pal</span></p>
                      <p className="text-sm text-[var(--muted-foreground)]">You'll be redirected to PayPal to complete your purchase</p>
                    </div>
                  )}

                  {paymentMethod === "apple" && (
                    <div className="p-8 rounded-2xl border border-[var(--border)] text-center">
                      <p className="text-4xl mb-2"> Pay</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Use Face ID or Touch ID to confirm payment</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Lock size={12} />
                    <span>Your payment information is encrypted and secure</span>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90"
                  >
                    <Lock size={16} /> Place Order — ${total.toFixed(2)}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Order Summary Sidebar */}
          <div className="hidden lg:block">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
