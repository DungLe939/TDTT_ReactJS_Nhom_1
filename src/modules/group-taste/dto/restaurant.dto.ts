import type { GeoLocation } from '../types';

export interface RestaurantDto {
  id: string;
  name: string;
  tasteVector: number[];
  price: number;
  rating: number;
  location: GeoLocation;
}
