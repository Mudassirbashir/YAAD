import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Edit2, LogOut, LogIn, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Avatar } from './Avatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onDeleteAccount?: () => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onDeleteAccount,
}) => {
  const { t } = useLanguage();
  const { user, profile, isConfigured, signOut, deleteAccount, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setEditName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setEditName(user.user_metadata.full_name);
    } else {
      setEditName('');
    }
  }, [profile, user, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setStatusMsg(null);

    const { error } = await updateUserProfile({
      full_name: editName.trim() || undefined,
    });

    setIsSaving(false);

    if (error) {
      setStatusMsg({ type: 'error', text: error.message || 'Unable to update profile. Try again.' });
    } else {
      setStatusMsg({ type: 'success', text: 'Profile updated successfully.' });
      setIsEditing(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || (user ? 'Account User' : 'Guest');
  const displayEmail = profile?.email || user?.email || (user ? 'No email' : 'Not signed in');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-surface-dim space-y-4 text-center animate-in zoom-in-95 duration-200 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container-low transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="pt-2 flex justify-center">
          <Avatar
            name={displayName}
            email={user?.email}
            avatarUrl={profile?.avatar_url}
            size="xl"
            className="shadow-md ring-4 ring-primary-fixed/30"
          />
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`p-2.5 rounded-2xl text-xs font-['Manrope'] flex items-center justify-center gap-1.5 ${
              statusMsg.type === 'success'
                ? 'bg-secondary-fixed/40 text-primary font-bold'
                : 'bg-error-container/30 text-error'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Profile Info / Edit Form */}
        {user ? (
          isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-left">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-11 bg-surface-container-lowest text-on-surface text-sm rounded-2xl px-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-10 rounded-full bg-primary text-on-primary font-['Manrope'] text-xs font-bold shadow-sm hover:bg-primary-container disabled:opacity-60 transition-all flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setStatusMsg(null);
                  }}
                  className="px-4 h-10 rounded-full bg-surface-container text-on-surface font-['Manrope'] text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-xl">
                  {displayName}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit Name"
                  className="w-6 h-6 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="font-['Manrope'] text-xs text-on-surface-variant mt-0.5">
                {displayEmail}
              </p>
            </div>
          )
        ) : (
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-xl">
              Guest User
            </h3>
            <p className="font-['Manrope'] text-xs text-on-surface-variant mt-0.5">
              Sign in to sync your shopping lists across devices.
            </p>
          </div>
        )}

        {/* Persistence Status */}
        <div className="py-2.5 px-4 bg-surface-container-low rounded-2xl border border-surface-dim text-xs font-['Manrope'] text-on-surface-variant flex items-center justify-around">
          <div>
            <span className="font-bold text-primary block text-sm">
              {user ? 'Cloud' : 'Local'}
            </span>
            <span className="text-[11px]">Storage</span>
          </div>
          <div className="h-6 w-px bg-outline-variant" />
          <div>
            <span className="font-bold text-primary block text-sm">
              {isConfigured ? 'Active' : 'Offline'}
            </span>
            <span className="text-[11px]">Sync Status</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="w-full h-11 rounded-full bg-surface-container text-error font-['Manrope'] text-xs font-bold hover:bg-error-container/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('settings.signOut')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth('signin');
              }}
              className="w-full h-11 rounded-full bg-primary text-on-primary font-['Manrope'] text-xs font-bold shadow-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full h-10 rounded-full text-on-surface-variant font-['Manrope'] text-xs font-semibold hover:bg-surface-container-low transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

