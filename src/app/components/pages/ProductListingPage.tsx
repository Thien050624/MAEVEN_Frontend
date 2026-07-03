import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, X, ChevronDown, SlidersHorizontal, Grid3X3, LayoutList, Search, Star } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { useApp } from "../../context/AppContext";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "39", "40", "41", "42", "43", "44"];
const COLOR_MAP: Record<string, string> = {
  Black: "#1a1a1a", White: "#f5f5f0", Camel: "#c4a882", Navy: "#2c3e50", Grey: "#4a4a4a", Brown: "#8b4513", Ivory: "#d4c5a9"
};
const BRANDS = ["LUXE", "MAISON", "NORD"];
const SUBCATEGORIES: Record<string, string[]> = {
  men: ["Suits", "Trousers", "Knitwear", "Shirts", "Outerwear"],
  accessories: ["Watches", "Bags", "Belts", "Wallets"],
  shoes: ["Formal", "Casual", "Sneakers", "Boots"],
};

interface Filters {
  sizes: string[];
  colors: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  subcategories: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

const defaultFilters: Filters = {
  sizes: [], colors: [], brands: [], minPrice: 0, maxPrice: 1000,
  minRating: 0, subcategories: [], inStockOnly: false, onSaleOnly: false,
};

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export function ProductListingPage() {
  const { pageParams, navigate, allProducts } = useApp();
  const category = pageParams.category || "";
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [page, setPage] = useState(1);
  const [openSections, setOpenSections] = useState<string[]>(["category", "price", "size"]);
  const perPage = 8;

  const toggleSection = (s: string) => setOpenSections((prev) =>
    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
  );

  const filtered = useMemo(() => {
    let result = allProducts.filter((p) => {
      if (category && category !== "sale" && category !== "" && p.category !== category) return false;
      if (category === "sale" && !p.discount) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) return false;
      if (filters.sizes.length > 0 && !filters.sizes.some((s) => p.sizes.includes(s))) return false;
      if (filters.minPrice > 0 && p.price < filters.minPrice) return false;
      if (filters.maxPrice < 1000 && p.price > filters.maxPrice) return false;
      if (filters.minRating > 0 && p.rating < filters.minRating) return false;
      if (filters.subcategories.length > 0 && !filters.subcategories.includes(p.subcategory)) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (filters.onSaleOnly && !p.discount) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "rating": return b.rating - a.rating;
        case "newest": return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default: return 0;
      }
    });
    return result;
  }, [category, filters, sortBy]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleFilter = <K extends keyof Filters>(key: K, val: string) => {
    setFilters((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
    setPage(1);
  };

  const activeFilterCount = filters.brands.length + filters.sizes.length + filters.colors.length +
    filters.subcategories.length + (filters.minRating > 0 ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 1000 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) + (filters.onSaleOnly ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Active Filters ({activeFilterCount})</span>
            <button onClick={() => setFilters(defaultFilters)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Clear All</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.brands.map((b) => (
              <button key={b} onClick={() => toggleFilter("brands", b)}
                className="flex items-center gap-1 px-3 py-1 bg-[var(--foreground)] text-[var(--background)] rounded-full text-xs">
                {b} <X size={10} />
              </button>
            ))}
            {filters.sizes.map((s) => (
              <button key={s} onClick={() => toggleFilter("sizes", s)}
                className="flex items-center gap-1 px-3 py-1 bg-[var(--foreground)] text-[var(--background)] rounded-full text-xs">
                {s} <X size={10} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subcategory */}
      {SUBCATEGORIES[category] && (
        <div>
          <button
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full py-2 font-semibold text-sm"
          >
            Category <ChevronDown size={16} className={`transition-transform ${openSections.includes("category") ? "rotate-180" : ""}`} />
          </button>
          {openSections.includes("category") && (
            <div className="space-y-2 mt-2">
              {SUBCATEGORIES[category].map((sub) => (
                <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      filters.subcategories.includes(sub) ? "bg-[var(--foreground)] border-[var(--foreground)]" : "border-[var(--border)]"
                    }`}
                    onClick={() => toggleFilter("subcategories", sub)}
                  >
                    {filters.subcategories.includes(sub) && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span className="text-sm group-hover:text-[var(--foreground)] text-[var(--muted-foreground)]" onClick={() => toggleFilter("subcategories", sub)}>{sub}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Brand */}
      <div className="border-t border-[var(--border)] pt-4">
        <button onClick={() => toggleSection("brand")} className="flex items-center justify-between w-full py-2 font-semibold text-sm">
          Brand <ChevronDown size={16} className={`transition-transform ${openSections.includes("brand") ? "rotate-180" : ""}`} />
        </button>
        {openSections.includes("brand") && (
          <div className="space-y-2 mt-2">
            {BRANDS.map((b) => (
              <label key={b} className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    filters.brands.includes(b) ? "bg-[var(--foreground)] border-[var(--foreground)]" : "border-[var(--border)]"
                  }`}
                  onClick={() => toggleFilter("brands", b)}
                >
                  {filters.brands.includes(b) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <span className="text-sm text-[var(--muted-foreground)]" onClick={() => toggleFilter("brands", b)}>{b}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Size */}
      <div className="border-t border-[var(--border)] pt-4">
        <button onClick={() => toggleSection("size")} className="flex items-center justify-between w-full py-2 font-semibold text-sm">
          Size <ChevronDown size={16} className={`transition-transform ${openSections.includes("size") ? "rotate-180" : ""}`} />
        </button>
        {openSections.includes("size") && (
          <div className="flex flex-wrap gap-2 mt-2">
            {SIZES.slice(0, 10).map((s) => (
              <button
                key={s}
                onClick={() => toggleFilter("sizes", s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filters.sizes.includes(s)
                    ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                    : "border-[var(--border)] hover:border-[var(--foreground)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="border-t border-[var(--border)] pt-4">
        <button onClick={() => toggleSection("color")} className="flex items-center justify-between w-full py-2 font-semibold text-sm">
          Color <ChevronDown size={16} className={`transition-transform ${openSections.includes("color") ? "rotate-180" : ""}`} />
        </button>
        {openSections.includes("color") && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(COLOR_MAP).map(([name, hex]) => (
              <button
                key={name}
                onClick={() => toggleFilter("colors", name)}
                title={name}
                className={`relative w-7 h-7 rounded-full border-2 transition-all ${
                  filters.colors.includes(name) ? "border-[var(--foreground)] scale-110" : "border-[var(--border)]"
                }`}
                style={{ backgroundColor: hex }}
              >
                {filters.colors.includes(name) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border-t border-[var(--border)] pt-4">
        <button onClick={() => toggleSection("price")} className="flex items-center justify-between w-full py-2 font-semibold text-sm">
          Price <ChevronDown size={16} className={`transition-transform ${openSections.includes("price") ? "rotate-180" : ""}`} />
        </button>
        {openSections.includes("price") && (
          <div className="mt-2 space-y-3">
            {[
              { label: "Under $100", min: 0, max: 100 },
              { label: "$100 – $200", min: 100, max: 200 },
              { label: "$200 – $400", min: 200, max: 400 },
              { label: "$400+", min: 400, max: 1000 },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => setFilters((f) => ({ ...f, minPrice: r.min, maxPrice: r.max }))}
                className={`flex items-center gap-2 text-sm w-full text-left ${
                  filters.minPrice === r.min && filters.maxPrice === r.max
                    ? "text-[var(--foreground)] font-semibold"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                  filters.minPrice === r.min && filters.maxPrice === r.max
                    ? "border-[var(--foreground)] bg-[var(--foreground)]"
                    : "border-[var(--border)]"
                }`} />
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-t border-[var(--border)] pt-4">
        <button onClick={() => toggleSection("rating")} className="flex items-center justify-between w-full py-2 font-semibold text-sm">
          Rating <ChevronDown size={16} className={`transition-transform ${openSections.includes("rating") ? "rotate-180" : ""}`} />
        </button>
        {openSections.includes("rating") && (
          <div className="space-y-2 mt-2">
            {[4, 3, 2].map((r) => (
              <button
                key={r}
                onClick={() => setFilters((f) => ({ ...f, minRating: f.minRating === r ? 0 : r }))}
                className={`flex items-center gap-2 text-sm w-full ${filters.minRating === r ? "font-semibold" : "text-[var(--muted-foreground)]"}`}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < r ? "text-amber-400 fill-amber-400" : "text-[var(--border)]"} />
                  ))}
                </div>
                & Up
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="border-t border-[var(--border)] pt-4 space-y-3">
        {[
          { key: "inStockOnly" as const, label: "In Stock Only" },
          { key: "onSaleOnly" as const, label: "On Sale" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">{label}</span>
            <div
              onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
              className={`w-10 h-6 rounded-full transition-all relative ${
                filters[key] ? "bg-[var(--foreground)]" : "bg-[var(--border)]"
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${filters[key] ? "left-5" : "left-1"}`} />
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-4">
          <button onClick={() => navigate("home")} className="hover:text-[var(--foreground)]">Home</button>
          <span>/</span>
          <span className="capitalize">{category || "All"}</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight capitalize">
              {category === "sale" ? "Sale" : category ? category + "'s" : "All Products"}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{filtered.length} items</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] outline-none cursor-pointer hover:bg-[var(--accent)] transition-colors"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* Grid Toggle */}
            <div className="hidden sm:flex border border-[var(--border)] rounded-xl overflow-hidden">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2.5 ${gridCols === 3 ? "bg-[var(--foreground)] text-[var(--background)]" : "hover:bg-[var(--accent)]"} transition-colors`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setGridCols(2)}
                className={`p-2.5 ${gridCols === 2 ? "bg-[var(--foreground)] text-[var(--background)]" : "hover:bg-[var(--accent)]"} transition-colors`}
              >
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-20">
        <div className="flex gap-8">
          {/* Sidebar – Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters(defaultFilters)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    Reset All
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="absolute left-0 top-0 bottom-0 w-80 bg-[var(--background)] p-6 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-lg">Filters</h2>
                    <button onClick={() => setSidebarOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <FilterPanel />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="mt-8 w-full py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold"
                  >
                    Show {filtered.length} Results
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {paginated.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-[var(--muted-foreground)] mb-6">Try adjusting your filters</p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-5 ${
                  gridCols === 3 ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2"
                }`}>
                  {paginated.map((p, i) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--accent)] transition-colors text-sm"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                          page === i + 1
                            ? "bg-[var(--foreground)] text-[var(--background)]"
                            : "hover:bg-[var(--accent)] border border-[var(--border)]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--accent)] transition-colors text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
