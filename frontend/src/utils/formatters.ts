import { OrderStatus, PaymentStatus, OrderType } from '../models/order';
import { Colors } from '../theme/colors';

export function formatINR(amount: number): string {
  return `₹${Math.round(amount)}`;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ', ' + d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  } catch {
    return isoString;
  }
}

export function formatTime(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

export function getOrderStatusLabel(status: OrderStatus, role: 'student' | 'operator' | 'admin' = 'operator'): string {
  switch (status) {
    case 'awaiting_acceptance':
      return role === 'student' ? 'In Queue' : 'Awaiting Acceptance';
    case 'accepted':
      return 'Preparing';
    case 'preparing':
      return 'Preparing';
    case 'ready_for_pickup':
      return 'Ready for Pickup';
    case 'picked_up':
      return 'Collected';
    case 'rejected':
      return 'Declined';
    case 'cancellation_requested':
      return 'Cancel Requested';
    case 'cancelled':
      return 'Cancelled';
    case 'uncollected':
      return 'Uncollected (Review 2)';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

export function getOrderStatusBadge(status: OrderStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'awaiting_acceptance':
      return { bg: Colors.warningLight, text: Colors.warning, border: Colors.warningBorder };
    case 'accepted':
    case 'preparing':
      return { bg: '#FFF7ED', text: '#EA580C', border: '#FDBA74' };
    case 'ready_for_pickup':
      return { bg: Colors.primaryLight, text: Colors.primary, border: Colors.primaryMuted };
    case 'picked_up':
      return { bg: Colors.successLight, text: Colors.success, border: Colors.successBorder };
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return { bg: Colors.dangerLight, text: Colors.danger, border: Colors.dangerBorder };
    default:
      return { bg: Colors.surfaceSecondary, text: Colors.textSecondary, border: Colors.border };
  }
}

export function getPaymentStatusBadge(status: PaymentStatus): {
  bg: string;
  text: string;
} {
  switch (status) {
    case 'paid':
      return { bg: Colors.successLight, text: Colors.success };
    case 'pending':
      return { bg: Colors.warningLight, text: Colors.warning };
    case 'failed':
      return { bg: Colors.dangerLight, text: Colors.danger };
    case 'refunded':
      return { bg: Colors.infoLight, text: Colors.info };
    default:
      return { bg: Colors.surfaceSecondary, text: Colors.textSecondary };
  }
}
