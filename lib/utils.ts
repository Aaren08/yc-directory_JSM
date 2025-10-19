import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNumber(num: number): string {
  let formatted: string;

  if (num >= 1_000_000_000) {
    formatted = (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (num >= 1_000_000) {
    formatted = (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    formatted = (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    formatted = num.toString();
  }

  const label = num > 1 ? "views" : "view";
  return `${formatted} ${label}`;
}
