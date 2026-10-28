export interface AuditLog {
  logId: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: 'canteen' | 'menu_item' | 'order' | 'user' | 'settings';
  entityId: string;
  timestamp: string;
  details: Record<string, any>;
}

