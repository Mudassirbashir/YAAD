import React, { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminToastProvider } from './components/AdminToasts';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminSetupBootstrapPage } from './pages/AdminSetupBootstrapPage';
import { AdminSetup2FAPage } from './pages/AdminSetup2FAPage';
import { AdminForgotPasswordPage } from './pages/AdminForgotPasswordPage';
import { AdminResetPasswordPage } from './pages/AdminResetPasswordPage';
import { AdminAcceptInvitePage } from './pages/AdminAcceptInvitePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminTeamPage } from './pages/AdminTeamPage';
import { AdminAuditLogPage } from './pages/AdminAuditLogPage';
import { AdminNotFoundPage } from './pages/AdminNotFoundPage';
import { AdminLayout } from './components/AdminLayout';
import { Loader2 } from 'lucide-react';

function AdminRouter() {
  const { admin, token, isLoading } = useAdminAuth();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/admin';
  });

  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    return new URLSearchParams(window.location.search);
  });

  const [temp2faToken, setTemp2faToken] = useState<string | null>(null);

  // Guarantee strict noindex/nofollow meta tag in document head on all admin routes
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');
  }, []);

  // Sync route on popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (pathWithSearch: string) => {
    const [pathPart, searchPart] = pathWithSearch.split('?');
    window.history.pushState({}, '', pathWithSearch);
    setCurrentPath(pathPart);
    setSearchParams(new URLSearchParams(searchPart || ''));
  };

  // 1. One-time First Super Admin Bootstrap Flow (/admin/setup)
  if (currentPath === '/admin/setup') {
    return <AdminSetupBootstrapPage onNavigate={navigate} />;
  }

  // 2. Public Registration is strictly disabled -> Return 404
  if (
    currentPath === '/admin/signup' ||
    currentPath === '/admin/register' ||
    currentPath === '/admin/join'
  ) {
    return <AdminNotFoundPage onNavigate={navigate} />;
  }

  // 3. Password Reset Flow (with token)
  if (currentPath === '/admin/reset-password') {
    const resetToken = searchParams.get('token') || '';
    return <AdminResetPasswordPage token={resetToken} onNavigate={navigate} />;
  }

  // 4. Forgot Password Flow
  if (currentPath === '/admin/forgot-password') {
    return <AdminForgotPasswordPage onNavigate={navigate} />;
  }

  // 5. Accept Staff Invitation Flow
  if (currentPath === '/admin/accept-invite') {
    const inviteToken = searchParams.get('token') || '';
    return <AdminAcceptInvitePage token={inviteToken} onNavigate={navigate} />;
  }

  // 6. Setup 2FA Flow (Enforced for new admin)
  if (currentPath === '/admin/setup-2fa') {
    return <AdminSetup2FAPage tempToken={temp2faToken || undefined} onNavigate={navigate} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs font-mono">Verifying Staff Authorization...</span>
      </div>
    );
  }

  // 7. Unauthenticated State: Force to Login
  if (!admin || !token) {
    if (currentPath !== '/admin/login' && currentPath !== '/admin') {
      return <AdminNotFoundPage onNavigate={navigate} />;
    }

    return (
      <AdminLoginPage
        onNavigate={navigate}
        onRequires2faSetup={(tempTok) => {
          setTemp2faToken(tempTok);
          navigate('/admin/setup-2fa');
        }}
      />
    );
  }

  // 8. Authenticated Staff Workspace Routes
  if (currentPath === '/admin/login') {
    // Already authenticated, forward to dashboard
    navigate('/admin');
    return null;
  }

  if (currentPath === '/admin/team') {
    return (
      <AdminLayout activePath="/admin/team" onNavigate={navigate}>
        <AdminTeamPage />
      </AdminLayout>
    );
  }

  if (currentPath === '/admin/audit-log') {
    return (
      <AdminLayout activePath="/admin/audit-log" onNavigate={navigate}>
        <AdminAuditLogPage />
      </AdminLayout>
    );
  }

  if (currentPath === '/admin' || currentPath === '/admin/') {
    return (
      <AdminLayout activePath="/admin" onNavigate={navigate}>
        <AdminDashboardPage onNavigate={navigate} />
      </AdminLayout>
    );
  }

  // Any other unmatched /admin/* route returns 404
  return <AdminNotFoundPage onNavigate={navigate} />;
}

export const AdminApp: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminToastProvider>
        <AdminRouter />
      </AdminToastProvider>
    </AdminAuthProvider>
  );
};
