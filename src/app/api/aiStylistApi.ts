import type { Product } from "../data/products";
import { mapProductApiToProduct, type ProductApiDto } from "./productsApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080/api";

export interface AiStylistResponseDto {
  outfitName: string;
  summary: string;
  reasoning: string;
  stylingTips: string[];
  productIds: string[];
  products: ProductApiDto[];
}

export interface AiStylistRecommendation {
  outfitName: string;
  summary: string;
  reasoning: string;
  stylingTips: string[];
  productIds: string[];
  products: Product[];
}

export async function createAiStylistRecommendation(message: string, token: string): Promise<AiStylistRecommendation> {
  const response = await fetch(`${API_BASE_URL}/ai-stylist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Failed to create recommendation: ${response.status}`);
  }

  const data: AiStylistResponseDto = await response.json();
  return {
    outfitName: data.outfitName,
    summary: data.summary,
    reasoning: data.reasoning,
    stylingTips: data.stylingTips ?? [],
    productIds: data.productIds ?? [],
    products: (data.products ?? []).map(mapProductApiToProduct),
  };
}
