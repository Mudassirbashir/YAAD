export type AdminRole = 'super_admin' | 'support_agent' | 'content_editor' | 'analyst';

export type AdminStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  isTotpEnabled: boolean;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface AdminInvite {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  token: string;
  invitedBy: {
    id: string;
    email: string;
    name: string;
  };
  expiresAt: number;
  status: 'pending' | 'accepted' | 'revoked';
  createdAt: number;
  acceptedAt?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  adminId?: string;
  adminEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  beforeValue?: any;
  afterValue?: any;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AdminSessionInfo {
  lastActivityAt: number;
  expiresAt: number;
}

export interface AdminNotification {
  id: string;
  type: 'security' | 'ticket' | 'request' | 'moderation' | 'system';
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link: string;
  targetId?: string;
}

export const ROLE_LABELS: Record<AdminRole, { title: string; badgeClass: string; description: string }> = {
  super_admin: {
    title: 'Super Admin',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Full system control, staff invitations, role permissions, and audit logs.',
  },
  support_agent: {
    title: 'Support Agent',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: 'User assistance, tickets, and read-only catalog review.',
  },
  content_editor: {
    title: 'Content Editor',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'In-app editorial content, FAQs, banners, and catalog editing.',
  },
  analyst: {
    title: 'Analyst',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'Read-only access to metrics, cohort retention, and reporting.',
  },
};
