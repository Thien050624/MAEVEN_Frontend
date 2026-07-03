import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, RefreshCw, Send, Sparkles, User } from "lucide-react";
import type { Product } from "../../data/products";
import { useApp } from "../../context/AppContext";
import { createAiStylistRecommendation, type AiStylistRecommendation } from "../../api/aiStylistApi";

interface Message {
  role: "user" | "ai";
  text: string;
  products?: Product[];
  recommendation?: AiStylistRecommendation;
}

const suggestions = [
  "I need a look for a summer gallery opening",
  "What should I wear to a business dinner?",
  "Casual weekend outfits under $200",
  "Help me style a polished date-night outfit",
  "What should I wear to an autumn wedding?",
];

export function AIStylistPage() {
  const { navigate, isLoggedIn, toast } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! I'm your personal MAEVEN AI Stylist. Tell me about your occasion, budget, preferred fit, colors, or pieces you already own, and I'll curate a look from the current MAEVEN catalog.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const token = localStorage.getItem("maeven_token");
    if (!isLoggedIn || !token) {
      toast("Please sign in to use AI Stylist", "info");
      navigate("auth", { mode: "login" });
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const recommendation = await createAiStylistRecommendation(trimmed, token);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `${recommendation.outfitName ? `${recommendation.outfitName}\n\n` : ""}${recommendation.summary}`,
          products: recommendation.products,
          recommendation,
        },
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: error?.message || "I couldn't create a recommendation right now. Please try again in a moment.",
        },
      ]);
      toast("AI Stylist could not respond", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
        <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">AI Stylist</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Gemini-powered outfits from the MAEVEN catalog</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[900px] mx-auto w-full px-4 sm:px-8 py-8 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <motion.div
              key={`${msg.role}-${index}`}
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
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--foreground)] text-[var(--background)] rounded-br-sm"
                      : "bg-[var(--card)] rounded-bl-sm border border-[var(--border)]"
                  }`}
                >
                  <span className="whitespace-pre-line">{msg.text}</span>
                </div>

                {msg.role === "ai" && msg.recommendation && (
                  <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                    {msg.recommendation.reasoning && (
                      <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                        {msg.recommendation.reasoning}
                      </p>
                    )}
                    {msg.recommendation.stylingTips.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.recommendation.stylingTips.map((tip) => (
                          <span
                            key={tip}
                            className="rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] text-[var(--muted-foreground)]"
                          >
                            {tip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {msg.role === "ai" && msg.products && msg.products.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-1">
                      <Sparkles size={11} /> Curated for you
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {msg.products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="text-left"
                          onClick={() => navigate("product", { productId: product.id })}
                        >
                          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--accent)] mb-2">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <p className="text-xs font-semibold truncate">{product.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">${product.price}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
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
                  {[0, 1, 2].map((item) => (
                    <motion.div
                      key={item}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, delay: item * 0.15, repeat: Infinity }}
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

      {messages.length === 1 && (
        <div className="max-w-[900px] mx-auto w-full px-4 sm:px-8 pb-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-3">Try asking...</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                className="px-4 py-2 rounded-full bg-[var(--accent)] text-sm hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 sm:px-8 py-4">
        <div className="max-w-[900px] mx-auto flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && !event.shiftKey && sendMessage(input)}
            placeholder="Ask for styling advice, occasion looks, budget looks, or specific pieces..."
            disabled={loading}
            className="flex-1 px-5 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] outline-none focus:border-purple-400 transition-colors text-sm disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-[10px] text-[var(--muted-foreground)] mt-2 max-w-[900px] mx-auto">
          AI Stylist creates suggestions from available MAEVEN products. Review sizing and stock before checkout.
        </p>
      </div>
    </div>
  );
}
