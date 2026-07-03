import type { Product, Review } from "../data/products";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080/api";

export interface ProductApiReviewDto {
  id: number;
  productId: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export interface ProductApiDto {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  rating: number;
  reviews: number;
  category: Product["category"];
  subcategory: string;
  colors: string[];
  sizes: string[];
  image: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isLimited: boolean;
  inStock: boolean;
  tags: string[];
  reviewsData: ProductApiReviewDto[];
}

function mapReview(review: ProductApiReviewDto): Review {
  return {
    id: String(review.id),
    productId: review.productId,
    user: review.user,
    avatar: review.avatar,
    rating: review.rating,
    date: review.date,
    comment: review.comment,
    helpful: review.helpful,
  };
}

export function mapProductApiToProduct(dto: ProductApiDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    brand: dto.brand,
    price: dto.price,
    originalPrice: dto.originalPrice ?? undefined,
    discount: dto.discount ?? undefined,
    rating: dto.rating,
    reviews: dto.reviews,
    category: dto.category,
    subcategory: dto.subcategory,
    colors: dto.colors ?? [],
    sizes: dto.sizes ?? [],
    images: dto.images?.length ? dto.images : dto.image ? [dto.image] : [],
    description: dto.description,
    specs: dto.specs ?? {},
    isNew: dto.isNew,
    isBestSeller: dto.isBestSeller,
    isTrending: dto.isTrending,
    isLimited: dto.isLimited,
    inStock: dto.inStock,
    tags: dto.tags ?? [],
    reviewsData: dto.reviewsData?.map(mapReview),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.status}`);
  }

  const data: ProductApiDto[] = await response.json();
  return data.map(mapProductApiToProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.status}`);
  }

  const data: ProductApiDto[] = await response.json();
  return data.map(mapProductApiToProduct);
}

export async function updateProductSale(productId: string, discount: number | undefined, token?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/sale`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ discount: discount ?? null }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update sale: ${response.status}`);
  }
}

export async function fetchWishlist(token: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load wishlist: ${response.status}`);
  }

  const data: ProductApiDto[] = await response.json();
  return data.map(mapProductApiToProduct);
}

export async function toggleWishlistItem(productId: string, shouldAdd: boolean, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
    method: shouldAdd ? "POST" : "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to update wishlist: ${response.status}`);
  }
}
