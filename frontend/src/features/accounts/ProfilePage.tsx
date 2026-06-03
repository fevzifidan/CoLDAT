import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import apiService from '@/shared/services/api/api.service';
import { Button } from "@/components/ui/button";
import notificationService from '@/shared/services/notification/notification.service';
import DeleteAccountModal from './components/DeleteAccountModal';
import {
  User,
  Mail,
  Save,
  Shield,
  UserCheck,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface ProfileForm {
  username: string;
  first_name: string;
  last_name: string;
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation(['accounts', 'common']);
  const { user } = useAuth();

  // MSAL kontrolü
  const isMsalUser = user?.auth_provider === 'msal';

  const [formData, setFormData] = useState<ProfileForm>({
    username: '',
    first_name: '',
    last_name: '',
  });

  const [loading, setLoading] = useState(false);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTokenFromUrl, setDeleteTokenFromUrl] = useState<string | null>(null);

  /* ------------------------------------------------ */
  /* URL'DEN deleteToken OKU                          */
  /* ------------------------------------------------ */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('deleteToken');
    if (tokenFromUrl) {
      setDeleteTokenFromUrl(tokenFromUrl);
      // Modal'ı token ile aç
      setShowDeleteModal(true);
    }
  }, []);

  /* ------------------------------------------------ */
  /* FORM VERILERINI DOLDUR                           */
  /* ------------------------------------------------ */

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ------------------------------------------------ */
  /* PROFILE UPDATE                                    */
  /* ------------------------------------------------ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload: Partial<ProfileForm> = {
        username: formData.username,
      };

      // MSAL user sadece username update edebilir
      if (!isMsalUser) {
        payload.first_name = formData.first_name;
        payload.last_name = formData.last_name;
      }

      const response = await notificationService.promise(
        apiService.patch('account/me/', payload),
        {
          loading: t('accounts:profile.notifications.updateLoading'),
          success: t('accounts:profile.notifications.updateSuccess'),
          error: (error: any) =>
            error?.response?.data?.message ||
            t('accounts:profile.notifications.updateError'),
        }
      );

      const responseData = response.data || response;

      // local user update
      if (user) {
        user.username =
          responseData.username || formData.username;

        if (!isMsalUser) {
          user.first_name =
            responseData.first_name ||
            formData.first_name;

          user.last_name =
            responseData.last_name ||
            formData.last_name;
        }
      }
    } catch (error: any) {
      console.error(
        'Profile update error:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------ */
  /* DELETE MODAL HANDLERS                             */
  /* ------------------------------------------------ */

  const handleOpenDeleteModal = () => {
    setDeleteTokenFromUrl(null); // Reset URL token - manual flow
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    // Clean up URL params if deleteToken was present
    if (deleteTokenFromUrl) {
      const url = new URL(window.location.href);
      url.searchParams.delete('deleteToken');
      window.history.replaceState({}, '', url.toString());
      setDeleteTokenFromUrl(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
          <User
            className="text-indigo-600"
            size={24}
          />
          {t('accounts:profile.title')}
        </h2>

        <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">
          {t('accounts:profile.description')}
        </p>
      </div>

      {/* PROFILE FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <UserCheck
                size={18}
                className="text-slate-400"
              />
              {t('accounts:profile.personalInfo.title')}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {t('accounts:profile.personalInfo.description')}
            </p>
          </div>

          <div className="p-6 space-y-4">

            {/* FIRST NAME / LAST NAME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">
                  {t('accounts:profile.fields.firstName')}
                </label>

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isMsalUser}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder={t('accounts:profile.fields.firstNamePlaceholder')}
                  required={!isMsalUser}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">
                  {t('accounts:profile.fields.lastName')}
                </label>

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isMsalUser}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder={t('accounts:profile.fields.lastNamePlaceholder')}
                  required={!isMsalUser}
                />
              </div>
            </div>

            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                {t('accounts:profile.fields.username')}
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full h-10 pl-9 pr-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder={t('accounts:profile.fields.usernamePlaceholder')}
                  required
                />

                <User
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                {t('accounts:profile.fields.email')}
              </label>

              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full h-10 pl-9 pr-10 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none"
                />

                <Mail
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />

                <Shield
                  size={16}
                  className="absolute right-3 top-3 text-slate-300 dark:text-slate-700"
                />
              </div>

              {isMsalUser && (
                <p className="text-[11px] text-amber-500 font-medium mt-1">
                  {t('accounts:profile.fields.msalWarning')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Save size={16} />

            {loading
              ? t('accounts:profile.buttons.saving')
              : t('accounts:profile.buttons.save')}
          </Button>
        </div>
      </form>

      {/* DANGER ZONE */}
      <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/50 rounded-3xl p-6 space-y-4">

        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-950 rounded-xl text-red-600 dark:text-red-400 mt-0.5">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="text-base font-black text-red-800 dark:text-red-400 uppercase tracking-tight">
              {t('accounts:profile.dangerZone.title')}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {t('accounts:profile.dangerZone.description')}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-red-200/50 dark:border-red-900/20">
          <Button
            type="button"
            onClick={handleOpenDeleteModal}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm cursor-pointer"
          >
            <Trash2 size={14} />
            {t('accounts:profile.dangerZone.deleteButton')}
          </Button>
        </div>
      </div>

      {/* DELETE ACCOUNT MODAL */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        initialToken={deleteTokenFromUrl}
      />

    </div>
  );
};

export default ProfilePage;