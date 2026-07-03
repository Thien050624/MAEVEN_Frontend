import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, Share2, Ruler, Truck, RotateCcw, Shield, Plus, Minus, Check, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ProductCard } from "../ProductCard";

export function ProductDetailPage() {
  const { selectedProductId, navigate, addToCart, toggleWishlist, isWishlisted, toast, allProducts, isLoggedIn } = useApp();
  const product = allProducts.find((p) => p.id === selectedProductId) || allProducts[0];
  const productReviews = product.reviewsData ?? [];
  const related = allProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const [mainImg, setMainImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"description" | "specs" | "reviews">("description");
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast("Please sign in to add items to your bag", "info");
      navigate("auth", { mode: "login" });
      return false;
    }
    if (!selectedSize) {
      toast("Please select a size", "error");
      return false;
    }
    if (addToCart(product, selectedSize, selectedColor, quantity)) {
      toast(`${product.name} added to your bag`);
      return true;
    }
    return false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-8">
          <button onClick={() => navigate("home")} className="hover:text-[var(--foreground)]">Home</button>
          <span>/</span>
          <button onClick={() => navigate("listing", { category: product.category })} className="hover:text-[var(--foreground)] capitalize">
            {product.category}
          </button>
          <span>/</span>
          <span className="text-[var(--foreground)]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 xl:gap-20">
          {/* Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-3 w-20 flex-shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(i)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    mainImg === i ? "border-[var(--foreground)]" : "border-transparent hover:border-[var(--border)]"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1">
              <div
                className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-[var(--accent)] cursor-zoom-in"
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <motion.img
                  key={mainImg}
                  src={product.images[mainImg]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                  style={zoomed ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: "scale(1.8)",
                  } : {}}
                />

                {/* Nav Arrows */}
                <button
                  onClick={() => setMainImg((i) => (i - 1 + product.images.length) % product.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setMainImg((i) => (i + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && <span className="px-3 py-1 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold rounded-full tracking-widest uppercase">New</span>}
                  {product.isLimited && <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full tracking-widest uppercase">Limited</span>}
                  {product.discount && <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">-{product.discount}%</span>}
                </div>

                {/* Wishlist */}
                <button
                  onClick={() => { toggleWishlist(product); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ♥"); }}
                  className={`absolute top-4 right-4 p-3 rounded-xl shadow-lg backdrop-blur-sm transition-all ${
                    wishlisted ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                  }`}
                >
                  <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Mobile Thumbnails */}
              <div className="flex sm:hidden gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${mainImg === i ? "border-[var(--foreground)]" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">{product.brand}</span>
                <button className="p-2 rounded-xl hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)]">
                  <Share2 size={16} />
                </button>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-[var(--border)]"} />
                  ))}
                </div>
                <span className="text-sm font-semibold">{product.rating}</span>
                <span className="text-sm text-[var(--muted-foreground)]">({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 py-4 border-y border-[var(--border)]">
              <span className="text-4xl font-black">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-[var(--muted-foreground)] line-through">${product.originalPrice}</span>
                  <span className="px-3 py-1 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 text-sm font-bold rounded-full">
                    Save ${product.originalPrice - product.price}
                  </span>
                </>
              )}
            </div>

            {/* AI Stylist Tip */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border border-purple-100 dark:border-purple-900">
              <Sparkles size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-700 dark:text-purple-300">
                <strong>AI Stylist:</strong> Pair with the Premium Leather Tote and Classic Oxford Shoes for a complete editorial look.
              </p>
            </div>

            {/* Color */}
            <div>
              <p className="text-sm font-semibold mb-3">Color: <span className="font-normal text-[var(--muted-foreground)] capitalize">{selectedColor === "#1a1a1a" ? "Black" : selectedColor === "#f5f5f0" ? "White" : "Camel"}</span></p>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-9 h-9 rounded-full border-4 transition-all ${
                      selectedColor === c ? "border-[var(--foreground)] scale-110" : "border-[var(--border)] hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Size {selectedSize && <span className="font-normal text-[var(--muted-foreground)]">— {selectedSize}</span>}</p>
                <button className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                  <Ruler size={12} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] h-11 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedSize === s
                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                        : "border-[var(--border)] hover:border-[var(--foreground)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-[var(--accent)] transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-5 text-sm font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="p-3 hover:bg-[var(--accent)] transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">Only 3 left in this size</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <ShoppingBag size={18} />
                Add to Bag
              </button>
              <button
                onClick={() => {
                  if (handleAddToCart()) {
                    navigate("checkout");
                  }
                }}
                className="flex-1 py-4 border-2 border-[var(--foreground)] rounded-2xl font-bold text-sm hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: "Free Shipping over $150" },
                { icon: RotateCcw, text: "30-Day Free Returns" },
                { icon: Shield, text: "Authentic Guarantee" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 text-center p-3 rounded-xl bg-[var(--accent)]">
                  <Icon size={16} className="text-[var(--muted-foreground)]" />
                  <span className="text-[10px] text-[var(--muted-foreground)]">{text}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="pt-4">
              <div className="flex gap-6 border-b border-[var(--border)]">
                {(["description", "specs", "reviews"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`pb-3 text-sm font-medium capitalize transition-colors relative ${
                      tab === t ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {t} {t === "reviews" && `(${product.reviews})`}
                    {tab === t && (
                      <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--foreground)]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-4">
                {tab === "description" && (
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{product.description}</p>
                )}
                {tab === "specs" && (
                  <div className="space-y-3">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm border-b border-[var(--border)] pb-2">
                        <span className="text-[var(--muted-foreground)]">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "reviews" && (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="flex items-center gap-6 p-5 bg-[var(--accent)] rounded-2xl">
                      <div className="text-center">
                        <p className="text-5xl font-black">{product.rating}</p>
                        <div className="flex gap-0.5 justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{product.reviews} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((r) => (
                          <div key={r} className="flex items-center gap-2 text-xs">
                            <span className="w-4 text-right text-[var(--muted-foreground)]">{r}</span>
                            <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: r === 5 ? "70%" : r === 4 ? "20%" : "5%" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reviews List */}
                    {productReviews.map((rev) => (
                      <div key={rev.id} className="border-b border-[var(--border)] pb-5">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={rev.avatar} alt={rev.user} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-semibold">{rev.user}</p>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={11} className={i < rev.rating ? "text-amber-400 fill-amber-400" : "text-[var(--border)]"} />
                              ))}
                            </div>
                          </div>
                          <span className="ml-auto text-xs text-[var(--muted-foreground)]">{rev.date}</span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{rev.comment}</p>
                        <button className="mt-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          Helpful ({rev.helpful})
                        </button>
                      </div>
                    ))}

                    {productReviews.length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)]">Chưa có đánh giá cho sản phẩm này.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">You May Also Like</span>
                <h2 className="text-3xl font-black tracking-tight mt-1">Related Products</h2>
              </div>
              <button onClick={() => navigate("listing", { category: product.category })} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1">
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Frequently Bought Together */}
        <section className="mt-16 p-8 rounded-3xl bg-[var(--card)]">
          <h2 className="text-xl font-black mb-6">Frequently Bought Together</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              {[product, allProducts[4], allProducts[7]].map((p, i) => (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="relative">
                    <img src={p.images[0]} alt={p.name} className="w-20 h-24 object-cover rounded-xl" />
                    <button
                      onClick={() => navigate("product", { productId: p.id })}
                      className="absolute inset-0 hover:bg-black/10 rounded-xl transition-colors"
                    />
                  </div>
                  {i < 2 && <Plus size={16} className="text-[var(--muted-foreground)] flex-shrink-0" />}
                </div>
              ))}
            </div>
            <div className="sm:ml-auto space-y-2">
              <p className="text-sm text-[var(--muted-foreground)]">Total for all 3 items:</p>
              <p className="text-2xl font-black">${product.price + allProducts[4].price + allProducts[7].price}</p>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    toast("Please sign in to add items to your bag", "info");
                    navigate("auth", { mode: "login" });
                    return;
                  }
                  const added =
                    addToCart(product, product.sizes[0], product.colors[0]) &&
                    addToCart(allProducts[4], allProducts[4].sizes[0], allProducts[4].colors[0]) &&
                    addToCart(allProducts[7], allProducts[7].sizes[0], allProducts[7].colors[0]);
                  if (added) {
                    toast("3 items added to your bag!");
                    navigate("cart");
                  }
                }}
                className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold text-sm whitespace-nowrap hover:opacity-90"
              >
                Add All to Bag
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
