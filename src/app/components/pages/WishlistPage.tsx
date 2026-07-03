import { motion } from "motion/react";
import { Heart, Share2, ShoppingBag, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ProductCard } from "../ProductCard";

export function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, navigate, toast, allProducts } = useApp();

  const moveAllToCart = () => {
    const addedCount = wishlist.filter((p) => addToCart(p, p.sizes[0], p.colors[0])).length;
    if (addedCount > 0) {
      toast(`${addedCount} items added to your bag!`);
      navigate("cart");
    }
  };

  const shareWishlist = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast("Wishlist link copied to clipboard!");
  };

  const recommended = allProducts.filter((p) => !wishlist.find((w) => w.id === p.id)).slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Wishlist</h1>
            <p className="text-[var(--muted-foreground)] text-sm mt-1">{wishlist.length} saved items</p>
          </div>
          <div className="flex gap-3">
            {wishlist.length > 0 && (
              <>
                <button
                  onClick={shareWishlist}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium hover:bg-[var(--accent)] transition-colors"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  onClick={moveAllToCart}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <ShoppingBag size={14} /> Move All to Bag
                </button>
              </>
            )}
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-24">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-6"
            >
              <Heart size={40} className="text-red-400" />
            </motion.div>
            <h2 className="text-2xl font-black mb-3">Your Wishlist is Empty</h2>
            <p className="text-[var(--muted-foreground)] mb-8 max-w-sm mx-auto">
              Save pieces you love by tapping the heart icon on any product
            </p>
            <button
              onClick={() => navigate("listing", {})}
              className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold"
            >
              Start Saving
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative group"
              >
                <ProductCard product={p} />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      if (addToCart(p, p.sizes[0], p.colors[0])) {
                        toast(`${p.name} added to bag`);
                      }
                    }}
                    className="flex-1 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={12} /> Move to Bag
                  </button>
                  <button
                    onClick={() => { toggleWishlist(p); toast("Removed from wishlist"); }}
                    className="p-2.5 border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {recommended.length > 0 && (
          <section className="mt-20">
            <h3 className="text-2xl font-black mb-6">You Might Also Love</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
