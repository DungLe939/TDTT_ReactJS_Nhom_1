import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useNavigate } from 'react-router';
import { LoadingModal } from '../common/components/LoadingModal';

import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup';

/* ── Firebase error → Vietnamese message ── */
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email không hợp lệ.';
    case 'auth/user-disabled':
      return 'Tài khoản đã bị vô hiệu hóa.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này.';
    case 'auth/wrong-password':
      return 'Mật khẩu không chính xác.';
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng.';
    case 'auth/weak-password':
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử. Vui lòng thử lại sau.';
    case 'auth/popup-closed-by-user':
      return 'Bạn đã đóng cửa sổ đăng nhập.';
    case 'auth/account-exists-with-different-credential':
      return 'Tài khoản đã tồn tại với phương thức đăng nhập khác.';
    case 'auth/popup-blocked':
      return 'Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.';
    default:
      return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }
};

/* ── Yup Schemas ── */
const signinSchema = yup.object({
  email: yup.string().required('Vui lòng nhập email').email('Email không đúng định dạng'),
  password: yup.string().required('Vui lòng nhập mật khẩu').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
const signupSchema = yup.object({
  name: yup.string().required('Vui lòng nhập họ và tên').min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: yup.string().required('Vui lòng nhập email').email('Email không đúng định dạng'),
  password: yup.string().required('Vui lòng nhập mật khẩu').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
type SigninData = yup.InferType<typeof signinSchema>;
type SignupData = yup.InferType<typeof signupSchema>;


/* ═══════════════════════════════════════════════════
   Auth — Enhanced auth page with glassmorphism + validation
   ═══════════════════════════════════════════════════ */
export function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginWithGithub, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) { navigate('/'); return null; }

  const {
    register: registerSignin,
    handleSubmit: handleSigninSubmit,
    formState: { errors: signinErrors },
  } = useForm<SigninData>({ resolver: yupResolver(signinSchema), mode: 'onChange' });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<SignupData>({ resolver: yupResolver(signupSchema), mode: 'onChange' });

  const onSignin = async (data: SigninData) => {
    setIsLoading(true);
    try { await loginWithEmail(data.email, data.password); toast.success('Đăng nhập thành công!'); navigate('/'); }
    catch (e) { toast.error(getFirebaseErrorMessage((e as { code?: string }).code || '')); }
    finally { setIsLoading(false); }
  };

  const onSignup = async (data: SignupData) => {
    setIsLoading(true);
    try { await registerWithEmail(data.email, data.password, data.name); toast.success('Đăng ký thành công!'); navigate('/'); }
    catch (e) { toast.error(getFirebaseErrorMessage((e as { code?: string }).code || '')); }
    finally { setIsLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try { await loginWithGoogle(); toast.success('Đăng nhập Google thành công!'); navigate('/'); }
    catch (e) { toast.error(getFirebaseErrorMessage((e as { code?: string }).code || '')); }
    finally { setIsLoading(false); }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try { await loginWithGithub(); toast.success('Đăng nhập GitHub thành công!'); navigate('/'); }
    catch (e) { toast.error(getFirebaseErrorMessage((e as { code?: string }).code || '')); }
    finally { setIsLoading(false); }
  };

  const errors = mode === 'signin' ? signinErrors : signupErrors;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden">
      {/* Load premium Vietnamese cultural & scientific fonts dynamically */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
      `}} />

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        <img src="/assets/auth/background.jpg" alt="Vietnamese street food" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
      </div>



      {/* ── Main Layout Wrapper ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-4rem)] gap-8">

        {/* ── Left Side: Hero Typography (only visible on large screens) ── */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center pr-12 text-left space-y-8 select-none">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl lg:text-8xl font-extrabold text-white leading-tight tracking-normal drop-shadow-xl"
            style={{ fontFamily: "'Playfair Display', 'Lora', serif" }}
          >
            Hương Vị <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-400 via-amber-300 to-yellow-400 italic font-bold drop-shadow-[0_2px_15px_rgba(251,191,36,0.6)]">Bản Địa</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/80 text-base md:text-lg max-w-md font-semibold leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] mt-4 md:mt-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Khám phá ẩm thực địa phương độc đáo, nhận diện món ăn bằng trí tuệ nhân tạo, lên lịch trình ăn uống hoàn hảo và tham gia những thử thách thú vị trong chuyến thám hiểm ẩm thực cùng bạn bè !!!
          </motion.p>
        </div>

        {/* ── Right Side: Form Container ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative">
          
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-md translate-y-4 lg:translate-y-8 relative z-20"
          >
            {/* White Form Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30 transition-all duration-300 w-full relative z-10">
              
              {/* Card Title */}
              <div className="mb-6 select-none text-center">
                <h3 className="text-3xl font-extrabold text-neutral-800 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
                </h3>
              </div>

              {/* Form */}
              <form onSubmit={mode === 'signin' ? handleSigninSubmit(onSignin) : handleSignupSubmit(onSignup)} className="space-y-4">
                <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  {/* Name (signup) */}
                  {mode === 'signup' && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5 select-none">Họ và tên</label>
                      <div className="relative">
                        <input type="text" {...registerSignup('name')} className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition-all duration-300 ${signupErrors.name ? 'border-red-400' : 'border-neutral-200'}`} placeholder="Nguyễn Văn A" />
                      </div>
                      {signupErrors.name && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{signupErrors.name.message}</motion.p>}
                    </div>
                  )}
                  
                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5 select-none">Email</label>
                    <div className="relative">
                      <input type="email" {...(mode === 'signin' ? registerSignin('email') : registerSignup('email'))} className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition-all duration-300 ${errors.email ? 'border-red-400' : 'border-neutral-200'}`} placeholder="example@email.com" />
                    </div>
                    {errors.email && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.email.message}</motion.p>}
                  </div>
                  
                  {/* Password */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5 select-none">Mật khẩu</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} {...(mode === 'signin' ? registerSignin('password') : registerSignup('password'))} className={`w-full pl-4 pr-12 py-2.5 bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition-all duration-300 ${errors.password ? 'border-red-400' : 'border-neutral-200'}`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.password.message}</motion.p>}
                  </div>
                </motion.div>

                {mode === 'signin' && (
                  <div className="text-right -mt-2 mb-4">
                    <button type="button" className="text-xs text-orange-600 hover:text-orange-700 font-bold transition-colors">Quên mật khẩu?</button>
                  </div>
                )}

                <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02, filter: 'brightness(1.05)' }} whileTap={{ scale: 0.98 }} className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md shadow-orange-500/20 text-sm">
                  {mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
                </motion.button>
              </form>

              {/* Bottom Switch Mode Link */}
              <div className="text-center mt-5 text-sm text-neutral-600 select-none font-medium">
                {mode === 'signin' ? (
                  <>
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-orange-600 hover:text-orange-700 font-bold hover:underline transition-colors"
                    >
                      Đăng ký ngay
                    </button>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-orange-600 hover:text-orange-700 font-bold hover:underline transition-colors"
                    >
                      Đăng nhập ngay
                    </button>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center my-5 gap-3">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 select-none whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  hoặc tiếp tục bằng
                </span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              {/* Social Login Buttons Side-by-Side */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button type="button" onClick={handleGoogleLogin} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 text-neutral-700 font-bold shadow-xs transition-all duration-300 text-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  <span className="font-semibold text-neutral-700">Google</span>
                </motion.button>
                
                <motion.button type="button" onClick={handleGithubLogin} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 text-neutral-700 font-bold shadow-xs transition-all duration-300 text-sm">
                  <svg className="w-5 h-5" fill="#24292e" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  <span className="font-semibold text-neutral-700">GitHub</span>
                </motion.button>
              </div>

            </div>

            {/* Terms */}
            <p className="text-center text-sm text-white/95 mt-6 drop-shadow-md font-semibold tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <button className="text-orange-300 hover:text-orange-200 hover:underline font-bold transition-colors">Điều khoản dịch vụ</button>{' '}và{' '}
              <button className="text-orange-300 hover:text-orange-200 hover:underline font-bold transition-colors">Chính sách bảo mật</button>
            </p>
          </motion.div>
        </div>

      </div>

      <LoadingModal isOpen={isLoading} message={mode === 'signin' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...'} submessage="Vui lòng đợi trong giây lát" />
    </div>
  );
}
