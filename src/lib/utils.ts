import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMongoObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
