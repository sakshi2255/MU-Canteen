export type UserRole = 'student' | 'faculty' | 'operator' | 'admin';

export type AccountStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  semester?: number;
  rollNumber?: string;
  accountStatus: AccountStatus;
  assignedCanteenIds?: string[]; // for canteen operators
  createdAt: string;
  updatedAt: string;
}

