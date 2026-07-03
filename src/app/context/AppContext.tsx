import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { products as initialProducts, type Product } from "../data/products";
import { createProduct as apiCreateProduct, fetchProducts, fetchWishlist, toggleWishlistItem as apiToggleWishlistItem, updateProduct as apiUpdateProduct, updateProductSale as apiUpdateProductSale, type ProductUpsertPayload } from "../api/productsApi";
import { login as apiLogin, register as apiRegister, getMe as apiGetMe, logout as apiLogout, updateMe as apiUpdateMe } from "../api/authApi";

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: "Silver" | "Gold" | "Platinum";
  role: "user" | "admin";
}

interface AppContextType {
  // Products
  allProducts: Product[];
  updateProductSale: (productId: string, discount: number | undefined) => void;
  updateProductDetails: (productId: string, payload: ProductUpsertPayload) => Promise<Product>;
  createProduct: (payload: ProductUpsertPayload) => Promise<Product>;

  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, color: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQty: (productId: string, size: string, color: string, qty: number) => void;
  cartCount: number;
  cartTotal: number;
  clearCart: () => void;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;

  // Auth
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<"admin" | "user">;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<User>;
  updateProfile: (payload: { name: string; avatar: string }) => Promise<User>;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  recentSearches: string[];
  addRecentSearch: (q: string) => void;

  // UI
  darkMode: boolean;
  toggleDarkMode: () => void;
  toast: (msg: string, type?: "success" | "error" | "info") => void;
  notifications: Notification[];

  // Current page state
  currentPage: string;
  navigate: (page: string, params?: Record<string, string>) => void;
  pageParams: Record<string, string>;
  selectedProductId: string | null;
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const AppContext = createContext<AppContextType | null>(null);

const MOCK_USER: User = {
  id: "u1",
  name: "Alexandra Rivera",
  email: "alex.rivera@email.com",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b332e234?w=80&q=80",
  tier: "Gold",
  role: "user",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(["Linen Blazer", "Cashmere", "Leather Briefcase"]);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState("home");
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const updateProductSale = (productId: string, discount: number | undefined) => {
    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const basePrice = p.originalPrice || p.price;
          if (discount && discount > 0) {
            return {
              ...p,
              originalPrice: basePrice,
              discount: discount,
              price: Math.round(basePrice * (1 - discount / 100)),
            };
          } else {
            return {
              ...p,
              originalPrice: undefined,
              discount: undefined,
              price: basePrice,
            };
          }
        }
        return p;
      })
    );
    const token = localStorage.getItem("maeven_token") ?? undefined;
    void apiUpdateProductSale(productId, discount, token).catch((error) => {
      console.error(error);
      toast("Could not save sale update", "error");
    });
    
    // Also sync Cart and Wishlist so the updated price reflects there
    setCartItems((prev) => 
      prev.map((item) => {
        if (item.product.id === productId) {
          const p = item.product;
          const basePrice = p.originalPrice || p.price;
          const updatedProduct = (discount && discount > 0)
            ? { ...p, originalPrice: basePrice, discount: discount, price: Math.round(basePrice * (1 - discount / 100)) }
            : { ...p, originalPrice: undefined, discount: undefined, price: basePrice };
          return { ...item, product: updatedProduct };
        }
        return item;
      })
    );
    
    setWishlist((prev) => 
      prev.map((p) => {
        if (p.id === productId) {
          const basePrice = p.originalPrice || p.price;
          return (discount && discount > 0)
            ? { ...p, originalPrice: basePrice, discount: discount, price: Math.round(basePrice * (1 - discount / 100)) }
            : { ...p, originalPrice: undefined, discount: undefined, price: basePrice };
        }
        return p;
      })
    );
  };

  const replaceProductEverywhere = (updatedProduct: Product) => {
    setAllProducts((prev) => prev.map((product) => product.id === updatedProduct.id ? updatedProduct : product));
    setWishlist((prev) => prev.map((product) => product.id === updatedProduct.id ? updatedProduct : product));
    setCartItems((prev) =>
      prev.map((item) => item.product.id === updatedProduct.id ? { ...item, product: updatedProduct } : item)
    );
  };

  const updateProductDetails = async (productId: string, payload: ProductUpsertPayload) => {
    const token = localStorage.getItem("maeven_token");
    if (!token) {
      throw new Error("Please sign in again.");
    }

    const updatedProduct = await apiUpdateProduct(productId, payload, token);
    replaceProductEverywhere(updatedProduct);
    return updatedProduct;
  };

  const createProduct = async (payload: ProductUpsertPayload) => {
    const token = localStorage.getItem("maeven_token");
    if (!token) {
      throw new Error("Please sign in again.");
    }

    const createdProduct = await apiCreateProduct(payload, token);
    setAllProducts((prev) => [...prev, createdProduct]);
    return createdProduct;
  };

  const addToCart = (product: Product, size: string, color: string, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.size === size && i.color === color
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { product, quantity: qty, size, color }];
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.size === size && i.color === color))
    );
  };

  const updateCartQty = (productId: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size && i.color === color
          ? { ...i, quantity: qty }
          : i
      )
    );
  };

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  const clearCart = () => setCartItems([]);

  const toggleWishlist = (product: Product) => {
    const token = localStorage.getItem("maeven_token");
    if (!token) {
      toast("Please sign in to save wishlist items", "info");
      navigate("auth", { mode: "login" });
      return;
    }

    const exists = wishlist.some((item) => item.id === product.id);

    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });

    void apiToggleWishlistItem(product.id, !exists, token).catch((error) => {
      console.error(error);
      toast("Could not update wishlist", "error");
    });
  };

  const isWishlisted = (productId: string) => wishlist.some((p) => p.id === productId);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem("maeven_token", data.token);
      setUser(data.user);
      setWishlist(await fetchWishlist(data.token));
      return data.user.role;
    } catch (error: any) {
      toast(error?.message || "Login failed", "error");
      throw error;
    }
  };

  const logout = () => {
    const token = localStorage.getItem("maeven_token");
    if (token) {
      void apiLogout(token).catch((error) => {
        console.error(error);
      });
    }

    localStorage.removeItem("maeven_token");
    setUser(null);
    setWishlist([]);
    toast("Logged out successfully", "info");
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await apiRegister(name, email, password);
      localStorage.setItem("maeven_token", data.token);
      setUser(data.user);
      setWishlist(await fetchWishlist(data.token));
      return data.user;
    } catch (error: any) {
      toast(error?.message || "Registration failed", "error");
      throw error;
    }
  };

  const updateProfile = async (payload: { name: string; avatar: string }) => {
    const token = localStorage.getItem("maeven_token");
    if (!token) {
      throw new Error("Please sign in again.");
    }

    const updatedUser = await apiUpdateMe(token, payload);
    setUser(updatedUser);
    return updatedUser;
  };

  const addRecentSearch = (q: string) => {
    setRecentSearches((prev) => [q, ...prev.filter((s) => s !== q)].slice(0, 6));
  };

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const toast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  };

  useEffect(() => {
    let cancelled = false;

    const initializeApp = async () => {
      // 1. Check Auto-Login first
      const token = localStorage.getItem("maeven_token");
      if (token) {
        try {
          const currentUser = await apiGetMe(token);
          if (!cancelled) {
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Auto-login failed:", error);
          localStorage.removeItem("maeven_token");
        }
      }

      // 2. Load Products and Wishlist
      try {
        const wishlistToken = localStorage.getItem("maeven_token");
        const [remoteProducts, remoteWishlist] = await Promise.all([
          fetchProducts(),
          wishlistToken ? fetchWishlist(wishlistToken) : Promise.resolve([]),
        ]);
        if (cancelled) {
          return;
        }

        setAllProducts(remoteProducts);
        setWishlist(remoteWishlist);

        setCartItems((prev) =>
          prev.map((cartItem) => {
            const refreshedProduct = remoteProducts.find((product) => product.id === cartItem.product.id);
            return refreshedProduct ? { ...cartItem, product: refreshedProduct } : cartItem;
          })
        );
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast("Could not load products from PostgreSQL", "error");
        }
      }
    };

    void initializeApp();

    return () => {
      cancelled = true;
    };
  }, []);

  const navigate = useCallback((page: string, params: Record<string, string> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    if (params.productId) setSelectedProductId(params.productId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AppContext.Provider
      value={{
        allProducts, updateProductSale, updateProductDetails, createProduct,
        cartItems, addToCart, removeFromCart, updateCartQty, cartCount, cartTotal, clearCart,
        wishlist, toggleWishlist, isWishlisted,
        user, isLoggedIn: !!user, login, logout, register, updateProfile,
        searchQuery, setSearchQuery, recentSearches, addRecentSearch,
        darkMode, toggleDarkMode,
        toast, notifications,
        currentPage, navigate, pageParams, selectedProductId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be within AppProvider");
  return ctx;
}
