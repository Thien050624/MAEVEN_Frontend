import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./components/pages/HomePage";
import { ProductListingPage } from "./components/pages/ProductListingPage";
import { ProductDetailPage } from "./components/pages/ProductDetailPage";
import { CartPage } from "./components/pages/CartPage";
import { CheckoutPage } from "./components/pages/CheckoutPage";
import { AuthPage } from "./components/pages/AuthPage";
import { AccountDashboard } from "./components/pages/AccountDashboard";
import { SearchPage } from "./components/pages/SearchPage";
import { WishlistPage } from "./components/pages/WishlistPage";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { AIStylistPage } from "./components/pages/AIStylistPage";

function ToastNotifications() {
  const { notifications } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl pointer-events-auto max-w-xs ${
              n.type === "success"
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : n.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {n.type === "success" && <CheckCircle size={16} className="flex-shrink-0 mt-0.5 opacity-80" />}
            {n.type === "error" && <AlertCircle size={16} className="flex-shrink-0 mt-0.5 opacity-80" />}
            {n.type === "info" && <Info size={16} className="flex-shrink-0 mt-0.5 opacity-80" />}
            <p className="text-sm font-medium leading-snug">{n.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const NO_FOOTER_PAGES = ["checkout", "auth", "ai-stylist"];

function AppContent() {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case "home": return <HomePage />;
      case "listing": return <ProductListingPage />;
      case "product": return <ProductDetailPage />;
      case "cart": return <CartPage />;
      case "checkout": return <CheckoutPage />;
      case "auth": return <AuthPage />;
      case "account": return <AccountDashboard />;
      case "search": return <SearchPage />;
      case "wishlist": return <WishlistPage />;
      case "admin": return <AdminDashboard />;
      case "ai-stylist": return <AIStylistPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
      {!NO_FOOTER_PAGES.includes(currentPage) && <Footer />}
      <ToastNotifications />
    </div>
  );
}

export default function App() {
  return (
    <div className="app-root">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </div>
  );
}

