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
    <div className="max-w-2xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Tài khoản của tôi</h1>

        {/* Avatar & Basic Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-4">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative group">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center ring-4 ring-orange-100">
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
                    className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  <h2 className="text-xl font-bold text-neutral-900 truncate">
                    {user.name}
                  </h2>
                  <Save className="w-4 h-4 text-neutral-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                </button>
              )}
              <p className="text-neutral-500 text-sm mt-1 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Thông tin tài khoản
            </h3>
          </div>

          <div className="divide-y divide-neutral-100">
            {/* Email */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="text-neutral-900">{user.email}</p>
                </div>
              </div>
              {firebaseUser.emailVerified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Đã xác thực
                </span>
              )}
            </div>

            {/* Provider */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-500">Phương thức đăng nhập</p>
                  <p className="text-neutral-900">{getProvider()}</p>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-500">Ngày tạo tài khoản</p>
                  <p className="text-neutral-900">{createdAt}</p>
                </div>
              </div>
            </div>

            {/* Last Sign In */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-500">Đăng nhập lần cuối</p>
                  <p className="text-neutral-900">{lastSignIn}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        {isPasswordProvider && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-500" />
                Bảo mật
              </h3>
            </div>

            <div>
              <button
                onClick={handleResetPassword}
                disabled={isResettingPassword}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-neutral-400" />
                  <div className="text-left">
                    <p className="text-neutral-900">Đổi mật khẩu</p>
                    <p className="text-sm text-neutral-500">Gửi email đặt lại mật khẩu</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
