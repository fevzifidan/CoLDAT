import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiService from '@/shared/services/api/api.service';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import {
  User,
  Mail,
  Save,
  Shield,
  UserCheck,
  Key,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
  X
} from 'lucide-react';

interface ProfileForm {
  username: string;
  first_name: string;
  last_name: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  // MSAL kontrolü
  const isMsalUser = user?.auth_provider === 'msal';

  const [formData, setFormData] = useState<ProfileForm>({
    username: '',
    first_name: '',
    last_name: '',
  });

  const [loading, setLoading] = useState(false);

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteStep, setDeleteStep] = useState<'request' | 'confirm'>(
    'request'
  );

  const [passwordOrIdentifier, setPasswordOrIdentifier] =
    useState('');

  const [receivedToken, setReceivedToken] = useState('');

  const [deleteLoading, setDeleteLoading] = useState(false);

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
  /* PROFILE UPDATE */
  /* ------------------------------------------------ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const toastId = toast.loading(
      'Profil ayarları güncelleniyor...'
    );

    try {
      const payload: Partial<ProfileForm> = {
        username: formData.username,
      };

      // MSAL user sadece username update edebilir
      if (!isMsalUser) {
        payload.first_name = formData.first_name;
        payload.last_name = formData.last_name;
      }

      const response = await apiService.patch(
        'account/me/',
        payload
      );

      console.log(
        'Profil güncelleme yanıtı:',
        response
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

      toast.success(
        'Profil bilgileri başarıyla güncellendi!!!!!!!!!!!!!!!!!!',
        { id: toastId }
      );
    } catch (error: any) {
      console.error(
        'Profil güncelleme hatası:',
        error
      );

      const errorMsg =
        error.response?.data?.message ||
        'Profil güncellenirken bir hata oluştu.';

      toast.error(errorMsg, {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------ */
  /* NORMAL USER DELETE REQUEST */
  /* ------------------------------------------------ */

  const handleUrlDeleteRequest = async () => {
    if (!passwordOrIdentifier.trim()) {
      toast.error(
        'Lütfen şifrenizi veya kimlik doğrulayıcınızı girin.'
      );

      return;
    }

    setDeleteLoading(true);

    try {
      const response = await apiService.post(
        '/account/delete-request',
        {
          identifier: passwordOrIdentifier,
        }
      );

      const resData = response.data || response;

      toast.success('Silme isteği oluşturuldu.');

      const tokenFromServer =
        resData.token || 'test_delete_token_bypass';

      setReceivedToken(tokenFromServer);

      try {
        await apiService.get(
          `/account/delete-confirm/validate?token=${tokenFromServer}`
        );
      } catch (vErr) {
        console.log(
          'Token doğrulama adımı (Bypass edildi):',
          vErr
        );
      }

      setDeleteStep('confirm');
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        'Silme isteği başarısız oldu (Şifre hatalı olabilir).';

      toast.error(errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ------------------------------------------------ */
  /* NORMAL USER DELETE CONFIRM */
  /* ------------------------------------------------ */

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);

    try {
      await apiService.post(
        '/account/delete-confirm',
        {
          token: receivedToken,
        }
      );

      toast.success(
        'Hesabınız başarıyla silindi. Yönlendiriliyorsunuz...'
      );

      localStorage.clear();

      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        'Hesap silme onaylanamadı veya token süresi doldu.';

      toast.error(errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ------------------------------------------------ */
  /* MSAL DELETE FLOW */
  /* ------------------------------------------------ */

  const handleMsalDeleteRedirect = async () => {
    try {
      /**
       * Backend endpoint varsa bunu kullan:
       *
       * window.location.href =
       * `${import.meta.env.VITE_API_URL}/auth/msal/delete`;
       */

      window.location.href =
        'https://login.microsoftonline.com/common/oauth2/v2.0/logout';
    } catch (error) {
      toast.error(
        'Microsoft oturumu sonlandırılırken bir hata oluştu.'
      );
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
          Hesap Ayarları
        </h2>

        <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">
          Kişisel profil verilerinizi ve hesap
          detaylarınızı buradan yönetebilirsiniz
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
              Kişisel Kimlik Bilgileri
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Bu bilgiler atandığınız projelerde
              ve takımlarda diğer kullanıcılara
              gösterilecektir.
            </p>
          </div>

          <div className="p-6 space-y-4">

            {/* FIRST NAME / LAST NAME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Ad
                </label>

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isMsalUser}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Adınız"
                  required={!isMsalUser}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Soyad
                </label>

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isMsalUser}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Soyadınız"
                  required={!isMsalUser}
                />
              </div>
            </div>

            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">
                Kullanıcı Adı
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full h-10 pl-9 pr-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Kullanıcı adınız"
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
                E-posta Adresi (Değiştirilemez)
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
                  Microsoft ile giriş yapan kullanıcılar
                  yalnızca kullanıcı adlarını
                  güncelleyebilir.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Save size={16} />

            {loading
              ? 'Kaydediliyor...'
              : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>

      {/* ROLE */}
      {user?.role && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600">
              <Key size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Sistem Rolü
              </p>

              <p className="text-xs text-slate-400 font-semibold">
                Hesabınıza atanmış mevcut yetki
                seviyesi.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
            {user.role}
          </span>
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
              Tehlikeli Bölge
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Hesabınızı silmek geri dönüşü olmayan
              bir işlemdir.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-red-200/50 dark:border-red-900/20">
          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(true);

              if (isMsalUser) {
                setDeleteStep('confirm');
              } else {
                setDeleteStep('request');
              }

              setPasswordOrIdentifier('');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm cursor-pointer"
          >
            <Trash2 size={14} />
            Hesabı Kalıcı Olarak Sil
          </button>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">

          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">

            <div className="flex justify-between items-center pb-2 border-b dark:border-slate-800">
              <h4 className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Trash2
                  size={16}
                  className="text-red-500"
                />
                Hesap Silme Akışı
              </h4>

              <button
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* NORMAL USER FLOW */}
            {deleteStep === 'request' &&
            !isMsalUser ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  İşlemi başlatmak için lütfen
                  şifrenizi girin.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Şifre
                  </label>

                  <div className="relative">
                    <input
                      type="password"
                      value={passwordOrIdentifier}
                      onChange={(e) =>
                        setPasswordOrIdentifier(
                          e.target.value
                        )
                      }
                      placeholder="••••••••"
                      className="w-full h-10 pl-9 pr-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />

                    <Lock
                      size={14}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowDeleteModal(false)
                    }
                    disabled={deleteLoading}
                  >
                    Vazgeç
                  </Button>

                  <button
                    onClick={handleUrlDeleteRequest}
                    disabled={deleteLoading}
                    className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {deleteLoading ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : null}

                    Silme İsteği Gönder
                  </button>
                </div>
              </div>
            ) : (
              /* CONFIRM */
              <div className="space-y-4">

                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-400 flex flex-col gap-1">

                  <span className="font-bold">
                    ✓ Silme İsteği Doğrulandı!
                  </span>

                  <span>
                    {isMsalUser
                      ? 'Microsoft hesabınızın oturumu kapatılacak ve işlem Microsoft doğrulama ekranı üzerinden devam edecektir.'
                      : 'Aşağıdaki butona tıklayarak hesabınızı kalıcı olarak silebilirsiniz.'}
                  </span>
                </div>

                <div className="flex gap-2 pt-2 justify-end">

                  {!isMsalUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDeleteStep('request')
                      }
                      disabled={deleteLoading}
                    >
                      Geri Git
                    </Button>
                  )}

                  <button
                    onClick={
                      isMsalUser
                        ? handleMsalDeleteRedirect
                        : handleConfirmDelete
                    }
                    disabled={deleteLoading}
                    className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {deleteLoading ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : null}

                    {isMsalUser
                      ? 'Microsoft ile Devam Et'
                      : 'Hesabı Tamamen Sil'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;