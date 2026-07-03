import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User, Package, Heart, MapPin, CreditCard, Bell, Settings, LogOut,
  ChevronRight, Star, Edit3, Plus, Check, Award
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ProductCard } from "../ProductCard";
import { fetchMyOrders, type OrderDto } from "../../api/ordersApi";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "payment" | "notifications" | "settings";

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "In Transit": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Processing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Cancelled: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const navItems: { id: Tab; icon: typeof User; label: string }[] = [
  { id: "overview", icon: User, label: "Overview" },
  { id: "orders", icon: Package, label: "Orders" },
  { id: "wishlist", icon: Heart, label: "Wishlist" },
  { id: "addresses", icon: MapPin, label: "Addresses" },
  { id: "payment", icon: CreditCard, label: "Payment" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function AccountDashboard() {
  const { user, logout, navigate, wishlist, pageParams, toast } = useApp();
  const [tab, setTab] = useState<Tab>((pageParams.tab as Tab) || "overview");
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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

  if (!user) {
    return null;
  }

  const tierColors = {
    Silver: "bg-gray-100 text-gray-600",
    Gold: "bg-amber-100 text-amber-700",
    Platinum: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
        <h1 className="text-3xl font-black tracking-tight mb-8">My Account</h1>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside>
            {/* Profile Card */}
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

            {/* Nav */}
            <nav className="bg-[var(--card)] rounded-2xl overflow-hidden">
              {navItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium transition-colors border-b border-[var(--border)] last:border-0 ${
                    tab === id ? "bg-[var(--accent)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    {label}
                  </div>
                  <ChevronRight size={14} />
                </button>
              ))}
              <button
                onClick={() => { logout(); navigate("home"); toast("Signed out successfully"); }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {tab === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
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

                {/* Recent Orders */}
                <div className="bg-[var(--card)] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg">Recent Orders</h3>
                    <button onClick={() => setTab("orders")} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">View All</button>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--accent)] transition-colors">
                        <img src={order.items[0]?.productImage} alt="" className="w-12 h-14 rounded-xl object-cover bg-[var(--accent)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-mono">{order.id}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
                          <p className="text-sm font-bold mt-1">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {!ordersLoading && orders.length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)] py-6 text-center">No orders yet.</p>
                    )}
                  </div>
                </div>

                {/* Loyalty Progress */}
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
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 border-t border-[var(--border)] pt-4">
                        <img src={order.items[0]?.productImage} alt="" className="w-16 h-20 rounded-xl object-cover bg-[var(--accent)]" />
                        <div className="flex-1">
                          <p className="text-sm text-[var(--muted-foreground)]">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                          <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            {order.paymentMethod === "qr" ? "Bank QR Transfer" : "Cash on Delivery"} · {order.paymentStatus}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-xl hover:bg-[var(--accent)] transition-colors">
                            View Details
                          </button>
                          {order.status === "Delivered" && (
                            <button className="px-4 py-2 text-xs font-medium border border-[var(--border)] rounded-xl hover:bg-[var(--accent)] transition-colors">
                              Return
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                    {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            )}

            {tab === "addresses" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black">Saved Addresses</h2>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] transition-colors">
                    <Plus size={14} /> Add Address
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { type: "Home", name: user.name, address: "123 Fashion Avenue, Apt 4B", city: "New York", state: "NY", zip: "10001", default: true },
                    { type: "Office", name: user.name, address: "456 Style Street, Floor 12", city: "New York", state: "NY", zip: "10022", default: false },
                  ].map((addr) => (
                    <div key={addr.type} className={`bg-[var(--card)] rounded-2xl p-5 border-2 ${addr.default ? "border-[var(--foreground)]" : "border-transparent"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span className="text-sm font-bold">{addr.type}</span>
                          {addr.default && <span className="text-xs px-2 py-0.5 bg-[var(--foreground)] text-[var(--background)] rounded-full">Default</span>}
                        </div>
                        <button className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Edit</button>
                      </div>
                      <p className="text-sm font-medium">{addr.name}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{addr.address}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{addr.city}, {addr.state} {addr.zip}</p>
                      {!addr.default && (
                        <button onClick={() => toast("Default address updated")} className="mt-3 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1">
                          <Check size={12} /> Set as Default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "payment" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black">Payment Methods</h2>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] transition-colors">
                    <Plus size={14} /> Add Card
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { type: "Visa", last4: "4892", expiry: "06/28", default: true },
                    { type: "Mastercard", last4: "3741", expiry: "11/27", default: false },
                  ].map((card) => (
                    <div key={card.last4} className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white ${card.default ? "ring-2 ring-white/20" : ""}`}>
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <span className="text-xs opacity-60">{card.type}</span>
                          {card.default && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <CreditCard size={20} className="opacity-60" />
                      </div>
                      <p className="text-xl font-mono tracking-widest mb-4">•••• •••• •••• {card.last4}</p>
                      <div className="flex justify-between text-xs opacity-60">
                        <span>{user.name.toUpperCase()}</span>
                        <span>{card.expiry}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "notifications" && (
              <div>
                <h2 className="text-xl font-black mb-6">Notification Preferences</h2>
                <div className="bg-[var(--card)] rounded-2xl divide-y divide-[var(--border)]">
                  {[
                    { title: "Order Updates", sub: "Shipping, delivery and return notifications", enabled: true },
                    { title: "New Arrivals", sub: "Be first to know about new products", enabled: true },
                    { title: "Price Drops", sub: "Get notified when wishlisted items go on sale", enabled: true },
                    { title: "Exclusive Offers", sub: "Member-only deals and early access", enabled: false },
                    { title: "Style Recommendations", sub: "Personalised picks from our AI Stylist", enabled: true },
                    { title: "Weekly Newsletter", sub: "Curated fashion editorial content", enabled: false },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between p-5">
                      <div>
                        <p className="text-sm font-semibold">{notif.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{notif.sub}</p>
                      </div>
                      <div className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${notif.enabled ? "bg-[var(--foreground)]" : "bg-[var(--border)]"}`}
                        onClick={() => toast(`${notif.title} ${notif.enabled ? "disabled" : "enabled"}`)}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${notif.enabled ? "left-6" : "left-1"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black">Account Settings</h2>
                <div className="bg-[var(--card)] rounded-2xl p-6 space-y-5">
                  <h3 className="font-bold">Personal Information</h3>
                  {[
                    { label: "Full Name", value: user.name },
                    { label: "Email Address", value: user.email },
                    { label: "Phone Number", value: "+1 (555) 423-8917" },
                    { label: "Date of Birth", value: "September 12, 1992" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
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
                <div className="bg-[var(--card)] rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold">Security</h3>
                  {[
                    { label: "Change Password", action: "Update" },
                    { label: "Two-Factor Authentication", action: "Enable" },
                  ].map(({ label, action }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <p className="text-sm">{label}</p>
                      <button className="text-xs font-semibold text-[var(--foreground)] hover:underline">{action}</button>
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 dark:bg-red-950 rounded-2xl p-6">
                  <h3 className="font-bold text-red-600 mb-3">Danger Zone</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">Permanently delete your account and all data.</p>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
