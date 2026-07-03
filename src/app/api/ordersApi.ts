import type { CartItem } from "../context/AppContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080/api";

export interface ShippingAddressPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  size: string;
  color: string;
}

export interface OrderDto {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: string;
  paymentMethod: "qr" | "cod" | string;
  paymentStatus: string;
  deliveryMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddressPayload;
  items: OrderItemDto[];
}

export async function createOrder(
  token: string,
  payload: {
    shippingAddress: ShippingAddressPayload;
    deliveryMethod: string;
    paymentMethod: "qr" | "cod";
    items: CartItem[];
  }
): Promise<OrderDto> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shippingAddress: payload.shippingAddress,
      deliveryMethod: payload.deliveryMethod,
      paymentMethod: payload.paymentMethod,
      items: payload.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create order: ${response.status}`);
  }

  return response.json();
}

export async function fetchMyOrders(token: string): Promise<OrderDto[]> {
  const response = await fetch(`${API_BASE_URL}/orders/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to load orders: ${response.status}`);
  }

  return response.json();
}

export async function fetchAllOrders(token: string): Promise<OrderDto[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to load admin orders: ${response.status}`);
  }

  return response.json();
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  payload: { status: string; paymentStatus: string }
): Promise<OrderDto> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update order: ${response.status}`);
  }

  return response.json();
}

export async function deleteOrder(token: string, orderId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete order: ${response.status}`);
  }
}
