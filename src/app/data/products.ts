export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  category: "men" | "accessories" | "shoes";
  subcategory: string;
  colors: string[];
  sizes: string[];
  images: string[];
  description: string;
  specs: Record<string, string>;
  isNew?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isLimited?: boolean;
  inStock: boolean;
  tags: string[];
  reviewsData?: Review[];
}

export interface Review {
  id: string;
  productId: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  photos?: string[];
  helpful: number;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Tailored Italian Suit",
    brand: "LUXE",
    price: 850,
    originalPrice: 1100,
    discount: 22,
    rating: 4.9,
    reviews: 124,
    category: "men",
    subcategory: "Suits",
    colors: ["#1a1a1a", "#2c3e50"],
    sizes: ["38R", "40R", "42R", "44R"],
    images: [
      "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"
    ],
    description: "Impeccably tailored from premium Italian wool, this suit offers a sharp, modern silhouette perfect for any formal occasion. Features a fully lined jacket and flat-front trousers.",
    specs: { Material: "100% Wool", Care: "Dry Clean Only", Fit: "Slim Fit", Origin: "Italy" },
    isNew: true,
    isBestSeller: true,
    inStock: true,
    tags: ["suit", "formal", "wool", "italian"],
  },
  {
    id: "p2",
    name: "Classic White Oxford",
    brand: "MAISON",
    price: 125,
    rating: 4.7,
    reviews: 310,
    category: "men",
    subcategory: "Shirts",
    colors: ["#ffffff", "#f5f5f0"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=800&q=80"
    ],
    description: "The quintessential white Oxford shirt. Crisp, breathable cotton and a tailored fit make this a versatile staple for both office and weekend wear.",
    specs: { Material: "100% Cotton", Care: "Machine Wash", Fit: "Tailored", Collar: "Button-down" },
    isBestSeller: true,
    inStock: true,
    tags: ["shirt", "oxford", "white", "staple", "cotton"],
  },
  {
    id: "p3",
    name: "Merino Wool Sweater",
    brand: "NORD",
    price: 135,
    originalPrice: 180,
    discount: 25,
    rating: 4.8,
    reviews: 278,
    category: "men",
    subcategory: "Knitwear",
    colors: ["#4a4a4a", "#1a1a1a", "#d4c5a9", "#8b4513"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1574427797991-b086946fa9e7?w=800&q=80",
      "https://images.unsplash.com/photo-1554925051-f668ed70d520?w=800&q=80",
    ],
    description: "Refined merino wool crew-neck sweater with a classic dropped shoulder. Lightweight yet warm, this versatile piece pairs with everything from denim to tailored trousers.",
    specs: { Material: "100% Extra-Fine Merino Wool", Gauge: "12-Gauge Knit", Care: "Machine Wash Gentle", Fit: "Regular" },
    isTrending: true,
    inStock: true,
    tags: ["merino", "wool", "sweater", "knitwear", "versatile"],
  },
  {
    id: "p4",
    name: "Tailored Slim Trousers",
    brand: "MAISON",
    price: 145,
    rating: 4.6,
    reviews: 156,
    category: "men",
    subcategory: "Trousers",
    colors: ["#1a1a1a", "#4a4a4a", "#c4a882", "#2c3e50"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    images: [
      "https://images.unsplash.com/photo-1582225905616-c3adc77ada6b?w=800&q=80",
      "https://images.unsplash.com/photo-1523585298601-d46ae038d7d3?w=800&q=80",
    ],
    description: "Sharp, slim-cut trousers crafted from premium Italian wool blend. Features a flat front, side pockets, and a clean finish perfect for both formal and smart-casual occasions.",
    specs: { Material: "70% Wool, 30% Polyester", Care: "Dry Clean", Fit: "Slim Straight", Rise: "Mid Rise" },
    inStock: true,
    tags: ["trousers", "slim", "tailored", "formal"],
  },
  {
    id: "p5",
    name: "Classic Oxford Shoes",
    brand: "MAISON",
    price: 285,
    originalPrice: 375,
    discount: 24,
    rating: 4.8,
    reviews: 143,
    category: "shoes",
    subcategory: "Formal",
    colors: ["#1a1a1a", "#8b4513", "#c4a882"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    images: [
      "https://images.unsplash.com/photo-1668069226492-508742b03147?w=800&q=80",
      "https://images.unsplash.com/photo-1614252339460-e143130d2aa2?w=800&q=80",
    ],
    description: "Handcrafted Oxford shoes made from smooth calfskin leather with a Goodyear-welted sole. A timeless wardrobe essential that only improves with age.",
    specs: { Material: "Calfskin Leather Upper", Sole: "Leather Goodyear Welt", Lining: "Leather", Origin: "Italy" },
    isLimited: true,
    inStock: true,
    tags: ["oxford", "shoes", "leather", "formal", "italian"],
  },
  {
    id: "p6",
    name: "Casual Denim Jacket",
    brand: "NORD",
    price: 150,
    rating: 4.5,
    reviews: 320,
    category: "men",
    subcategory: "Outerwear",
    colors: ["#2c3e50", "#1a1a1a", "#d4c5a9"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ebd?w=800&q=80",
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&q=80",
    ],
    description: "A rugged, classic denim jacket with timeless appeal. Built to last and soften with every wear, featuring button-flap chest pockets and adjustable side tabs.",
    specs: { Material: "100% Cotton Denim", Fit: "Regular", Care: "Machine Wash Cold", Origin: "Japan" },
    isBestSeller: true,
    inStock: true,
    tags: ["denim", "jacket", "casual", "outerwear"],
  },
  {
    id: "p7",
    name: "Minimalist Leather Watch",
    brand: "LUXE",
    price: 250,
    rating: 4.7,
    reviews: 185,
    category: "accessories",
    subcategory: "Watches",
    colors: ["#1a1a1a", "#8b4513"],
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
    ],
    description: "A sleek timepiece combining a precise quartz movement with a premium genuine leather strap. Features a minimalist dial that suits both casual and formal attire.",
    specs: { Material: "Stainless Steel Case, Leather Strap", Movement: "Quartz", WaterResistance: "5 ATM", Face: "40mm" },
    isNew: true,
    inStock: true,
    tags: ["watch", "leather", "accessory", "minimalist"],
  },
  {
    id: "p8",
    name: "Straight Leg Chinos",
    brand: "MAISON",
    price: 95,
    originalPrice: 130,
    discount: 27,
    rating: 4.5,
    reviews: 267,
    category: "men",
    subcategory: "Trousers",
    colors: ["#c4a882", "#1a1a1a", "#4a4a4a", "#2c3e50"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    images: [
      "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?w=800&q=80",
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80",
    ],
    description: "Clean and versatile straight-leg chinos in a premium cotton twill. The perfect balance of comfort and refinement for any occasion.",
    specs: { Material: "98% Cotton, 2% Elastane", Rise: "Regular", Fit: "Straight", Care: "Machine Wash" },
    isTrending: true,
    inStock: true,
    tags: ["chinos", "casual", "versatile", "cotton"],
  }
];

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "p1",
    user: "James W.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&q=80",
    rating: 5,
    date: "2026-05-15",
    comment: "The tailoring on this suit is exceptional. It fits perfectly right out of the box and the material feels incredibly premium. Wore it to a wedding and felt great.",
    helpful: 24,
  },
  {
    id: "r2",
    productId: "p1",
    user: "Michael T.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80",
    rating: 5,
    date: "2026-05-02",
    comment: "Worth the investment. The silhouette is very modern without being too skinny.",
    helpful: 18,
  },
  {
    id: "r3",
    productId: "p3",
    user: "David L.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
    rating: 4,
    date: "2026-04-28",
    comment: "Great sweater, very soft. I had to size up to get the relaxed fit I wanted, but the quality is top notch.",
    helpful: 31,
  },
];

export const categories = [
  {
    id: "men",
    name: "Men's Clothing",
    image: "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?w=800&q=80",
    count: 186,
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80",
    count: 132,
  },
  {
    id: "shoes",
    name: "Shoes",
    image: "https://images.unsplash.com/photo-1668069226492-508742b03147?w=800&q=80",
    count: 112,
  },
];

export const testimonials = [
  {
    id: "t1",
    name: "Alexander Vance",
    role: "Men's Style Editor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
    quote: "MAEVEN has completely redefined the modern man's wardrobe. The quality is unmatched and the curation is simply impeccable.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Marcus Williams",
    role: "Creative Director",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
    quote: "I've shopped at every luxury retailer globally. MAEVEN consistently delivers pieces that feel both timeless and contemporary.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Julian Cross",
    role: "Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    quote: "The personalized recommendations are uncanny — it's like having a personal tailor who truly understands my aesthetic.",
    rating: 5,
  },
];

export const instagramPosts = [
  { id: "ig1", image: "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=400&q=80", likes: 2840, comments: 142 },
  { id: "ig2", image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&q=80", likes: 1920, comments: 98 },
  { id: "ig3", image: "https://images.unsplash.com/photo-1574427797991-b086946fa9e7?w=400&q=80", likes: 3410, comments: 201 },
  { id: "ig4", image: "https://images.unsplash.com/photo-1582225905616-c3adc77ada6b?w=400&q=80", likes: 2150, comments: 117 },
  { id: "ig5", image: "https://images.unsplash.com/photo-1668069226492-508742b03147?w=400&q=80", likes: 1780, comments: 83 },
  { id: "ig6", image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400&q=80", likes: 4200, comments: 315 },
];