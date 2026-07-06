import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, Users, Package, DollarSign, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Search, Filter, Eye, Edit3, Trash2,
  Plus, Star, AlertCircle, CheckCircle, LogOut, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useApp } from "../../context/AppContext";
import { deleteOrder, fetchAllOrders, updateOrderStatus, type OrderDto } from "../../api/ordersApi";
import type { Product } from "../../data/products";
import type { ProductUpsertPayload } from "../../api/productsApi";
import { uploadProductImage } from "../../api/cloudinaryApi";
import { deleteAdminCustomer, fetchAdminCustomers, type AdminCustomerDto } from "../../api/customersApi";
import { checkApiHealth } from "../../api/healthApi";

const revenueData = [
  { month: "Jan", revenue: 42000, orders: 320 },
  { month: "Feb", revenue: 51000, orders: 410 },
  { month: "Mar", revenue: 48000, orders: 380 },
  { month: "Apr", revenue: 65000, orders: 520 },
  { month: "May", revenue: 71000, orders: 590 },
  { month: "Jun", revenue: 85000, orders: 680 },
];

const categoryData = [
  { name: "Suits & Tailoring", value: 45, color: "#1a1a1a" },
  { name: "Casual Wear", value: 35, color: "#4a4a4a" },
  { name: "Accessories & Shoes", value: 20, color: "#8b8b8b" },
];

const topProducts = [
  { name: "Italian Wool Suit", sales: 234, revenue: 44226, trend: 12 },
  { name: "Cashmere Turtleneck", sales: 187, revenue: 30855, trend: 8 },
  { name: "Premium Leather Briefcase", sales: 89, revenue: 35155, trend: -3 },
  { name: "Structured Linen Blazer", sales: 156, revenue: 38220, trend: 21 },
  { name: "Straight Leg Trousers", sales: 203, revenue: 24360, trend: 15 },
];

const recentOrders = [
  { id: "MAE-184523", customer: "Alexandra R.", items: 2, total: 334, status: "Delivered", date: "2026-06-05" },
  { id: "MAE-184520", customer: "Marcus W.", items: 1, total: 245, status: "Processing", date: "2026-06-05" },
  { id: "MAE-184518", customer: "Sophie L.", items: 3, total: 529, status: "In Transit", date: "2026-06-04" },
  { id: "MAE-184515", customer: "Mia K.", items: 1, total: 189, status: "Delivered", date: "2026-06-04" },
  { id: "MAE-184512", customer: "James T.", items: 4, total: 780, status: "Processing", date: "2026-06-03" },
  { id: "MAE-184511", customer: "Liam P.", items: 2, total: 290, status: "Delivered", date: "2026-06-02" },
  { id: "MAE-184510", customer: "Olivia M.", items: 1, total: 145, status: "Cancelled", date: "2026-06-02" },
];

const statusColors: Record<string, string> = {
  Pending: "bg-zinc-100 text-zinc-700",
  Delivered: "bg-green-100 text-green-700",
  "In Transit": "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-600",
};

const paymentStatusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  AwaitingTransfer: "bg-blue-100 text-blue-700",
  Paid: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-600",
  Refunded: "bg-zinc-100 text-zinc-700",
};

const orderStatusOptions = ["Pending", "Processing", "In Transit", "Delivered", "Cancelled"];
const paymentStatusOptions = ["Pending", "AwaitingTransfer", "Paid", "Failed", "Refunded"];
const productCategories: Product["category"][] = ["men", "shoes", "accessories"];
const productSubcategories: Record<Product["category"], string[]> = {
  men: ["Suits", "Shirts", "Knitwear", "Trousers", "Outerwear"],
  shoes: ["Formal", "Sneakers", "Boots", "Loafers"],
  accessories: ["Watches", "Bags", "Belts", "Sunglasses", "Jewelry"],
};

interface ProductEditForm {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice: string;
  discount: string;
  category: Product["category"];
  subcategory: string;
  description: string;
  colors: string;
  sizes: string;
  images: string;
  tags: string;
  material: string;
  care: string;
  fit: string;
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isLimited: boolean;
}

type AdminTab = "overview" | "products" | "orders" | "customers";
type ApiStatus = "checking" | "online" | "offline";

export function AdminDashboard() {
  const { navigate, logout, allProducts, updateProductSale, updateProductDetails, createProduct, deleteProduct, toast, user } = useApp();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [searchQ, setSearchQ] = useState("");
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearchQ, setOrderSearchQ] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<AdminCustomerDto[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearchQ, setCustomerSearchQ] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<ProductEditForm | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  
  // Sale Setting State
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [salePercentage, setSalePercentage] = useState<string>("");
  
  // Pagination States
  const [productsPage, setProductsPage] = useState(1);
  const productsPerPage = 5;
  const filteredProducts = allProducts.filter((p) => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.brand.toLowerCase().includes(searchQ.toLowerCase()));
  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((productsPage - 1) * productsPerPage, productsPage * productsPerPage);
  const adminNavItems: Array<{ id: AdminTab; label: string; icon: typeof BarChart3; description: string }> = [
    { id: "overview", label: "Overview", icon: BarChart3, description: "Revenue and activity" },
    { id: "products", label: "Products", icon: Package, description: `${allProducts.length} items` },
    { id: "orders", label: "Orders", icon: ShoppingCart, description: `${orders.length} orders` },
    { id: "customers", label: "Customers", icon: Users, description: `${customers.length} accounts` },
  ];
  const activeTabLabel = adminNavItems.find((item) => item.id === tab)?.label ?? "Overview";

  useEffect(() => {
    let cancelled = false;

    const checkBackendConnection = async () => {
      try {
        const healthy = await checkApiHealth();
        if (!cancelled) setApiStatus(healthy ? "online" : "offline");
      } catch (error) {
        if (!cancelled) setApiStatus("offline");
      }
    };

    setApiStatus("checking");
    void checkBackendConnection();
    const intervalId = window.setInterval(checkBackendConnection, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 5;
  const filteredOrders = useMemo(() => {
    const query = orderSearchQ.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesQuery =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.shippingAddress.phone.toLowerCase().includes(query);
      const matchesStatus = orderStatusFilter === "All" || order.status === orderStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, orderSearchQ, orderStatusFilter]);
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const currentOrders = filteredOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);

  useEffect(() => {
    const token = localStorage.getItem("maeven_token");
    if (!token) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    fetchAllOrders(token)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) toast("Could not load admin orders", "error");
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [toast]);

  useEffect(() => {
    const token = localStorage.getItem("maeven_token");
    if (!token) {
      setCustomers([]);
      return;
    }

    let cancelled = false;
    setCustomersLoading(true);
    fetchAdminCustomers(token, customerSearchQ)
      .then((data) => {
        if (!cancelled) setCustomers(data);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) toast("Could not load customers", "error");
      })
      .finally(() => {
        if (!cancelled) setCustomersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerSearchQ, toast]);

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const uniqueCustomers = customers.length;
  const newCustomersThisMonth = useMemo(() => {
    const now = new Date();
    return customers.filter((customer) => {
      const createdAt = new Date(customer.createdAt);
      return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
    }).length;
  }, [customers]);
  const avgOrderValue = useMemo(() => {
    const orderCount = customers.reduce((sum, customer) => sum + customer.ordersCount, 0);
    const spent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    return orderCount > 0 ? spent / orderCount : 0;
  }, [customers]);

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: "+18.2%", positive: true, icon: DollarSign },
    { label: "Total Orders", value: orders.length.toString(), change: "+12.5%", positive: true, icon: ShoppingCart },
    { label: "Active Customers", value: uniqueCustomers.toString(), change: "+8.1%", positive: true, icon: Users },
    { label: "Products", value: allProducts.length.toString(), change: "-2.3%", positive: false, icon: Package },
  ];

  const handleLogout = () => {
    logout();
    navigate("home");
  };

  const handleOrderStatusChange = (orderId: string, field: "status" | "paymentStatus", value: string) => {
    setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, [field]: value } : order));
  };

  const saveOrderStatus = async (order: OrderDto) => {
    const token = localStorage.getItem("maeven_token");
    if (!token) {
      toast("Please sign in again", "error");
      return;
    }

    setSavingOrderId(order.id);
    try {
      const updatedOrder = await updateOrderStatus(token, order.id, {
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
      setOrders((prev) => prev.map((item) => item.id === updatedOrder.id ? updatedOrder : item));
      toast("Order updated", "success");
    } catch (error: any) {
      console.error(error);
      toast(error?.message || "Could not update order", "error");
    } finally {
      setSavingOrderId(null);
    }
  };

  const startEditingProduct = (product: Product) => {
    setIsAddingProduct(false);
    setEditingProduct(product);
    setProductForm({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() ?? "",
      discount: product.discount?.toString() ?? "",
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      colors: product.colors.join(", "),
      sizes: product.sizes.join(", "),
      images: product.images.join("\n"),
      tags: product.tags.join(", "),
      material: product.specs.Material ?? "",
      care: product.specs.Care ?? "",
      fit: product.specs.Fit ?? "",
      inStock: product.inStock,
      isNew: !!product.isNew,
      isBestSeller: !!product.isBestSeller,
      isTrending: !!product.isTrending,
      isLimited: !!product.isLimited,
    });
  };

  const startAddingProduct = () => {
    const nextNumber = allProducts
      .map((product) => Number(product.id.replace(/^p/i, "")))
      .filter((value) => Number.isFinite(value))
      .reduce((max, value) => Math.max(max, value), 0) + 1;

    setIsAddingProduct(true);
    setEditingProduct(null);
    setProductForm({
      id: `p${nextNumber}`,
      name: "",
      brand: "MAEVEN",
      price: "",
      originalPrice: "",
      discount: "",
      category: "men",
      subcategory: productSubcategories.men[0],
      description: "",
      colors: "#1a1a1a",
      sizes: "S, M, L, XL",
      images: "",
      tags: "",
      material: "",
      care: "",
      fit: "",
      inStock: true,
      isNew: true,
      isBestSeller: false,
      isTrending: false,
      isLimited: false,
    });
  };

  const updateProductForm = <K extends keyof ProductEditForm>(field: K, value: ProductEditForm[K]) => {
    setProductForm((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const splitList = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);

  const buildProductPayload = (form: ProductEditForm, product?: Product): ProductUpsertPayload => {
    const specs: Record<string, string> = {};
    if (form.material.trim()) specs.Material = form.material.trim();
    if (form.care.trim()) specs.Care = form.care.trim();
    if (form.fit.trim()) specs.Fit = form.fit.trim();

    return {
      id: form.id.trim(),
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Number(form.price) || 0,
      originalPrice: form.originalPrice.trim() ? Number(form.originalPrice) : null,
      discount: form.discount.trim() ? Number(form.discount) : null,
      rating: product?.rating ?? 0,
      reviewsCount: product?.reviews ?? 0,
      category: form.category,
      subcategory: form.subcategory.trim(),
      description: form.description.trim(),
      isNew: form.isNew,
      isBestSeller: form.isBestSeller,
      isTrending: form.isTrending,
      isLimited: form.isLimited,
      inStock: form.inStock,
      colors: splitList(form.colors),
      sizes: splitList(form.sizes),
      images: splitList(form.images),
      specs,
      tags: splitList(form.tags),
    };
  };

  const saveProduct = async () => {
    if (!productForm) return;

    const images = splitList(productForm.images);
    if (!productForm.id.trim() || !productForm.name.trim() || !productForm.brand.trim() || !productForm.subcategory.trim()) {
      toast("Product ID, name, brand, and subcategory are required", "error");
      return;
    }

    if (images.length === 0) {
      toast("Add at least one product image URL", "error");
      return;
    }

    setSavingProduct(true);
    try {
      if (isAddingProduct) {
        await createProduct(buildProductPayload(productForm));
        toast("Product created successfully");
      } else if (editingProduct) {
        await updateProductDetails(editingProduct.id, buildProductPayload(productForm, editingProduct));
        toast("Product updated successfully");
      }
      setEditingProduct(null);
      setIsAddingProduct(false);
      setProductForm(null);
    } catch (error: any) {
      console.error(error);
      toast(error?.message || "Could not save product", "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete product "${product.name}"? This action cannot be undone.`)) return;

    try {
      await deleteProduct(product.id);
      toast("Product deleted successfully");
    } catch (error: any) {
      console.error(error);
      toast(error?.message || "Could not delete product", "error");
    }
  };

  const handleDeleteOrder = async (order: OrderDto) => {
    if (!window.confirm(`Delete order ${order.id}? This action cannot be undone.`)) return;

    const token = localStorage.getItem("maeven_token");
    if (!token) {
      toast("Please sign in again", "error");
      navigate("auth", { mode: "login" });
      return;
    }

    try {
      await deleteOrder(token, order.id);
      setOrders((prev) => prev.filter((item) => item.id !== order.id));
      toast("Order deleted successfully");
    } catch (error: any) {
      console.error(error);
      toast(error?.message || "Could not delete order", "error");
    }
  };

  const handleDeleteCustomer = async (customer: AdminCustomerDto) => {
    if (customer.id === user?.id) {
      toast("You cannot delete your own admin account", "error");
      return;
    }

    if (!window.confirm(`Delete customer "${customer.name}" and their orders? This action cannot be undone.`)) return;

    const token = localStorage.getItem("maeven_token");
    if (!token) {
      toast("Please sign in again", "error");
      navigate("auth", { mode: "login" });
      return;
    }

    try {
      await deleteAdminCustomer(token, customer.id);
      setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
      setOrders((prev) => prev.filter((order) => order.userId !== customer.id));
      toast("Customer deleted successfully");
    } catch (error: any) {
      console.error(error);
      toast(error?.message || "Could not delete customer", "error");
    }
  };

  const handleProductImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !productForm) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await Promise.all(Array.from(files).map((file) => uploadProductImage(file)));
      const currentImages = splitList(productForm.images);
      updateProductForm("images", [...currentImages, ...uploadedUrls].join("\n"));
      toast(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} uploaded`);
    } catch (error: any) {
      console.error(error);
      toast(error?.message || "Could not upload images", "error");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeProductImage = (imageUrl: string) => {
    if (!productForm) return;
    updateProductForm("images", splitList(productForm.images).filter((url) => url !== imageUrl).join("\n"));
  };

  const makeProductImagePrimary = (imageUrl: string) => {
    if (!productForm) return;
    const imageUrls = splitList(productForm.images);
    updateProductForm("images", [imageUrl, ...imageUrls.filter((url) => url !== imageUrl)].join("\n"));
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-[var(--card)]">
          <div className="flex h-full flex-col gap-5 p-4 lg:p-6">
            <div className="flex items-center justify-between lg:block">
              <button onClick={() => navigate("home")} className="text-2xl font-black tracking-tighter">
                MAEVEN
              </button>
              <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-bold tracking-widest text-[var(--muted-foreground)] lg:mt-3 lg:inline-block">
                ADMIN
              </span>
            </div>

            <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 lg:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Signed in as</p>
              <p className="mt-2 truncate text-sm font-bold">{user?.name ?? "Admin"}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{user?.email}</p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {adminNavItems.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  onClick={() => {
                    setTab(id);
                    setSearchQ("");
                  }}
                  className={`relative flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors lg:min-w-0 ${
                    tab === id
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex flex-col">
                    <span className="text-sm font-bold">{label}</span>
                    <span className={`hidden text-xs lg:block ${tab === id ? "opacity-75" : "text-[var(--muted-foreground)]"}`}>
                      {description}
                    </span>
                  </span>
                  {tab === id && (
                    <motion.span layoutId="adminSidebarActive" className="absolute right-3 hidden h-2 w-2 rounded-full bg-current lg:block" />
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-auto hidden space-y-3 lg:block">
              <button onClick={() => navigate("home")} className="w-full rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--accent)]">
                View Store
              </button>
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{activeTabLabel}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Welcome back — here's what's happening today</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              title="Backend API connection status"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
                apiStatus === "online"
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                  : apiStatus === "offline"
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {apiStatus === "online" ? (
                <CheckCircle size={14} />
              ) : apiStatus === "offline" ? (
                <AlertCircle size={14} />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
              )}
              {apiStatus === "online" ? "API Connected" : apiStatus === "offline" ? "API Offline" : "Checking API"}
            </div>
            <button onClick={() => navigate("home")} className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl hover:bg-[var(--accent)] transition-colors lg:hidden">
              View Store
            </button>
            <button onClick={handleLogout} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold lg:hidden">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(({ label, value, change, positive, icon: Icon }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--card)] rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? "text-green-600" : "text-red-500"}`}>
                      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {change}
                    </div>
                  </div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="bg-[var(--card)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Revenue Overview</h3>
                  <select className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--background)] outline-none">
                    <option>Last 6 months</option>
                    <option>Last year</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Split */}
              <div className="bg-[var(--card)] rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-6">Sales by Category</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[var(--muted-foreground)]">{cat.name}</span>
                      </div>
                      <span className="font-semibold">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products + Recent Orders */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-[var(--card)] rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-5">Top Products</h3>
                <div className="space-y-4">
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-sm font-black text-[var(--muted-foreground)] w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{p.sales} sold · ${p.revenue.toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${p.trend > 0 ? "text-green-600" : "text-red-500"}`}>
                        {p.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(p.trend)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-[var(--card)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg">Recent Orders</h3>
                  <button onClick={() => setTab("orders")} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">View All</button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-mono">{order.id}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{order.customerName}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold">${order.total.toFixed(2)}</span>
                    </div>
                  ))}
                  {!ordersLoading && orders.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)] py-6 text-center">No orders yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  value={searchQ}
                  onChange={(e) => {
                    setSearchQ(e.target.value);
                    setProductsPage(1);
                  }}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)] transition-colors"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm">
                <Filter size={14} /> Filter
              </button>
              <button
                onClick={startAddingProduct}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-medium"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            <div className="bg-[var(--card)] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Product", "Category", "Price", "Sale", "Stock", "Rating", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt={p.name} className="w-10 h-12 rounded-lg object-cover" />
                          <div>
                            <p className="text-sm font-semibold">{p.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm capitalize text-[var(--muted-foreground)]">{p.category}</td>
                      <td className="px-5 py-4 text-sm font-semibold">
                        ${p.price}
                        {p.originalPrice && <span className="ml-2 text-xs line-through text-[var(--muted-foreground)]">${p.originalPrice}</span>}
                      </td>
                      <td className="px-5 py-4">
                        {editingSaleId === p.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={salePercentage}
                              onChange={(e) => setSalePercentage(e.target.value)}
                              className="w-16 px-2 py-1 text-xs border border-[var(--border)] rounded outline-none bg-[var(--background)]"
                              placeholder="%"
                            />
                            <button
                              onClick={() => {
                                const val = parseInt(salePercentage, 10);
                                updateProductSale(p.id, isNaN(val) ? undefined : val);
                                setEditingSaleId(null);
                                toast("Sale percentage updated successfully");
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSaleId(p.id);
                              setSalePercentage(p.discount ? p.discount.toString() : "");
                            }}
                            className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                          >
                            {p.discount ? `${p.discount}% OFF` : "Set Sale"}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {p.inStock ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle size={12} /> In Stock
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={12} /> Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-sm">{p.rating}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">({p.reviews})</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate("product", { productId: p.id })}
                            className="p-1.5 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--muted-foreground)]"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => startEditingProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--muted-foreground)]"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalProductPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Showing {(productsPage - 1) * productsPerPage + 1} to {Math.min(productsPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProductsPage(Math.max(1, productsPage - 1))}
                      disabled={productsPage === 1}
                      className="p-1 rounded hover:bg-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalProductPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setProductsPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium ${
                          productsPage === i + 1 ? "bg-[var(--foreground)] text-[var(--background)]" : "hover:bg-[var(--accent)]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setProductsPage(Math.min(totalProductPages, productsPage + 1))}
                      disabled={productsPage === totalProductPages}
                      className="p-1 rounded hover:bg-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  value={orderSearchQ}
                  onChange={(event) => {
                    setOrderSearchQ(event.target.value);
                    setOrdersPage(1);
                  }}
                  placeholder="Search by order, customer, email, phone..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)] transition-colors"
                />
              </div>
              <select
                value={orderStatusFilter}
                onChange={(event) => {
                  setOrderStatusFilter(event.target.value);
                  setOrdersPage(1);
                }}
                className="px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--background)] outline-none"
              >
                <option value="All">All Status</option>
                {orderStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="bg-[var(--card)] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Order Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)] transition-colors">
                      <td className="px-5 py-4 text-sm font-mono font-semibold">{order.id}</td>
                      <td className="px-5 py-4 text-sm">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{order.customerEmail}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{order.shippingAddress.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm">{order.items.length}</td>
                      <td className="px-5 py-4 text-sm font-bold">${order.total.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${paymentStatusColors[order.paymentStatus] ?? "bg-zinc-100 text-zinc-700"}`}>
                            {order.paymentStatus}
                          </span>
                          <select
                            value={order.paymentStatus}
                            onChange={(event) => handleOrderStatusChange(order.id, "paymentStatus", event.target.value)}
                            className="block w-36 px-2.5 py-1.5 border border-[var(--border)] rounded-lg text-xs bg-[var(--background)] outline-none"
                          >
                            {paymentStatusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] ?? "bg-zinc-100 text-zinc-700"}`}>
                            {order.status}
                          </span>
                          <select
                            value={order.status}
                            onChange={(event) => handleOrderStatusChange(order.id, "status", event.target.value)}
                            className="block w-32 px-2.5 py-1.5 border border-[var(--border)] rounded-lg text-xs bg-[var(--background)] outline-none"
                          >
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveOrderStatus(order)}
                            disabled={savingOrderId === order.id}
                            className="px-3 py-1.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-xs font-semibold disabled:opacity-60"
                          >
                            {savingOrderId === order.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            title={order.items.map((item) => `${item.quantity}x ${item.productName}`).join("\n")}
                            className="p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--muted-foreground)]"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!ordersLoading && currentOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm text-[var(--muted-foreground)]">
                        No orders match your filters.
                      </td>
                    </tr>
                  )}
                  {ordersLoading && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm text-[var(--muted-foreground)]">
                        Loading orders...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalOrderPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Showing {filteredOrders.length === 0 ? 0 : (ordersPage - 1) * ordersPerPage + 1} to {Math.min(ordersPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOrdersPage(Math.max(1, ordersPage - 1))}
                      disabled={ordersPage === 1}
                      className="p-1 rounded hover:bg-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalOrderPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setOrdersPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium ${
                          ordersPage === i + 1 ? "bg-[var(--foreground)] text-[var(--background)]" : "hover:bg-[var(--accent)]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setOrdersPage(Math.min(totalOrderPages, ordersPage + 1))}
                      disabled={ordersPage === totalOrderPages}
                      className="p-1 rounded hover:bg-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "customers" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Total Customers", value: customers.length.toString(), hint: "Registered accounts" },
                { label: "New This Month", value: newCustomersThisMonth.toString(), hint: "Joined this month" },
                { label: "Avg. Order Value", value: `$${avgOrderValue.toFixed(2)}`, hint: "Across customer orders" },
              ].map(({ label, value, hint }) => (
                <div key={label} className="bg-[var(--card)] rounded-2xl p-6">
                  <p className="text-3xl font-black mb-1">{value}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">{hint}</p>
                </div>
              ))}
            </div>

            <div className="bg-[var(--card)] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-bold">Customer Directory</h3>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    value={customerSearchQ}
                    onChange={(event) => setCustomerSearchQ(event.target.value)}
                    placeholder="Search customers..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)] transition-colors"
                  />
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Customer ID", "Name / Email", "Tier", "Orders", "Total Spent", "Last Order", "Member Since", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)] transition-colors">
                      <td className="px-5 py-4 text-xs font-mono font-semibold">{customer.id.slice(0, 10)}...</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={customer.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80"}
                            alt={customer.name}
                            className="w-9 h-9 rounded-full object-cover bg-[var(--accent)]"
                          />
                          <div>
                            <p className="text-sm font-semibold">{customer.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{customer.email}</p>
                            {customer.role === "admin" && <p className="text-[10px] font-bold text-purple-600 mt-0.5">ADMIN</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent)] font-medium">{customer.tier}</span>
                      </td>
                      <td className="px-5 py-4 text-sm">{customer.ordersCount}</td>
                      <td className="px-5 py-4 text-sm font-bold">${customer.totalSpent.toFixed(2)}</td>
                      <td className="px-5 py-4 text-sm text-[var(--muted-foreground)]">
                        {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--muted-foreground)]">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          disabled={customer.id === user?.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!customersLoading && customers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm text-[var(--muted-foreground)]">
                        No customers found.
                      </td>
                    </tr>
                  )}
                  {customersLoading && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm text-[var(--muted-foreground)]">
                        Loading customers...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

          </div>
        </main>

        {(editingProduct || isAddingProduct) && productForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--background)] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-6 py-4">
                <div>
                  <h2 className="text-xl font-black">{isAddingProduct ? "Add Product" : "Edit Product"}</h2>
                  <p className="text-xs text-[var(--muted-foreground)] font-mono">{productForm.id}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddingProduct(false);
                    setProductForm(null);
                  }}
                  className="p-2 rounded-xl hover:bg-[var(--accent)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid lg:grid-cols-[1fr_320px] gap-6 p-6">
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Product ID</span>
                      <input
                        value={productForm.id}
                        onChange={(e) => updateProductForm("id", e.target.value)}
                        disabled={!isAddingProduct}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none disabled:opacity-60"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Name</span>
                      <input value={productForm.name} onChange={(e) => updateProductForm("name", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Brand</span>
                      <input value={productForm.brand} onChange={(e) => updateProductForm("brand", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Price</span>
                      <input type="number" value={productForm.price} onChange={(e) => updateProductForm("price", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Original Price</span>
                      <input type="number" value={productForm.originalPrice} onChange={(e) => updateProductForm("originalPrice", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Discount %</span>
                      <input type="number" min="0" max="100" value={productForm.discount} onChange={(e) => updateProductForm("discount", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Category</span>
                      <select
                        value={productForm.category}
                        onChange={(e) => {
                          const category = e.target.value as Product["category"];
                          setProductForm((prev) => prev ? {
                            ...prev,
                            category,
                            subcategory: productSubcategories[category][0],
                          } : prev);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none"
                      >
                        {productCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5 sm:col-span-2">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Subcategory</span>
                      <select
                        value={productForm.subcategory}
                        onChange={(e) => updateProductForm("subcategory", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none"
                      >
                        {productSubcategories[productForm.category].map((subcategory) => (
                          <option key={subcategory} value={subcategory}>{subcategory}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="space-y-1.5 block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">Description</span>
                    <textarea value={productForm.description} onChange={(e) => updateProductForm("description", e.target.value)} rows={4} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none resize-none" />
                  </label>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Colors</span>
                      <input value={productForm.colors} onChange={(e) => updateProductForm("colors", e.target.value)} placeholder="#111, #fff" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Sizes</span>
                      <input value={productForm.sizes} onChange={(e) => updateProductForm("sizes", e.target.value)} placeholder="S, M, L" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Tags</span>
                      <input value={productForm.tags} onChange={(e) => updateProductForm("tags", e.target.value)} placeholder="suit, formal" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Material</span>
                      <input value={productForm.material} onChange={(e) => updateProductForm("material", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Care</span>
                      <input value={productForm.care} onChange={(e) => updateProductForm("care", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Fit</span>
                      <input value={productForm.fit} onChange={(e) => updateProductForm("fit", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none" />
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Import Google Flow Image URLs</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">One URL per line</span>
                    </div>
                    <textarea
                      value={productForm.images}
                      onChange={(e) => updateProductForm("images", e.target.value)}
                      rows={5}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none resize-none font-mono"
                    />
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold">Upload images from computer</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Select images exported from Google Flow. Uploaded URLs are added above automatically.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] disabled:opacity-60">
                        {uploadingImages ? "Uploading..." : "Choose Files"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingImages}
                          onChange={(event) => {
                            void handleProductImageUpload(event.target.files);
                            event.target.value = "";
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-5 gap-3">
                    {[
                      ["inStock", "In Stock"],
                      ["isNew", "New"],
                      ["isBestSeller", "Best Seller"],
                      ["isTrending", "Trending"],
                      ["isLimited", "Limited"],
                    ].map(([field, label]) => (
                      <label key={field} className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={!!productForm[field as keyof ProductEditForm]}
                          onChange={(e) => updateProductForm(field as keyof ProductEditForm, e.target.checked as never)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-2xl border border-[var(--border)] p-4">
                    <h3 className="text-sm font-bold mb-3">Image Preview</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {splitList(productForm.images).map((imageUrl, index) => (
                        <div key={`${imageUrl}-${index}`} className="space-y-2">
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[var(--accent)]">
                            <img src={imageUrl} alt={`Product preview ${index + 1}`} className="w-full h-full object-cover" />
                            {index === 0 && (
                              <span className="absolute left-2 top-2 rounded-full bg-[var(--foreground)] px-2 py-0.5 text-[10px] font-bold text-[var(--background)]">
                                Main
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => makeProductImagePrimary(imageUrl)}
                              disabled={index === 0}
                              className="rounded-lg border border-[var(--border)] px-2 py-1 text-[10px] font-semibold disabled:opacity-50"
                            >
                              Set Main
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProductImage(imageUrl)}
                              className="rounded-lg border border-red-200 px-2 py-1 text-[10px] font-semibold text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {splitList(productForm.images).length === 0 && (
                      <p className="text-xs text-[var(--muted-foreground)] py-8 text-center">Paste image URLs to preview them here.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] p-4">
                    <h3 className="text-sm font-bold mb-2">Google Flow workflow</h3>
                    <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                      Generate images in Google Flow, upload them to a public image host, then paste the public URLs above. The first URL becomes the main product image.
                    </p>
                  </div>
                </aside>
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--background)] px-6 py-4">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddingProduct(false);
                    setProductForm(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProduct}
                  disabled={savingProduct}
                  className="px-5 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold disabled:opacity-60"
                >
                  {savingProduct ? "Saving..." : isAddingProduct ? "Create Product" : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
