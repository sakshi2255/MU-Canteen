import { UserRole } from './user';

export type CanteenType = 'standard' | 'faculty_only' | 'stationery_cafe' | 'hostel_mess';

export interface Building {
  buildingId: string;
  name: string;
  code: string;
  floors: number[];
  isActive: boolean;
}

export interface Canteen {
  canteenId: string;
  name: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  canteenType: CanteenType;
  isOpen: boolean;
  operatorIds: string[];
  acceptanceMode: 'manual' | 'auto';
  acceptanceTimeoutMinutes: number;
  isActive: boolean;
  imageUrl?: string;
  description: string;
  allowedRoles: UserRole[];
  specialEligibilityNotice?: string;
  createdAt: string;
  updatedAt: string;
}

