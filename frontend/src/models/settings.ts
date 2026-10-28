export interface PickupSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CanteenSettings {
  canteenId: string;
  acceptanceMode: 'manual' | 'auto';
  acceptanceTimeoutMinutes: number;
  defaultGracePeriodMinutes: number;
  pickupSlotIntervalMinutes: number;
  updatedAt: string;
}

export interface CampusSettings {
  campusName: string;
  allowPreorders: boolean;
  preorderGracePeriodMinutes: number;
  preorderPolicyVersion: string;
  preorderPolicyText: string;
  review2Notice: string;
  updatedAt: string;
}

