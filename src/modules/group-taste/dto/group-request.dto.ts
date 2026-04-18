import type { UserPreference, Restaurant } from '../types';

export interface GroupRequestDto {
  users: UserPreference[];
  restaurants: Restaurant[];
}
