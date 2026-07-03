const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080/api";

export interface AdminCustomerDto {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  tier: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string | null;
}

export async function fetchAdminCustomers(token: string, search = ""): Promise<AdminCustomerDto[]> {
  const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const response = await fetch(`${API_BASE_URL}/admin/customers${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to load customers: ${response.status}`);
  }

  return response.json();
}

export async function deleteAdminCustomer(token: string, customerId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/customers/${customerId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete customer: ${response.status}`);
  }
}
