import { useEffect, useState } from "react";
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

function ApiConnectionNotice() {
  const hasShownConnected = sessionStorage.getItem("maeven_api_connected_notice_seen") === "true";
  const [status, setStatus] = useState<"connecting" | "connected" | "hidden">(hasShownConnected ? "hidden" : "connecting");

  useEffect(() => {
    let hideTimer: number | undefined;

    const handleApiOnline = () => {
      if (sessionStorage.getItem("maeven_api_connected_notice_seen") === "true") {
        setStatus("hidden");
        return;
      }

      sessionStorage.setItem("maeven_api_connected_notice_seen", "true");
      setStatus("connected");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setStatus("hidden"), 5000);
    };

    window.addEventListener("maeven-api-online", handleApiOnline);

    return () => {
      window.removeEventListener("maeven-api-online", handleApiOnline);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {status !== "hidden" && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="fixed left-1/2 top-5 z-[210] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
        >
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              status === "connected"
                ? "border-green-200 bg-green-50/95 text-green-800 dark:border-green-900 dark:bg-green-950/95 dark:text-green-200"
                : "border-amber-200 bg-amber-50/95 text-amber-800 dark:border-amber-900 dark:bg-amber-950/95 dark:text-amber-200"
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                status === "connected" ? "bg-green-600 text-white" : "bg-amber-500 text-white"
              }`}
            >
              {status === "connected" ? (
                <CheckCircle size={17} />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
              )}
            </div>
            <div>
              <div className="mb-0.5 flex items-center gap-2">
                <span className="text-sm font-black">
                  {status === "connected" ? "API Connected" : "Đang kết nối dữ liệu"}
                </span>
                {status === "connected" && (
                  <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white">
                    API
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {status === "connected"
                  ? "Kết nối backend đã ổn định. Bạn có thể trải nghiệm MAEVEN bình thường."
                  : "Hãy đợi giây lát để MAEVEN kết nối dữ liệu ổn định rồi trải nghiệm nhé."}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
      <ApiConnectionNotice />
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
