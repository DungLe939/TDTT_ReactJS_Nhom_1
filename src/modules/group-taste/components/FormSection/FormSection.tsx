import React from 'react';
import { motion } from 'motion/react';
import { UserInputForm } from './UserInputForm';
import { RecommendationButton } from './RecommendationButton';
import type { GroupUser } from '../../hooks/useGroupTaste';
import type { GeoLocation } from '../../types';
import './FormSection.css';

interface FormSectionProps {
  loading: boolean;
  users: GroupUser[];
  setUsers: React.Dispatch<React.SetStateAction<GroupUser[]>>;
  addUser: (user: GroupUser) => void;
  removeUser: (id: string) => void;
  userLocation?: GeoLocation;
  fetchRecommendations: (val?: string, location?: GeoLocation) => void;
}

export const FormSection: React.FC<FormSectionProps> = ({
  loading,
  users,
  setUsers,
  addUser,
  removeUser,
  userLocation,
  fetchRecommendations,
}) => {
  return (
    <section className="form-section-container">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title Centered above Content */}
        <div className="text-center mb-16 pt-12">
          <h2 className="text-4xl font-black text-white drop-shadow-lg uppercase tracking-wider">LẬP KẾ HOẠCH NHÓM</h2>
          <p className="text-white/80 uppercase tracking-[0.2em] text-xs font-bold mt-4">
            Đồng bộ khẩu vị của mọi thành viên
          </p>
          <div className="w-16 h-1.5 bg-orange-500 mx-auto rounded-full mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: User preferences input */}
          <div className="lg:col-span-7">
            <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100"
            >
               <UserInputForm
                 users={users}
                 setUsers={setUsers}
                 addUser={addUser}
                 removeUser={removeUser}
                 defaultLocation={userLocation}
               />
            </motion.div>
          </div>

          {/* Right Column: Actions & Summary */}
          <div className="lg:col-span-5">
            <motion.div 
              className="sticky-actions sticky top-24 space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-6">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Sẵn sàng gợi ý?</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {users.length > 0 
                        ? `Nhóm đã có ${users.length} thành viên. Nhấn nút dưới đây để tìm món ăn phù hợp nhất!`
                        : 'Vui lòng thêm ít nhất một thành viên vào danh sách để chúng tôi bắt đầu gợi ý.'}
                    </p>
                </div>

                <RecommendationButton
                  onClick={() => fetchRecommendations(undefined, userLocation)}
                  loading={loading}
                  disabled={users.length === 0}
                  userCount={users.length}
                />

              </div>
              
              {/* Optional Tip/Info */}
              <div className="px-6 py-4 bg-black/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-relaxed">
                  Tip: Bạn có thể điều chỉnh sở thích riêng của từng thành viên bằng cách nhấn vào nút chỉnh sửa trong danh sách.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
