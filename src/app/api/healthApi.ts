const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080/api";

export async function checkApiHealth(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
  });

  return response.ok;
}
