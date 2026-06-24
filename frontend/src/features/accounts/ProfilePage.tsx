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
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
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

    // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Password criteria
  const passwordCriteria = {
    length: passwordForm.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordForm.newPassword),
    number: /[0-9]/.test(passwordForm.newPassword),
    match: passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword.length > 0,
  };
  const isPasswordValid = passwordCriteria.length && passwordCriteria.uppercase && passwordCriteria.number && passwordCriteria.match;

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
  /* PASSWORD CHANGE HANDLERS                         */
  /* ------------------------------------------------ */

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = async () => {
    if (!isPasswordValid || !passwordForm.currentPassword) return;

    setChangingPassword(true);
    try {
      const payload = {
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      };

      await notificationService.promise(
        apiService.patch('account/change-password/', payload),
        {
          loading: t('accounts:profile.passwordChange.buttons.changing'),
          success: t('accounts:profile.passwordChange.notifications.success'),
          error: (error: any) =>
            error?.response?.data?.message ||
            t('accounts:profile.passwordChange.notifications.error'),
        }
      );

      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Password change error:', error);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
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

            {/* PASSWORD CHANGE SECTION */}
      {!isMsalUser && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Lock size={18} className="text-slate-400" />
              {t('accounts:profile.passwordChange.title')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('accounts:profile.passwordChange.description')}
            </p>
          </div>

          <div className="p-6">
            {!showPasswordForm ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Lock size={14} />
                  {t('accounts:profile.passwordChange.changeButton')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* CURRENT PASSWORD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    {t('accounts:profile.passwordChange.fields.currentPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full h-10 pl-9 pr-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder={t('accounts:profile.passwordChange.fields.currentPasswordPlaceholder')}
                    />
                    <Lock size={14} className="absolute left-3 top-3.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    {t('accounts:profile.passwordChange.fields.newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full h-10 pl-9 pr-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder={t('accounts:profile.passwordChange.fields.newPasswordPlaceholder')}
                    />
                    <Lock size={14} className="absolute left-3 top-3.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM NEW PASSWORD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    {t('accounts:profile.passwordChange.fields.confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full h-10 pl-9 pr-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder={t('accounts:profile.passwordChange.fields.confirmPasswordPlaceholder')}
                    />
                    <Lock size={14} className="absolute left-3 top-3.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* PASSWORD CRITERIA */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordCriteria.length ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className={passwordCriteria.length ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                      {t('accounts:profile.passwordChange.criteria.length')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordCriteria.uppercase ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className={passwordCriteria.uppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                      {t('accounts:profile.passwordChange.criteria.uppercase')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordCriteria.number ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className={passwordCriteria.number ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                      {t('accounts:profile.passwordChange.criteria.number')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordCriteria.match ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className={passwordCriteria.match ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                      {t('accounts:profile.passwordChange.criteria.match')}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelPasswordChange}
                    disabled={changingPassword}
                    className="h-9 px-4 text-xs font-bold rounded-xl"
                  >
                    {t('accounts:profile.passwordChange.cancelButton')}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={changingPassword || !isPasswordValid || !passwordForm.currentPassword}
                    className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {changingPassword ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Save size={14} />
                    )}
                    {changingPassword
                      ? t('accounts:profile.passwordChange.buttons.changing')
                      : t('accounts:profile.passwordChange.buttons.change')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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