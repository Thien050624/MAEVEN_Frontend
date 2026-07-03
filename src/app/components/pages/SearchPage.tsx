import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, TrendingUp, Clock, X, Sparkles } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { useApp } from "../../context/AppContext";
import { searchProducts } from "../../api/productsApi";

const trendingSearches = ["Silk Dress", "Cashmere Knitwear", "Leather Tote", "Wide Leg Jeans", "Oxford Shoes", "Evening Gown", "Structured Blazer", "Summer Linen"];

export function SearchPage() {
  const { searchQuery, setSearchQuery, recentSearches, addRecentSearch, navigate } = useApp();
  const [query, setQuery] = useState(searchQuery);
  const [submitted, setSubmitted] = useState(!!searchQuery);
  const [results, setResults] = useState([] as Awaited<ReturnType<typeof searchProducts>>);

  useEffect(() => {
    if (!submitted || !query.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;

    const runSearch = async () => {
      try {
        const remoteResults = await searchProducts(query);
        if (!cancelled) {
          setResults(remoteResults);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setResults([]);
        }
      }
    };

    void runSearch();

    return () => {
      cancelled = true;
    };
  }, [query, submitted]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setSearchQuery(q);
    addRecentSearch(q);
    setSubmitted(true);
  };

  const aiSuggestions = [
    "You might also like: Tailored Blazer, Silk Blouse",
    "Trending in your size: Wide Leg Trousers, Wrap Dress",
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setSubmitted(false); }}
            onKeyDown={(e) => e.key === "Enter" && query.trim() && handleSearch(query)}
            placeholder="Search styles, brands, items..."
            className="w-full pl-14 pr-14 py-5 text-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--foreground)] transition-colors"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setSubmitted(false); }}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {!submitted ? (
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Trending */}
            <div>
              <h3 className="flex items-center gap-2 font-bold text-sm mb-4 text-[var(--muted-foreground)]">
                <TrendingUp size={14} /> Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-4 py-2 rounded-full bg-[var(--accent)] text-sm font-medium hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 font-bold text-sm mb-4 text-[var(--muted-foreground)]">
                  <Clock size={14} /> Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="flex items-center gap-3 w-full py-2 px-3 rounded-xl text-sm hover:bg-[var(--accent)] transition-colors text-left"
                    >
                      <Clock size={14} className="text-[var(--muted-foreground)]" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* AI Insight */}
            {results.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 mb-6">
                <Sparkles size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">AI Stylist Insight</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Based on your search for "{query}", {aiSuggestions[0]}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[var(--muted-foreground)]">
                {results.length} result{results.length !== 1 ? "s" : ""} for <strong>"{query}"</strong>
              </p>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No results for "{query}"</h3>
                <p className="text-[var(--muted-foreground)] mb-6 text-sm">Try different keywords or browse our categories</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {trendingSearches.slice(0, 4).map((s) => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="px-4 py-2 rounded-full bg-[var(--accent)] text-sm hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
