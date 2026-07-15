/**
 * Shared brand registry — single source of truth for brand names, logos, and categories.
 * Used by: BrandsClient (brand cards), Brands (homepage grid), VehicleForm (admin dropdown).
 */

export type BrandCategory = "chinese" | "foreign" | "trucks";

export interface BrandMeta {
  name: string;
  logoFile: string;
  category: BrandCategory;
}

export const BRAND_LIST: BrandMeta[] = [
  // Chinese brands
  { name: "BYD", logoFile: "byd-logo.png", category: "chinese" },
  { name: "Geely", logoFile: "geely-logo.png", category: "chinese" },
  { name: "Changan", logoFile: "changan-logo.png", category: "chinese" },
  { name: "NIO", logoFile: "nio-logo.png", category: "chinese" },
  { name: "XPeng", logoFile: "xpeng-logo.png", category: "chinese" },
  { name: "Li Auto", logoFile: "lixiang-logo.png", category: "chinese" },
  { name: "Great Wall", logoFile: "great-wall-logo.png", category: "chinese" },
  { name: "Chery", logoFile: "chery-logo.png", category: "chinese" },
  { name: "MG", logoFile: "mg-logo.png", category: "chinese" },
  { name: "Hongqi", logoFile: "hongqi-logo.png", category: "chinese" },
  { name: "Zeekr", logoFile: "zeekr-logo.png", category: "chinese" },
  { name: "Lynk & Co", logoFile: "lynkco-logo.png", category: "chinese" },
  // Foreign brands popular in China
  { name: "Toyota", logoFile: "toyota-logo.png", category: "foreign" },
  { name: "Honda", logoFile: "honda-logo.png", category: "foreign" },
  { name: "BMW", logoFile: "bmw-logo.png", category: "foreign" },
  { name: "Mercedes-Benz", logoFile: "mercedes-benz-logo.png", category: "foreign" },
  { name: "Audi", logoFile: "audi-logo.png", category: "foreign" },
  { name: "Volkswagen", logoFile: "volkswagen-logo.png", category: "foreign" },
  { name: "Tesla", logoFile: "tesla-logo.png", category: "foreign" },
  { name: "Hyundai", logoFile: "hyundai-logo.png", category: "foreign" },
  { name: "Kia", logoFile: "kia-logo.png", category: "foreign" },
  { name: "Nissan", logoFile: "nissan-logo.png", category: "foreign" },
  { name: "Ford", logoFile: "ford-logo.png", category: "foreign" },
  { name: "Volvo", logoFile: "volvo-logo.png", category: "foreign" },
  { name: "Buick", logoFile: "buick-logo.png", category: "foreign" },
  { name: "Cadillac", logoFile: "cadillac-logo.png", category: "foreign" },
  { name: "Lexus", logoFile: "lexus-logo.png", category: "foreign" },
  { name: "Chevrolet", logoFile: "chevrolet-logo.png", category: "foreign" },
  { name: "Mazda", logoFile: "mazda-logo.png", category: "foreign" },
  { name: "Mitsubishi", logoFile: "mitsubishi-logo.png", category: "foreign" },
  // Truck brands
  { name: "Sinotruk", logoFile: "sinotruk-logo.png", category: "trucks" },
  { name: "FAW", logoFile: "faw-logo.png", category: "trucks" },
  { name: "Dongfeng", logoFile: "dongfeng-logo.png", category: "trucks" },
  { name: "Foton", logoFile: "foton-logo.png", category: "trucks" },
  { name: "JAC", logoFile: "jac-logo.png", category: "trucks" },
  { name: "Isuzu", logoFile: "isuzu-logo.png", category: "trucks" },
];

export const BRAND_NAMES = BRAND_LIST.map((b) => b.name);

export const BRAND_LOGO_MAP: Record<string, string> = Object.fromEntries(
  BRAND_LIST.map((b) => [b.name, b.logoFile]),
);

export const CHINESE_BRANDS = new Set(
  BRAND_LIST.filter((b) => b.category === "chinese").map((b) => b.name),
);

export const TRUCK_BRANDS = new Set(
  BRAND_LIST.filter((b) => b.category === "trucks").map((b) => b.name),
);

export function getBrandLogo(brandName: string): string | null {
  const key = Object.keys(BRAND_LOGO_MAP).find(
    (k) => k.toLowerCase() === brandName.toLowerCase(),
  );
  return key ? `/brands/${BRAND_LOGO_MAP[key]}` : null;
}

export function getBrandCategory(brandName: string): BrandCategory {
  if (CHINESE_BRANDS.has(brandName)) return "chinese";
  if (TRUCK_BRANDS.has(brandName)) return "trucks";
  return "foreign";
}
