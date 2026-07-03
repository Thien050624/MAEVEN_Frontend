import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown,
  Sun, Moon, Sparkles, Bell
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { categories } from "../../data/products";

const navLinks = [
  {
    label: "Men's Clothing",
    page: "listing",
    params: { category: "men" },
    mega: [
      { title: "New Arrivals", items: ["Suits", "Knitwear", "Trousers", "Shirts", "Outerwear"] },
      { title: "Collections", items: ["Formal", "Smart Casual", "Weekend Edit", "Sportswear"] },
    ],
  },
  {
    label: "Accessories",
    page: "listing",
    params: { category: "accessories" },
    mega: [
      { title: "Leather Goods", items: ["Bags", "Belts", "Wallets"] },
      { title: "Other", items: ["Watches", "Ties", "Sunglasses"] },
    ],
  },
  {
    label: "Shoes",
    page: "listing",
    params: { category: "shoes" },
    mega: [
      { title: "Styles", items: ["Formal", "Casual", "Sneakers", "Boots"] },
    ],
  },
  { label: "Sale", page: "listing", params: { category: "sale" }, mega: [] },
];

export function Navbar() {
  const { cartCount, wishlist, user, isLoggedIn, navigate, darkMode, toggleDarkMode, setSearchQuery, searchQuery } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[var(--foreground)] text-[var(--background)] text-center py-2 text-xs tracking-widest uppercase">
        Free Shipping on Orders Over $150 &nbsp;·&nbsp; New Summer Collection Now Live
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--background)]/95 backdrop-blur-lg shadow-sm border-b border-[var(--border)]"
            : "bg-[var(--background)]"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 group"
            >
              <div className="flex items-center">
                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[var(--foreground)] group-hover:opacity-80 transition-opacity">
                  MAEVEN
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.mega.length > 0 && setMegaOpen(link.label)}
                  onMouseLeave={() => setMegaOpen(null)}
                >
                  <button
                    onClick={() => { navigate(link.page, link.params); setMegaOpen(null); }}
                    className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-colors hover:text-[var(--foreground)] ${
                      link.label === "Sale" ? "text-red-500 hover:text-red-600" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {link.label}
                    {link.mega.length > 0 && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${megaOpen === link.label ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {/* Mega Menu */}
                  <AnimatePresence>
                    {megaOpen === link.label && link.mega.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 grid gap-6"
                        style={{ gridTemplateColumns: `repeat(${link.mega.length}, 1fr)` }}
                      >
                        {link.mega.map((section) => (
                          <div key={section.title}>
                            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)] mb-3">
                              {section.title}
                            </p>
                            <ul className="space-y-2">
                              {section.items.map((item) => (
                                <li key={item}>
                                  <button
                                    onClick={() => { navigate(link.page, { ...link.params, subcategory: item }); setMegaOpen(null); }}
                                    className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors hover:underline"
                                  >
                                    {item}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl hover:bg-[var(--accent)] transition-colors text-[var(--foreground)]"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Dark Mode */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl hover:bg-[var(--accent)] transition-colors text-[var(--foreground)] hidden sm:flex"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* AI Stylist */}
              <button
                onClick={() => navigate("ai-stylist")}
                className="p-2 rounded-xl hover:bg-[var(--accent)] transition-colors text-purple-500 hidden sm:flex"
                aria-label="AI Stylist"
              >
                <Sparkles size={20} />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => navigate("wishlist")}
                className="p-2 rounded-xl hover:bg-[var(--accent)] transition-colors relative text-[var(--foreground)]"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate("cart")}
                className="p-2 rounded-xl hover:bg-[var(--accent)] transition-colors relative text-[var(--foreground)]"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--foreground)] text-[var(--background)] text-[10px] rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* User */}
              <button
                onClick={() => navigate(isLoggedIn ? (user?.role === "admin" ? "admin" : "account") : "auth")}
                className="hidden sm:flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--accent)] transition-colors text-[var(--foreground)]"
                aria-label="Account"
              >
                {isLoggedIn && user ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-[var(--accent)] transition-colors text-[var(--foreground)]"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--background)]/95 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate("search", { q: searchQuery });
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search for styles, brands, items..."
                  className="w-full pl-12 pr-12 py-5 text-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--foreground)] transition-colors"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Linen Blazer", "Cashmere", "Leather Briefcase", "Straight Leg Chinos", "Oxford Shoes"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSearchQuery(s); navigate("search", { q: s }); setSearchOpen(false); }}
                    className="px-4 py-2 rounded-full bg-[var(--accent)] text-sm text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <span className="text-2xl font-black tracking-tighter">MAEVEN</span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => { navigate(link.page, link.params); setMobileOpen(false); }}
                  className="block w-full text-left text-2xl font-semibold py-2 border-b border-[var(--border)] hover:text-[var(--muted-foreground)] transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 space-y-4">
                <button onClick={() => { navigate(isLoggedIn ? (user?.role === "admin" ? "admin" : "account") : "auth"); setMobileOpen(false); }} className="flex items-center gap-3 w-full">
                  <User size={20} /> <span>{isLoggedIn ? (user?.role === "admin" ? "Admin Dashboard" : "My Account") : "Sign In"}</span>
                </button>
                <button onClick={() => { navigate("wishlist"); setMobileOpen(false); }} className="flex items-center gap-3 w-full">
                  <Heart size={20} /> <span>Wishlist ({wishlist.length})</span>
                </button>
                <button onClick={toggleDarkMode} className="flex items-center gap-3 w-full">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
