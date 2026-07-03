import { type FormEvent } from "react";
import { Instagram, Twitter, Youtube, Facebook, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function Footer() {
  const { navigate, toast } = useApp();

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector("input") as HTMLInputElement;
    if (input.value) {
      toast("Welcome to MAEVEN — you're on the list! ✨");
      input.value = "";
    }
  };

  return (
    <footer className="bg-[var(--foreground)] text-[var(--background)] mt-24">
      {/* Newsletter Strip */}
      <div className="border-b border-white/10 py-16 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl font-black tracking-tight mb-2">Join the Inner Circle</h3>
            <p className="text-white/60 text-sm">Early access to new drops. Members-only offers. Style insights.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-3 w-full max-w-md">
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-white/60 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <button onClick={() => navigate("home")} className="text-3xl font-black tracking-tighter mb-4 block">
              MAEVEN
            </button>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Premium fashion curated for the discerning wardrobe. Timeless pieces for modern lives.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/50 hover:text-white transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-white/50 hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-white/50 hover:text-white transition-colors"><Youtube size={18} /></a>
              <a href="#" className="text-white/50 hover:text-white transition-colors"><Facebook size={18} /></a>
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Shop",
              links: [
                { label: "Clothing", page: "listing", params: { category: "men" } },
                { label: "Accessories", page: "listing", params: { category: "accessories" } },
                { label: "Shoes", page: "listing", params: { category: "shoes" } },
                { label: "Sale", page: "listing", params: { category: "sale" } },
              ],
            },
            {
              title: "Help",
              links: [
                { label: "Sizing Guide", page: "home", params: {} },
                { label: "Shipping Info", page: "home", params: {} },
                { label: "Returns & Exchanges", page: "home", params: {} },
                { label: "Track Your Order", page: "home", params: {} },
                { label: "Contact Us", page: "home", params: {} },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About MAEVEN", page: "home", params: {} },
                { label: "Sustainability", page: "home", params: {} },
                { label: "Careers", page: "home", params: {} },
                { label: "Press", page: "home", params: {} },
                { label: "Affiliates", page: "home", params: {} },
              ],
            },
            {
              title: "Account",
              links: [
                { label: "Sign In", page: "auth", params: {} },
                { label: "Register", page: "auth", params: { mode: "register" } },
                { label: "My Orders", page: "account", params: { tab: "orders" } },
                { label: "Wishlist", page: "wishlist", params: {} },
                { label: "Admin", page: "admin", params: {} },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.page, link.params)}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-xs">
          <p>© 2026 MAEVEN. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <div className="flex items-center gap-2">
            {["visa", "mc", "amex", "paypal", "apple"].map((p) => (
              <div key={p} className="w-10 h-6 rounded bg-white/10 flex items-center justify-center text-[9px] uppercase font-bold text-white/40">
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
