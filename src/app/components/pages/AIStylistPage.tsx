import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, User, ArrowRight, RefreshCw } from "lucide-react";
import { Product } from "../../data/products";
import { ProductCard } from "../ProductCard";
import { useApp } from "../../context/AppContext";

interface Message {
  role: "user" | "ai";
  text: string;
  products?: Product[];
}

const suggestions = [
  "I need a look for a summer gallery opening",
  "What should I wear to a business dinner?",
  "Casual weekend outfits under $200",
  "Help me style for a beach vacation",
  "What's trending for autumn?",
];

const aiResponses: { trigger: string[]; text: string; productIds: string[] }[] = [
  {
    trigger: ["gallery", "art", "opening", "evening", "cocktail"],
    text: "For a gallery opening, I'd suggest a sophisticated yet artistic look. A structured blazer paired with a silk wrap dress creates the perfect blend of polish and creative flair. Complete with a leather tote for a day-to-night transition.",
    productIds: ["p2", "p1", "p5"],
  },
  {
    trigger: ["business", "work", "office", "professional", "dinner"],
    text: "A business dinner calls for quiet confidence. I recommend this structured blazer over tailored trousers — it reads polished without being overdressed. Add a leather crossbody for a sophisticated finish.",
    productIds: ["p2", "p4", "p9"],
  },
  {
    trigger: ["casual", "weekend", "relaxed", "everyday"],
    text: "For effortless weekend style, try wide-leg jeans with a cashmere turtleneck. This combination is comfortable yet undeniably chic, and works from morning coffee to afternoon errands.",
    productIds: ["p6", "p3", "p9"],
  },
  {
    trigger: ["beach", "vacation", "summer", "holiday", "travel"],
    text: "Beach vacation dressing is all about effortless elegance. This linen shirt dress is your perfect companion — it transitions seamlessly from shoreside to seaside dining. Add a crossbody bag for practical luxury.",
    productIds: ["p10", "p9", "p5"],
  },
  {
    trigger: ["autumn", "fall", "winter", "cold", "cozy"],
    text: "Autumn dressing is where luxury truly shines. Layer a cashmere turtleneck under a structured blazer for warmth without sacrificing style. Complete the look with tailored trousers and classic oxford shoes.",
    productIds: ["p3", "p2", "p4", "p8"],
  },
];

const getAIResponse = (userMsg: string): { text: string; productIds: string[] } => {
  const lower = userMsg.toLowerCase();
  for (const resp of aiResponses) {
    if (resp.trigger.some((t) => lower.includes(t))) {
      return { text: resp.text, productIds: resp.productIds };
    }
  }
  return {
    text: "I'd love to help curate the perfect look for you! Based on your style, I recommend exploring our latest arrivals. Here are some pieces I think you'll adore:",
    productIds: ["p1", "p3", "p5", "p9"],
  };
};

export function AIStylistPage() {
  const { navigate, allProducts } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! I'm your personal MAEVEN AI Stylist ✨ I'm here to help you create the perfect look for any occasion. Tell me about your upcoming event, your personal style, or what you're looking for — and I'll curate an outfit just for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const resp = getAIResponse(text);
    const respProducts = allProducts.filter((p) => resp.productIds.includes(p.id));
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: resp.text, products: respProducts },
    ]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
        <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">AI Stylist</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Powered by MAEVEN Intelligence — your personal fashion AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 max-w-[900px] mx-auto w-full px-4 sm:px-8 py-8 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--foreground)] text-[var(--background)] rounded-br-sm"
                    : "bg-[var(--card)] rounded-bl-sm border border-[var(--border)]"
                }`}>
                  {msg.text}
                </div>

                {/* AI Product Recommendations */}
                {msg.role === "ai" && msg.products && msg.products.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-1">
                      <Sparkles size={11} /> Curated for you
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {msg.products.map((p) => (
                        <div key={p.id} className="cursor-pointer" onClick={() => navigate("product", { productId: p.id })}>
                          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--accent)] mb-2">
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                          <p className="text-xs font-semibold truncate">{p.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">${p.price}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("listing", {})}
                      className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      See more recommendations <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={14} />
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl rounded-bl-sm p-4 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-purple-400"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="max-w-[900px] mx-auto w-full px-4 sm:px-8 pb-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-3">Try asking...</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="px-4 py-2 rounded-full bg-[var(--accent)] text-sm hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 sm:px-8 py-4">
        <div className="max-w-[900px] mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask me for styling advice, occasion looks, or specific pieces..."
            disabled={loading}
            className="flex-1 px-5 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] outline-none focus:border-purple-400 transition-colors text-sm disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-[10px] text-[var(--muted-foreground)] mt-2 max-w-[900px] mx-auto">
          AI Stylist provides fashion suggestions based on trends and your preferences. Not a substitute for professional personal styling.
        </p>
      </div>
    </div>
  );
}
