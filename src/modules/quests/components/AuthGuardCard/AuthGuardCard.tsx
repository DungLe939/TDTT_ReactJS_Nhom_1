import { Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router';

interface AuthGuardCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const AuthGuardCard = ({ 
  title = "Đăng nhập để xem nội dung", 
  description = "Tham gia cộng đồng để khám phá nhiệm vụ, nhận phần quà hấp dẫn và chia sẻ trải nghiệm ẩm thực của bạn!",
  icon = <Lock className="w-10 h-10 text-orange-500" />
}: AuthGuardCardProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-10 border border-neutral-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:bg-orange-100 transition-colors duration-700" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:bg-orange-100 transition-colors duration-700" />
      
      <div className="relative z-10">
        <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner relative group-hover:scale-110 transition-transform duration-500">
           {icon}
           <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-orange-400 animate-pulse" />
        </div>

        <h3 className="text-xl font-black text-neutral-800 mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-[320px] mx-auto mb-8 font-medium">
          {description}
        </p>

        <button 
          onClick={() => navigate('/auth')}
          className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-neutral-200 active:scale-95 group/btn"
        >
          <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          ĐĂNG NHẬP NGAY
        </button>
      </div>
    </div>
  );
};

export default AuthGuardCard;
