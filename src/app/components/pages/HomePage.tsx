import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Star, Play, Sparkles, TrendingUp, Award, Truck, RotateCcw, Shield } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { categories, testimonials, instagramPosts } from "../../data/products";
import { ProductCard } from "../ProductCard";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1920&q=80",
    tag: "New Season",
    title: "Effortless\nLuxury",
    sub: "Discover the Summer 2026 Collection",
    cta: "Explore Collection",
    page: "listing",
    params: { category: "men" },
    align: "left",
  },
  {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1920&q=80",
    tag: "Editorial",
    title: "Power\nDressing",
    sub: "Sharp tailoring for the modern professional",
    cta: "Shop Suits",
    page: "listing",
    params: { category: "men", subcategory: "Suits" },
    align: "right",
  },
  {
    image: "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?w=1920&q=80",
    tag: "Limited Edition",
    title: "Modern\nClassics",
    sub: "Everyday essentials defined by quiet confidence",
    cta: "View Collection",
    page: "listing",
    params: { category: "men", subcategory: "Knitwear" },
    align: "center",
  },
];

const features = [
  { icon: Truck, title: "Free Shipping", sub: "On orders over $150" },
  { icon: RotateCcw, title: "Easy Returns", sub: "30-day free returns" },
  { icon: Shield, title: "Authenticity", sub: "100% genuine products" },
  { icon: Award, title: "Premium Quality", sub: "Curated luxury brands" },
];

export function HomePage() {
  const { navigate, toast, allProducts } = useApp();
  const [heroIdx, setHeroIdx] = useState(0);
  const [arrivalsIdx, setArrivalsIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const newArrivals = allProducts.filter((p) => p.isNew);
  const trending = allProducts.filter((p) => p.isTrending);
  const bestSellers = allProducts.filter((p) => p.isBestSeller);
  const limited = allProducts.filter((p) => p.isLimited);
  const perPage = 4;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* HERO */}
      <div ref={heroRef} className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <motion.img
              style={{ y: heroY }}
              src={heroSlides[heroIdx].image}
              alt={heroSlides[heroIdx].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <motion.div
          style={{ opacity: heroOpacity }}
          className={`absolute inset-0 flex items-center px-8 sm:px-16 lg:px-24 ${
            heroSlides[heroIdx].align === "right" ? "justify-end" : "justify-start"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIdx}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white max-w-lg"
            >
              <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
                {heroSlides[heroIdx].tag}
              </span>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6 whitespace-pre-line">
                {heroSlides[heroIdx].title}
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-sm">
                {heroSlides[heroIdx].sub}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(heroSlides[heroIdx].page, heroSlides[heroIdx].params)}
                  className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/90 transition-all"
                >
                  {heroSlides[heroIdx].cta}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
                  <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center">
                    <Play size={14} fill="currentColor" />
                  </div>
                  Watch Film
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Slide Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`transition-all duration-300 rounded-full ${
                i === heroIdx ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Slide Arrows */}
        <button
          onClick={() => setHeroIdx((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setHeroIdx((i) => (i + 1) % heroSlides.length)}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Features Strip */}
      <div className="border-y border-[var(--border)] py-6 bg-[var(--card)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[var(--foreground)]" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Showcase */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">Shop By</span>
            <h2 className="text-4xl font-black tracking-tight mt-1">Categories</h2>
          </div>
          <button onClick={() => navigate("listing", {})} className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            All Categories <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => navigate("listing", { category: cat.id })}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-[var(--accent)]"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white text-left">
                <p className="text-xs text-white/70 mb-0.5">{cat.count} Items</p>
                <p className="text-lg font-bold">{cat.name}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-20">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80",
              tag: "Exclusive",
              title: "The Art of\nAccessorising",
              sub: "Statement pieces for every occasion",
              cta: "Explore Accessories",
              page: "listing",
              params: { category: "accessories" },
              light: false,
            },
            {
              image: "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?w=800&q=80",
              tag: "Men's Edit",
              title: "Refined\nEssentials",
              sub: "Classic pieces, modern silhouettes",
              cta: "Shop Clothing",
              page: "listing",
              params: { category: "men" },
              light: false,
            },
          ].map((banner) => (
            <motion.div
              key={banner.title}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl h-[420px] cursor-pointer group"
              onClick={() => navigate(banner.page, banner.params)}
            >
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <span className="text-xs font-semibold tracking-widest uppercase bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3 inline-block">
                  {banner.tag}
                </span>
                <h3 className="text-3xl font-black leading-tight mb-2 whitespace-pre-line">{banner.title}</h3>
                <p className="text-sm text-white/70 mb-4">{banner.sub}</p>
                <div className="flex items-center gap-2 text-sm font-semibold group/btn">
                  {banner.cta} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">Just In</span>
            <h2 className="text-4xl font-black tracking-tight mt-1">New Arrivals</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setArrivalsIdx((i) => Math.max(0, i - 1))}
              disabled={arrivalsIdx === 0}
              className="p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setArrivalsIdx((i) => Math.min(newArrivals.length - perPage, i + 1))}
              disabled={arrivalsIdx >= newArrivals.length - perPage}
              className="p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.slice(arrivalsIdx, arrivalsIdx + perPage).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-20">
        <div className="grid grid-cols-12 gap-4 auto-rows-[200px]">
          {/* Large Feature */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="col-span-12 sm:col-span-8 row-span-2 relative overflow-hidden rounded-3xl cursor-pointer group"
            onClick={() => navigate("listing", { category: "men" })}
          >
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=80"
              alt="Summer Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent" />
            <div className="absolute top-8 left-8 text-white">
              <p className="text-xs tracking-widest uppercase opacity-70 mb-2">Summer 2026</p>
              <h3 className="text-4xl font-black leading-tight">The Modern<br />Collection</h3>
              <button className="mt-4 flex items-center gap-2 text-sm font-semibold group/btn">
                Shop Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Stat Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 sm:col-span-4 row-span-1 bg-[var(--foreground)] text-[var(--background)] rounded-3xl p-8 flex flex-col justify-between"
          >
            <TrendingUp size={28} />
            <div>
              <p className="text-4xl font-black">2.4M+</p>
              <p className="text-sm opacity-60 mt-1">Happy customers worldwide</p>
            </div>
          </motion.div>

          {/* AI Stylist Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-12 sm:col-span-4 row-span-1 bg-gradient-to-br from-indigo-800 to-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between cursor-pointer"
            onClick={() => navigate("ai-stylist")}
          >
            <Sparkles size={28} />
            <div>
              <p className="font-black text-lg">AI Stylist</p>
              <p className="text-sm opacity-70 mt-1">Get personalised style recommendations</p>
            </div>
          </motion.div>

          {/* Brand Values */}
          {[
            { bg: "bg-[var(--accent)]", icon: "🌿", title: "Sustainable", sub: "Ethically sourced materials" },
            { bg: "bg-amber-50 dark:bg-amber-950", icon: "✦", title: "Curated", sub: "Hand-picked luxury pieces" },
            { bg: "bg-blue-50 dark:bg-blue-950", icon: "⟡", title: "Exclusive", sub: "Members-only limited drops" },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`col-span-4 sm:col-span-4 row-span-1 ${card.bg} rounded-3xl p-6 flex flex-col justify-between`}
            >
              <span className="text-3xl">{card.icon}</span>
              <div>
                <p className="font-bold">{card.title}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">Right Now</span>
            <h2 className="text-4xl font-black tracking-tight mt-1">Trending</h2>
          </div>
          <button onClick={() => navigate("listing", {})} className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...trending, ...allProducts].slice(0, 4).map((p, i) => (
            <motion.div
              key={p.id + "-t" + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-[var(--card)] py-20 mb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">Most Loved</span>
              <h2 className="text-4xl font-black tracking-tight mt-1">Best Sellers</h2>
            </div>
            <button onClick={() => navigate("listing", {})} className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...bestSellers, ...allProducts].slice(0, 4).map((p, i) => (
              <motion.div
                key={p.id + "-bs" + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Limited Edition Banner */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-[var(--foreground)] text-[var(--background)] px-8 sm:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }}
          />
          <div className="relative z-10">
            <span className="text-xs font-semibold tracking-widest uppercase opacity-50 mb-3 block">Limited Drop</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
              Members-Only<br />Early Access
            </h2>
            <p className="text-sm opacity-60 max-w-sm">
              Join the MAEVEN Circle to unlock exclusive limited editions before anyone else.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("auth", { mode: "register" })}
              className="px-10 py-4 bg-white text-black rounded-full font-bold text-sm hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Join The Circle
            </button>
            <button
              onClick={() => navigate("listing", { filter: "limited" })}
              className="px-10 py-4 border border-white/30 text-white rounded-full font-semibold text-sm hover:border-white/60 transition-colors whitespace-nowrap"
            >
              View Limited Items
            </button>
          </div>
        </motion.div>
      </section>

      {/* Seasonal Lookbook */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">Summer 2026</span>
            <h2 className="text-4xl font-black tracking-tight mt-1">The Lookbook</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl aspect-[16/10] cursor-pointer group"
            onClick={() => navigate("listing", { category: "men" })}>
            <img
              src="https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1000&q=80"
              alt="Lookbook"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-xs tracking-widest uppercase opacity-60 mb-2">Lookbook</p>
              <h3 className="text-3xl font-black">City Living</h3>
              <p className="text-sm opacity-70 mt-1 mb-4">12 curated pieces for the urban explorer</p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                Explore Look <ArrowRight size={14} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { img: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=80", title: "Denim Edit", count: "8 styles" },
              { img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80", title: "Casual Wear", count: "6 styles" },
            ].map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-3xl flex-1 cursor-pointer group"
                onClick={() => navigate("listing", {})}
              >
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs opacity-60">{item.count}</p>
                  <p className="font-bold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[var(--card)] py-20 mb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">Reviews</span>
            <h2 className="text-4xl font-black tracking-tight mt-2">What They're Saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-[var(--background)] rounded-2xl p-8 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-[var(--foreground)] mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-20">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-foreground)]">@maevenstyle</span>
          <h2 className="text-4xl font-black tracking-tight mt-2">Follow Our World</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {instagramPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.03 }}
              className="relative overflow-hidden rounded-2xl aspect-square cursor-pointer group"
            >
              <img src={post.image} alt="Instagram" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all text-white text-center">
                  <p className="text-sm font-bold">♥ {(post.likes / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6">
          <a href="#" className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Follow @maevenstyle <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-12 sm:p-20 text-center"
        >
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% -20%, rgba(139,92,246,0.3) 0%, transparent 60%)" }} />
          <div className="relative z-10 max-w-lg mx-auto">
            <Sparkles className="mx-auto mb-4 text-purple-400" size={32} />
            <h2 className="text-4xl font-black mb-3">Stay in the Loop</h2>
            <p className="text-white/60 mb-8">Join 250,000+ fashion lovers. Get exclusive access to new drops, style guides, and early sale access.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); toast("You're subscribed! Welcome to MAEVEN ✨"); }}
              className="flex gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-white/50 transition-colors"
              />
              <button type="submit" className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}