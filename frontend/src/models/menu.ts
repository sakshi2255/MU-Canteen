export type MenuCategory = 
  | 'all'
  | 'snacks'
  | 'beverages'
  | 'meals'
  | 'bakery'
  | 'south_indian'
  | 'stationery';

export interface MenuItem {
  itemId: string;
  canteenId: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number; // in INR
  imageUrl?: string;
  isAvailable: boolean; // Operator controlled: Available vs Sold Out
  isActive: boolean;    // Operator/Admin: Soft delete or active
  isVeg: boolean;
  preparationTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

