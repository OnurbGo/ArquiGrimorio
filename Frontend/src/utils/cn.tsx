import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

//concatenar classes de forma mais limpa.
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}
