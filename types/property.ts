export type PropertyType = 'apartment' | 'house' | 'villa' | 'land' | 'commercial';
export type PropertyStatus = 'for-sale' | 'for-rent';

export interface PropertyLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  neighborhood: string;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking?: boolean;
  elevator?: boolean;
  furnished?: boolean;
  security?: boolean;
  garden?: boolean;
  pool?: boolean;
  gym?: boolean;
}

export type Currency = 'USD' | 'IQD';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  type: PropertyType;
  status: PropertyStatus;
  location: PropertyLocation;
  features: PropertyFeatures;
  images: string[];
  ownerName: string;
  ownerPhone: string;
  createdAt: string;
}

export interface PropertyFilters {
  status?: PropertyStatus;
  type?: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  parking?: boolean;
}
