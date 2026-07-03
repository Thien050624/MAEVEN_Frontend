import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Award,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Edit3,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Star,
  User,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ProductCard } from "../ProductCard";
import { fetchMyOrders, type OrderDto } from "../../api/ordersApi";

type Tab = "overview" | "orders" | "wishlist" | "settings";

const statusColors: Record<string, string> = {
  Pending: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "In Transit": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Processing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Cancelled: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const paymentStatusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  AwaitingTransfer: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Paid: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  Failed: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  Refunded: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
};

const navItems: { id: Tab; icon: typeof User; label: string }[] = [
  { id: "overview", icon: User, label: "Overview" },
  { id: "orders", icon: Package, label: "Orders" },
  { id: "wishlist", icon: Heart, label: "Wishlist" },
  { id: "settings", icon: Settings, label: "Settings" },
];

function getPaymentMethodLabel(method: string) {
  return method === "cod" ? "Cash on Delivery" : "Bank QR Transfer";
}

function StatusBadge({ value, type = "order" }: { value: string; type?: "order" | "payment" }) {
  const colors = type === "payment" ? paymentStatusColors : statusColors;
  return (
    <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-semibold ${colors[value] ?? colors.Pending}`}>
      {value}
    </span>
  );
}

export function AccountDashboard() {
  const { user, logout, navigate, wishlist, pageParams, toast } = useApp();
  const [tab, setTab] = useState<Tab>((pageParams.tab as Tab) || "overview");
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("maeven_token");
    if (!token || !user) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    fetchMyOrders(token)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) toast("Could not load your orders", "error");
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, toast]);

  if (!user) return null;

  const tierColors = {
    Silver: "bg-gray-100 text-gray-600",
    Gold: "bg-amber-100 text-amber-700",
    Platinum: "bg-purple-100 text-purple-700",
  };

  const openOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setTab("orders");
  };

  const handleLogout = () => {
    logout();
    navigate("home");
    toast("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
        <h1 className="text-3xl font-black tracking-tight mb-8">My Account</h1>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside>
            <div className="bg-[var(--card)] rounded-2xl p-6 mb-4 text-center">
              <div className="relative inline-block mb-3">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover mx-auto" />
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--foreground)] text-[var(--background)] rounded-full flex items-center justify-center">
                  <Edit3 size={12} />
                </button>
              </div>
              <h2 className="font-bold text-lg">{user.name}</h2>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">{user.email}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${tierColors[user.tier]}`}>
                <Award size={12} /> {user.tier} Member
              </span>
            </div>

            <nav className="bg-[var(--card)] rounded-2xl overflow-hidden">
              {navItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium transition-colors border-b border-[var(--border)] last:border-0 ${
                    tab === id
                      ? "bg-[var(--accent)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} />
                    {label}
                  </span>
                  <ChevronRight size={14} />
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </aside>

          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Orders", value: orders.length.toString(), icon: Package },
                    { label: "Wishlist Items", value: wishlist.length.toString(), icon: Heart },
                    { label: "Loyalty Points", value: "3,240", icon: Award },
                    { label: "Reviews Given", value: "7", icon: Star },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-[var(--card)] rounded-2xl p-5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center mb-3">
                        <Icon size={18} />
                      </div>
                      <p className="text-2xl font-black">{value}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[var(--card)] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg">Recent Orders</h3>
                    <button onClick={() => setTab("orders")} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => openOrderDetails(order.id)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--accent)] transition-colors text-left"
                      >
                        <img src={order.items[0]?.productImage} alt="" className="w-12 h-14 rounded-xl object-cover bg-[var(--accent)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-mono">{order.id}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {new Date(order.createdAt).toLocaleDateString()} - {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusBadge value={order.status} />
                          <p className="text-sm font-bold mt-1">${order.total.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                    {ordersLoading && <p className="text-sm text-[var(--muted-foreground)] py-6 text-center">Loading orders...</p>}
                    {!ordersLoading && orders.length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)] py-6 text-center">No orders yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--foreground)] text-[var(--background)] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs opacity-60 mb-1">Your Status</p>
                      <p className="text-xl font-black">{user.tier} Member</p>
                    </div>
                    <Award size={36} className="opacity-30" />
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs opacity-60 mb-1.5">
                      <span>3,240 points</span>
                      <span>Platinum at 5,000</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: "64.8%" }} />
                    </div>
                  </div>
                  <p className="text-xs opacity-60">1,760 points to Platinum status</p>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div>
                <h2 className="text-xl font-black mb-6">Order History</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-[var(--card)] rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-bold font-mono">{order.id}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <StatusBadge value={order.status} />
                      </div>

                      <div className="flex items-center gap-3 border-t border-[var(--border)] pt-4">
                        <img src={order.items[0]?.productImage} alt="" className="w-16 h-20 rounded-xl object-cover bg-[var(--accent)]" />
                        <div className="flex-1">
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </p>
                          <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            {getPaymentMethodLabel(order.paymentMethod)} - {order.paymentStatus}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                            className="px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-xl hover:bg-[var(--accent)] transition-colors"
                          >
                            {selectedOrderId === order.id ? "Hide Details" : "View Details"}
                          </button>
                          {order.status === "Delivered" && (
                            <button className="px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-xl hover:bg-[var(--accent)] transition-colors">
                              Return
                            </button>
                          )}
                        </div>
                      </div>

                      {selectedOrderId === order.id && (
                        <div className="mt-5 grid xl:grid-cols-[1fr_320px] gap-5 border-t border-[var(--border)] pt-5">
                          <div>
                            <h3 className="text-sm font-bold mb-3">Items purchased</h3>
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <button
                                  key={`${order.id}-${item.productId}-${item.size}-${item.color}`}
                                  type="button"
                                  onClick={() => navigate("product", { productId: item.productId })}
                                  className="w-full flex gap-3 rounded-xl border border-[var(--border)] p-3 text-left hover:bg-[var(--accent)] transition-colors"
                                >
                                  <img src={item.productImage} alt={item.productName} className="w-16 h-20 rounded-lg object-cover bg-[var(--accent)]" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{item.productName}</p>
                                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Size {item.size} - Color {item.color}</p>
                                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Qty {item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-bold">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-xl border border-[var(--border)] p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <MapPin size={15} />
                                <h3 className="text-sm font-bold">Shipping address</h3>
                              </div>
                              <p className="text-sm font-semibold">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                              </p>
                              <p className="text-sm text-[var(--muted-foreground)] mt-1">{order.shippingAddress.phone}</p>
                              <p className="text-sm text-[var(--muted-foreground)] mt-1">{order.shippingAddress.email}</p>
                              <p className="text-sm text-[var(--muted-foreground)] mt-1">{order.shippingAddress.address}</p>
                              <p className="text-sm text-[var(--muted-foreground)] mt-1">{order.shippingAddress.country}</p>
                            </div>

                            <div className="rounded-xl border border-[var(--border)] p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <CreditCard size={15} />
                                <h3 className="text-sm font-bold">Payment</h3>
                              </div>
                              <p className="text-sm font-semibold">{getPaymentMethodLabel(order.paymentMethod)}</p>
                              <div className="mt-2">
                                <StatusBadge value={order.paymentStatus} type="payment" />
                              </div>
                              {order.paymentMethod === "qr" && order.paymentStatus !== "Paid" && (
                                <p className="text-xs text-[var(--muted-foreground)] mt-3">
                                  Transfer note: {order.id}. Admin will mark this order as paid after confirming your bank transfer.
                                </p>
                              )}
                              {order.paymentMethod === "cod" && (
                                <p className="text-xs text-[var(--muted-foreground)] mt-3">Pay when the package is delivered.</p>
                              )}
                            </div>

                            <div className="rounded-xl border border-[var(--border)] p-4">
                              <h3 className="text-sm font-bold mb-3">Order status</h3>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--muted-foreground)]">Current status</span>
                                <StatusBadge value={order.status} />
                              </div>
                              <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-[var(--muted-foreground)]">Subtotal</span>
                                  <span>${order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[var(--muted-foreground)]">Shipping</span>
                                  <span>${order.shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[var(--muted-foreground)]">Tax</span>
                                  <span>${order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t border-[var(--border)] pt-2 font-bold">
                                  <span>Total</span>
                                  <span>${order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {ordersLoading && (
                    <div className="text-center py-16 bg-[var(--card)] rounded-2xl">
                      <p className="text-sm text-[var(--muted-foreground)]">Loading orders...</p>
                    </div>
                  )}

                  {!ordersLoading && orders.length === 0 && (
                    <div className="text-center py-16 bg-[var(--card)] rounded-2xl">
                      <Package size={48} className="text-[var(--border)] mx-auto mb-4" />
                      <p className="font-bold text-lg mb-2">No orders yet</p>
                      <p className="text-[var(--muted-foreground)] text-sm mb-6">Your completed checkouts will appear here.</p>
                      <button onClick={() => navigate("listing", {})} className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold text-sm">
                        Browse Products
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "wishlist" && (
              <div>
                <h2 className="text-xl font-black mb-6">Wishlist ({wishlist.length})</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart size={60} className="text-[var(--border)] mx-auto mb-4" />
                    <p className="font-bold text-lg mb-2">Your wishlist is empty</p>
                    <p className="text-[var(--muted-foreground)] text-sm mb-6">Save pieces you love for later</p>
                    <button onClick={() => navigate("listing", {})} className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold text-sm">
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {wishlist.map((product) => <ProductCard key={product.id} product={product} />)}
                  </div>
                )}
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-6">
                <div className="bg-[var(--card)] rounded-2xl p-6">
                  <h2 className="text-xl font-black mb-6">Account Settings</h2>
                  {[
                    { label: "Full Name", value: user.name },
                    { label: "Email Address", value: user.email },
                    { label: "Membership Tier", value: user.tier },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                        <p className="text-sm font-medium mt-0.5">{value}</p>
                      </div>
                      <button className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1">
                        <Edit3 size={12} /> Edit
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 dark:bg-red-950 rounded-2xl p-6">
                  <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-600/70 mb-4">Account deletion is not available yet.</p>
                  <button className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">Delete Account</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
