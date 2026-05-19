import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Shield,
  Camera,
  Save,
  KeyRound,
  LogOut,
  ChevronRight,
  Check,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function Profile() {
  const { user, firebaseUser, updateUserProfile, sendPasswordReset, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Redirect nếu chưa đăng nhập
  if (!user || !firebaseUser) {
    navigate('/auth');
    return null;
  }

  // Lấy provider đăng nhập
  const getProvider = (): string => {
    const providerData = firebaseUser.providerData;
    if (providerData.length === 0) return 'Email';
    const providerId = providerData[0]?.providerId;
    switch (providerId) {
      case 'google.com':
        return 'Google';
      case 'github.com':
        return 'GitHub';
      case 'password':
        return 'Email/Password';
      default:
        return providerId || 'Không xác định';
    }
  };

  // Kiểm tra có phải đăng nhập bằng Email/Password không
  const isPasswordProvider = firebaseUser.providerData.some(
    (p) => p.providerId === 'password'
  );

  // Cập nhật tên hiển thị
  const handleUpdateName = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Tên không được để trống.');
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile(newName.trim());
      setIsEditingName(false);
      toast.success('Cập nhật tên thành công!');
    } catch {
      toast.error('Không thể cập nhật tên. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Gửi email reset mật khẩu
  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    try {
      await sendPasswordReset(user.email);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch {
      toast.error('Không thể gửi email. Vui lòng thử lại.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đăng xuất thành công!');
      navigate('/');
    } catch {
      toast.error('Đăng xuất thất bại.');
    }
  };

  // Ngày tạo tài khoản
  const createdAt = firebaseUser.metadata.creationTime
    ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : 'Không rõ';

  // Lần đăng nhập cuối
  const lastSignIn = firebaseUser.metadata.lastSignInTime
    ? new Date(firebaseUser.metadata.lastSignInTime).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'Không rõ';

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 relative">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-orange-500/10 dark:bg-orange-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-8 tracking-tight">
          Tài khoản của tôi
        </h1>

        {/* Avatar & Basic Info Card */}
        <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl rounded-3xl shadow-sm border border-neutral-200 dark:border-white/10 p-8 mb-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors duration-500" />
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative group">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-100 dark:ring-orange-500/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center ring-4 ring-orange-100 dark:ring-orange-500/20">
                  <span className="text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Name & Email */}
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <form onSubmit={handleUpdateName} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-neutral-300 dark:border-white/20 rounded-lg text-lg font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="p-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setNewName(user.name);
                    setIsEditingName(true);
                  }}
                  className="group/name flex items-center gap-2"
                >
                  <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white truncate tracking-tight">
                    {user.name}
                  </h2>
                  <Save className="w-4 h-4 text-neutral-400 dark:text-gray-500 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                </button>
              )}
              <p className="text-neutral-500 dark:text-gray-400 text-sm mt-1 truncate font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl rounded-3xl shadow-sm border border-neutral-200 dark:border-white/10 overflow-hidden mb-6">
          <div className="px-8 py-5 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5">
            <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
              <User className="w-4 h-4 text-orange-500" />
              Thông tin cá nhân
            </h3>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-white/5">
            {/* Email */}
            <div className="flex items-center justify-between px-8 py-5 group/item transition-colors hover:bg-neutral-50/50 dark:hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-neutral-900 dark:text-white font-semibold">{user.email}</p>
                </div>
              </div>
              {firebaseUser.emailVerified && (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-black flex items-center gap-1 uppercase tracking-tight">
                  <Check className="w-3 h-3" />
                  Đã xác thực
                </span>
              )}
            </div>

            {/* Provider */}
            <div className="flex items-center justify-between px-8 py-5 group/item transition-colors hover:bg-neutral-50/50 dark:hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-500 dark:text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-wider">Phương thức đăng nhập</p>
                  <p className="text-neutral-900 dark:text-white font-semibold">{getProvider()}</p>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center justify-between px-8 py-5 group/item transition-colors hover:bg-neutral-50/50 dark:hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500 dark:text-orange-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-wider">Ngày tạo tài khoản</p>
                  <p className="text-neutral-900 dark:text-white font-semibold">{createdAt}</p>
                </div>
              </div>
            </div>

            {/* Last Sign In */}
            <div className="flex items-center justify-between px-8 py-5 group/item transition-colors hover:bg-neutral-50/50 dark:hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-wider">Đăng nhập lần cuối</p>
                  <p className="text-neutral-900 dark:text-white font-semibold">{lastSignIn}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        {isPasswordProvider && (
          <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl rounded-3xl shadow-sm border border-neutral-200 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-8 py-5 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-orange-500" />
                Bảo mật
              </h3>
            </div>

            <div>
              <button
                onClick={handleResetPassword}
                disabled={isResettingPassword}
                className="w-full flex items-center justify-between px-8 py-5 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-neutral-900 dark:text-white font-semibold">Đổi mật khẩu</p>
                    <p className="text-sm text-neutral-500 dark:text-gray-400 font-medium">Gửi email đặt lại mật khẩu</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl rounded-3xl shadow-sm border border-neutral-200 dark:border-white/10 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-8 py-5 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-red-600 dark:text-red-400"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-bold">Đăng xuất tài khoản</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
