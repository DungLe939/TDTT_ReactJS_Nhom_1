import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  PlusCircle, Info, UploadCloud,
  ChevronDown, Save, Database,
  AlertCircle, ShieldAlert, Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { AdminQuestsPanel } from '@/modules/quests/components/AdminQuestsPanel/AdminQuestsPanel';

type DishFormData = {
  name: string;
  type: string;
  region: string;
  emoji: string;
  image: string;
  description: string;
  ingredients: string;
  allergens: string;
  calories: string;
};

export const Admin = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DishFormData>();
  const [activeTab, setActiveTab] = useState<'add-dish' | 'add-info' | 'quests'>('add-dish');
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-800">Truy cập bị từ chối</h2>
        <p className="text-neutral-600 max-w-md">
          Xin lỗi, trang này chỉ dành cho tài khoản có quyền Quản trị viên (Admin).
          Vui lòng đăng nhập bằng tài khoản Admin để truy cập.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: DishFormData) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Submitted data:', data);
        toast.success(`Đã thêm món "${data.name}" thành công!`, {
          description: 'Dữ liệu đã được lưu vào hệ thống.',
          icon: <Save className="w-4 h-4" />,
        });
        reset();
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
            <Database className="w-8 h-8 text-indigo-600" />
            Developer Panel
          </h1>
          <p className="text-neutral-600 mt-2">Khu vực dành cho nhà phát triển quản lý dữ liệu AI và Menu.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-200">
        {([
          { key: 'add-dish', label: 'Thêm món ăn mới', icon: <PlusCircle className="w-4 h-4" /> },
          { key: 'add-info', label: 'Thêm thông tin AI', icon: <Info className="w-4 h-4" /> },
          { key: 'quests', label: 'Nhiệm vụ & Phần thưởng', icon: <Trophy className="w-4 h-4" /> },
        ] as { key: typeof activeTab; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`pb-4 px-4 font-medium text-sm transition-colors relative
              ${activeTab === t.key ? 'text-indigo-600' : 'text-neutral-500 hover:text-neutral-700'}`}>
            <span className="flex items-center gap-2">{t.icon} {t.label}</span>
            {activeTab === t.key && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Thêm món ăn ── */}
      {activeTab === 'add-dish' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cột trái */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Tên món ăn *</label>
                  <input
                    {...register('name', { required: 'Vui lòng nhập tên món ăn' })}
                    placeholder="VD: Bún Bò Huế"
                    className={`w-full px-4 py-2 rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-indigo-500 focus:ring-indigo-500'} focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">Loại món</label>
                    <div className="relative">
                      <select {...register('type')}
                        className="w-full px-4 py-2 appearance-none rounded-xl border border-neutral-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all bg-white">
                        <option value="Món nước">Món nước</option>
                        <option value="Món khô">Món khô</option>
                        <option value="Hải sản">Hải sản</option>
                        <option value="Cơm">Cơm</option>
                        <option value="Đồ nướng">Đồ nướng</option>
                        <option value="Tráng miệng">Tráng miệng</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">Xuất xứ *</label>
                    <input {...register('region', { required: 'Vui lòng nhập xuất xứ' })}
                      placeholder="VD: Việt Nam"
                      className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all" />
                    {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">Emoji đại diện</label>
                    <input {...register('emoji')} placeholder="VD: 🍜"
                      className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">Calo (Kcal)</label>
                    <input {...register('calories')} placeholder="VD: 400-500"
                      className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all" />
                  </div>
                </div>
              </div>

              {/* Cột phải */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Link Ảnh (URL)</label>
                  <div className="relative">
                    <input {...register('image')} placeholder="https://images.unsplash.com/..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all" />
                    <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Mô tả ngắn</label>
                  <textarea {...register('description')} rows={4}
                    placeholder="Mô tả hấp dẫn về món ăn..."
                    className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all resize-none" />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-medium text-neutral-800 mb-4">Dữ liệu AI (Phân tích & Cảnh báo)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Thành phần (cách nhau bởi dấu phẩy)</label>
                  <textarea {...register('ingredients')} rows={2}
                    placeholder="VD: Bún, Thịt bò, Chả cua, Sả, Mắm ruốc"
                    className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Thành phần gây dị ứng</label>
                  <textarea {...register('allergens')} rows={2}
                    placeholder="VD: Hải sản, Đậu phộng"
                    className="w-full px-4 py-2 rounded-xl border border-amber-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-20 transition-all resize-none bg-amber-50" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-3 rounded-xl font-medium shadow-md shadow-indigo-200 transition-all flex items-center gap-2">
                {isSubmitting
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save className="w-5 h-5" />}
                Lưu vào CSDL
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ── Tab: Thêm thông tin AI ── */}
      {activeTab === 'add-info' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-2xl shadow-sm border border-neutral-200 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800">Tính năng đang phát triển</h2>
          <p className="text-neutral-500 max-w-md">
            Chức năng thêm prompt và điều chỉnh ngữ cảnh AI cho chatbot đang được hoàn thiện và sẽ sớm ra mắt trong phiên bản tới.
          </p>
        </motion.div>
      )}

      {/* ── Tab: Nhiệm vụ & Phần thưởng ── */}
      {activeTab === 'quests' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AdminQuestsPanel />
        </motion.div>
      )}
    </div>
  );
};