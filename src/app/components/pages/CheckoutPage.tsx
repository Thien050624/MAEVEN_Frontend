import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Banknote, Check, ChevronRight, Lock, Package, QrCode, Truck } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { createOrder, type OrderDto } from "../../api/ordersApi";

type Step = "shipping" | "delivery" | "payment" | "confirmation";
type PaymentMethod = "qr" | "cod";
type ShippingField = "firstName" | "lastName" | "email" | "phone" | "address";

const steps: Step[] = ["shipping", "delivery", "payment", "confirmation"];
const stepLabels = {
  shipping: "Shipping",
  delivery: "Delivery",
  payment: "Payment",
  confirmation: "Confirmed",
};

const qrCells = [
  1, 1, 1, 0, 1, 0, 1, 1,
  1, 0, 1, 1, 0, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 1, 0,
  0, 1, 0, 1, 1, 0, 1, 1,
  1, 0, 1, 1, 0, 1, 0, 1,
  0, 1, 1, 0, 1, 0, 1, 0,
  1, 0, 1, 1, 1, 0, 1, 1,
  1, 1, 0, 0, 1, 1, 0, 1,
];

function formatVietnamPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("84")) {
    const local = digits.slice(2, 11);
    return `+84 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 9)}`.trim();
  }

  const local = digits.slice(0, 10);
  if (local.length <= 4) return local;
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, navigate, user, toast } = useApp();
  const [step, setStep] = useState<Step>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr");
  const [form, setForm] = useState({
    firstName: user?.name.split(" ")[0] || "",
    lastName: user?.name.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    address: "",
    country: "Vietnam",
  });
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<ShippingField, string>>>({});
  const [delivery, setDelivery] = useState("standard");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderDto | null>(null);
  const orderId = placedOrder?.id ?? `MAE-${Math.floor(100000 + Math.random() * 900000)}`;

  const shippingCost = delivery === "express" ? 15 : delivery === "same-day" ? 30 : cartTotal >= 150 ? 0 : 8;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shippingCost + tax;
  const currentStepIdx = steps.indexOf(step);

  const updateShippingField = (field: ShippingField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setShippingErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateShipping = () => {
    const nextErrors: Partial<Record<ShippingField, string>> = {};
    const phoneDigits = form.phone.replace(/\D/g, "");

    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (form.phone.trim() && phoneDigits.length < 10) nextErrors.phone = "Enter a valid Vietnam phone number.";
    if (!form.address.trim()) nextErrors.address = "Address is required.";

    setShippingErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fieldClassName = (field: ShippingField, multiline = false) =>
    `w-full px-4 py-3 rounded-xl border bg-[var(--background)] outline-none transition-colors text-sm ${
      multiline ? "resize-none" : ""
    } ${
      shippingErrors[field]
        ? "border-red-500 focus:border-red-500"
        : "border-[var(--border)] focus:border-[var(--foreground)]"
    }`;

  const handleNext = async () => {
    if (step === "shipping" && !validateShipping()) {
      toast("Please complete the highlighted shipping fields", "error");
      return;
    }

    const nextIdx = currentStepIdx + 1;
    const nextStep = steps[nextIdx];

    if (nextStep !== "confirmation") {
      if (nextIdx < steps.length) setStep(nextStep);
      return;
    }

    const token = localStorage.getItem("maeven_token");
    if (!token) {
      toast("Please sign in before placing your order", "info");
      navigate("auth", { mode: "login" });
      return;
    }

    if (cartItems.length === 0) {
      toast("Your cart is empty", "error");
      navigate("cart");
      return;
    }

    try {
      setPlacingOrder(true);
      const order = await createOrder(token, {
        shippingAddress: form,
        deliveryMethod: delivery,
        paymentMethod,
        items: cartItems,
      });
      setPlacedOrder(order);
      setOrderPlaced(true);
      clearCart();
      setStep("confirmation");
    } catch (error: any) {
      console.error(error);
      toast(error?.message || "Could not place order", "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  const OrderSummary = () => (
    <div className="bg-[var(--card)] rounded-2xl p-6 sticky top-24">
      <h3 className="font-bold mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => (
          <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center gap-3">
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
              <span className="font-semibold">{placedOrder?.deliveryMethod === "express" ? "24-48 hours" : placedOrder?.deliveryMethod === "same-day" ? "Same day" : "2-4 business days"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Payment Method</span>
              <span className="font-semibold">{(placedOrder?.paymentMethod ?? paymentMethod) === "qr" ? "Bank QR Transfer" : "Cash on Delivery"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Total</span>
              <span className="font-bold text-lg">${(placedOrder?.total ?? total).toFixed(2)}</span>
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
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate("cart")} className="p-2 rounded-xl hover:bg-[var(--accent)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-2xl font-black tracking-tight">Checkout</span>
        </div>

        <div className="flex items-center mb-10">
          {steps.slice(0, 3).map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`flex items-center gap-2 ${currentStepIdx > i ? "cursor-pointer" : ""}`}
                onClick={() => currentStepIdx > i && setStep(s)}
              >
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
                      { key: "firstName", label: "First Name", placeholder: "Linh" },
                      { key: "lastName", label: "Last Name", placeholder: "Nguyen" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-sm font-medium mb-1.5 block">{label}</label>
                        <input
                          value={form[key as keyof typeof form]}
                          onChange={(e) => updateShippingField(key as ShippingField, e.target.value)}
                          placeholder={placeholder}
                          className={fieldClassName(key as ShippingField)}
                        />
                        {shippingErrors[key as ShippingField] && (
                          <p className="mt-1.5 text-xs font-medium text-red-500">{shippingErrors[key as ShippingField]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateShippingField("email", e.target.value)}
                        placeholder="linh@email.com"
                        className={fieldClassName("email")}
                      />
                      {shippingErrors.email && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">{shippingErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Phone</label>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => updateShippingField("phone", formatVietnamPhone(e.target.value))}
                        placeholder="0912 345 678"
                        className={fieldClassName("phone")}
                      />
                      {shippingErrors.phone && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">{shippingErrors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Address</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => updateShippingField("address", e.target.value)}
                      placeholder="So nha, ten duong, phuong/xa, quan/huyen, tinh/thanh pho"
                      rows={4}
                      className={fieldClassName("address", true)}
                    />
                    {shippingErrors.address && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">{shippingErrors.address}</p>
                    )}
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
                    { id: "standard", label: "Standard Delivery", sub: "2-4 business days", price: cartTotal >= 150 ? "Free" : "$8.00" },
                    { id: "express", label: "Express Delivery", sub: "24-48 hours", price: "$15.00" },
                    { id: "same-day", label: "Same-day Delivery", sub: "Available in central districts", price: "$30.00" },
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
                  <h2 className="text-xl font-black">Payment Method</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { id: "qr" as const, label: "Bank QR Transfer", sub: "Scan and transfer before delivery", icon: QrCode },
                      { id: "cod" as const, label: "Cash on Delivery", sub: "Pay when your order arrives", icon: Truck },
                    ].map(({ id, label, sub, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setPaymentMethod(id)}
                        className={`text-left p-5 rounded-2xl border-2 transition-all ${
                          paymentMethod === id ? "border-[var(--foreground)] bg-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                        }`}
                      >
                        <Icon size={24} className="mb-4" />
                        <p className="font-bold text-sm">{label}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{sub}</p>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "qr" && (
                    <div className="rounded-2xl border border-[var(--border)] p-6">
                      <div className="grid sm:grid-cols-[180px_1fr] gap-6 items-center">
                        <div className="w-44 h-44 mx-auto bg-white rounded-xl p-4 grid grid-cols-8 gap-1 shadow-inner">
                          {qrCells.map((cell, index) => (
                            <div key={index} className={cell ? "bg-black rounded-[2px]" : "bg-white"} />
                          ))}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 font-bold">
                            <Banknote size={18} />
                            Bank Transfer
                          </div>
                          <div className="text-sm space-y-2">
                            <p><span className="text-[var(--muted-foreground)]">Bank:</span> MB Bank</p>
                            <p><span className="text-[var(--muted-foreground)]">Account:</span> 0123456789</p>
                            <p><span className="text-[var(--muted-foreground)]">Holder:</span> MAEVEN</p>
                            <p><span className="text-[var(--muted-foreground)]">Content:</span> {orderId}</p>
                            <p><span className="text-[var(--muted-foreground)]">Amount:</span> ${total.toFixed(2)}</p>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Your order will be confirmed after the transfer is verified.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="rounded-2xl border border-[var(--border)] p-6">
                      <div className="flex items-start gap-4">
                        <Truck size={24} />
                        <div>
                          <p className="font-bold">Pay when receiving your order</p>
                          <p className="text-sm text-[var(--muted-foreground)] mt-1">
                            Please prepare the exact amount when the shipper arrives. We will contact you before delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Lock size={12} />
                    <span>Your checkout details are protected and only used to process this order.</span>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={placingOrder}
                    className="w-full py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90"
                  >
                    {placingOrder ? (
                      <div className="w-5 h-5 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock size={16} /> Place Order - ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="hidden lg:block">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
