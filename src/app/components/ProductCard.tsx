import { useState } from "react";
import { motion } from "motion/react";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { toggleWishlist, isWishlisted, addToCart, navigate, toast } = useApp();
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0]);
    toast(`${product.name} added to bag`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist ♥");
  };

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group cursor-pointer"
        onClick={() => navigate("product", { productId: product.id })}
      >
        <div className="relative overflow-hidden rounded-xl aspect-[3/4] mb-3 bg-[var(--accent)]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              wishlisted ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
          >
            <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          {product.isNew && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-[10px] font-semibold rounded-full tracking-wider uppercase">New</span>
          )}
        </div>
        <div>
          <p className="text-xs text-[var(--muted-foreground)] mb-1">{product.brand}</p>
          <p className="text-sm font-medium truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-[var(--muted-foreground)] line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group cursor-pointer"
      onMouseEnter={() => { setHovered(true); if (product.images[1]) setImgIdx(1); }}
      onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
      onClick={() => navigate("product", { productId: product.id })}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-4 bg-[var(--accent)]">
        <motion.img
          key={imgIdx}
          src={product.images[imgIdx]}
          alt={product.name}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="px-2.5 py-1 bg-[var(--foreground)] text-[var(--background)] text-[10px] font-bold rounded-full tracking-widest uppercase">New</span>
          )}
          {product.isLimited && (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full tracking-widest uppercase">Limited</span>
          )}
          {product.discount && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">-{product.discount}%</span>
          )}
        </div>

        {/* Actions Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/20"
        />

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.9 }}
            className={`p-2.5 rounded-xl backdrop-blur-sm shadow-lg transition-all ${
              wishlisted ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
          >
            <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); navigate("product", { productId: product.id }); }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm shadow-lg"
          >
            <Eye size={16} />
          </motion.button>
        </div>

        {/* Quick Add */}
        <motion.button
          onClick={handleAddToCart}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: hovered ? 0 : 8, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 left-3 right-3 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <ShoppingBag size={14} />
          Quick Add
        </motion.button>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] tracking-widest uppercase">{product.brand}</p>
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-[var(--muted-foreground)]">{product.rating}</span>
          </div>
        </div>
        <p className="font-medium text-sm leading-snug">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="font-bold">${product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-[var(--muted-foreground)] line-through">${product.originalPrice}</span>
          )}
          {product.discount && (
            <span className="text-xs text-red-500 font-semibold">Save {product.discount}%</span>
          )}
        </div>
        {/* Color swatches */}
        <div className="flex items-center gap-1.5 pt-1">
          {product.colors.slice(0, 4).map((c) => (
            <div
              key={c}
              className="w-3.5 h-3.5 rounded-full border border-[var(--border)] ring-1 ring-[var(--border)] ring-offset-1"
              style={{ backgroundColor: c }}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-[var(--muted-foreground)]">+{product.colors.length - 4}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
