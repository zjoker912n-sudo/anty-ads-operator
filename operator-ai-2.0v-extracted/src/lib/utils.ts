import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function safeJson(response: Response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    if (!response.ok && data && data.error) {
      throw new Error(data.error);
    }
    // Some endpoints return 200 but explicitly return { error: ... } which is an antipattern, but let's handle it
    if (response.ok && data && data.error) {
      throw new Error(data.error);
    }
    return data;
  }
  const text = await response.text();
  if (text.includes("Rate exceeded")) {
    throw new Error("Rate limit exceeded. Please wait a moment and try again.");
  }
  throw new Error(text || "Invalid response from server");
}
