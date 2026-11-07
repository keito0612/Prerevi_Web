import { AuthService } from "@/service/authServise";
import { ApiResponse } from "@/types";

export const fetcher = async <T>(url: string): Promise<T> => {
  const token = AuthService.getSesstion();

  if (!token) {
    throw new Error('No token found');
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
};