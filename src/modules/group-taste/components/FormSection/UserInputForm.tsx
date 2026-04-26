import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, X, ChefHat, Wallet } from 'lucide-react';
import { TASTE_LABELS } from '../../data/mock-data';
import { formatPrice, generateId } from '../../utils/math.utils';
import type { GroupUser } from '../../hooks/useGroupTaste';
import type { GeoLocation } from '../../types';
import { AllergyInput } from './AllergyInput';

interface UserInputFormProps {
  users: GroupUser[];
  setUsers: React.Dispatch<React.SetStateAction<GroupUser[]>>;
  addUser?: (user: GroupUser) => void;
  removeUser?: (id: string) => void;
  defaultLocation?: GeoLocation;
}

const BUDGET_PRESETS = [
  { label: '50K', value: 50000 },
  { label: '100K', value: 100000 },
  { label: '200K', value: 200000 },
  { label: '500K', value: 500000 },
];


/**
 * UserInputForm — Form thêm/xoá thành viên nhóm.
 *
 * Mỗi user gồm:
 * - Tên
 * - Budget (chọn nhanh hoặc kéo slider)
 * - Sở thích (like/dislike từng loại ẩm thực)
 * - Vị trí (lấy từ useLocation hoặc thủ công)
 *
 * Taste vector: Đồng bộ với Backend (7 chiều)
 *   Like = 0.9, Dislike = 0.05, Trung lập = 0.4
 */
export const UserInputForm: React.FC<UserInputFormProps> = ({
  users,
  setUsers,
  addUser,
  removeUser,
  defaultLocation,
}) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState(200000);
  const [tastes, setTastes] = useState<number[]>(new Array(7).fill(40)); // UI labels are 7
  const [allergies, setAllergies] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState(200000);
  const [editTastes, setEditTastes] = useState<number[]>(new Array(7).fill(40)); // UI labels are 7
  const [editAllergies, setEditAllergies] = useState<string[]>([]);

  // Helper: Convert 7 UI tastes to 8 Backend dimensions
  const tastesToVector = (t: number[]): number[] => {
    const v = new Array(8).fill(0.4); // Default neutral for seafood
    for (let i = 0; i < 6; i++) v[i] = t[i] / 100;
    v[7] = t[6] / 100; // Vegetarian is index 6 in UI, index 7 in Vector
    return v;
  };

  // Helper: Convert 8 Backend dimensions to 7 UI tastes
  const vectorToTastes = (v: number[]): number[] => {
    const t = new Array(7).fill(40);
    for (let i = 0; i < 6; i++) t[i] = Math.round(v[i] * 100);
    t[6] = Math.round(v[7] * 100); // Vegetarian is index 7 in Vector, index 6 in UI
    return t;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      () => {
        alert('Không thể lấy vị trí. Vui lòng kiểm tra quyền định vị.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const fallbackLocation = defaultLocation ?? { lat: 10.7626, lng: 106.6601 };

    const newUser: GroupUser = {
      id: generateId('user'),
      name: name.trim(),
      tasteVector: tastesToVector(tastes),
      budget: budget,
      location: userLocation ?? fallbackLocation,
      allergies: allergies,
    };

    addUser?.(newUser);
    if (!addUser) {
      setUsers((prev) => [...prev, newUser]);
    }

    setName('');
    setBudget(200000);
    setTastes(new Array(7).fill(40));
    setAllergies([]);
    setUserLocation(null);
    setShowForm(false);
  };

  const handleRemoveUser = (id: string) => {
    removeUser?.(id);
    if (!removeUser) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
    if (editingUserId === id) setEditingUserId(null);
  };

  const startEditUser = (user: GroupUser) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditBudget(user.budget);
    setEditTastes(vectorToTastes(user.tasteVector));
    setEditAllergies(user.allergies || []);
  };

  const saveEditUser = () => {
    if (!editingUserId || !editName.trim()) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUserId ? { ...u, name: editName.trim(), budget: editBudget, tasteVector: tastesToVector(editTastes), allergies: editAllergies } : u
      )
    );
    setEditingUserId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-orange-500" />
          Thành viên nhóm ({users.length})
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Thêm mới
          </button>
        )}
      </div>

      {/* User list */}
      <div className="space-y-2">
        <AnimatePresence>
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={editingUserId !== user.id ? { scale: 1.02, boxShadow: '0px 5px 15px rgba(0,0,0,0.05)' } : {}}
              transition={{ duration: 0.2 }}
              onClick={() => { if (editingUserId !== user.id) startEditUser(user); }}
              className={`p-3 bg-white/80 backdrop-blur-md rounded-xl border shadow-sm transition-colors ${
                editingUserId === user.id ? 'border-orange-300 ring-2 ring-orange-50' : 'border-neutral-100 cursor-pointer hover:border-orange-200'
              }`}
            >
              {editingUserId === user.id ? (
                // Chế độ Edit
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-neutral-200 focus:ring-1 focus:ring-orange-500 outline-none"
                      placeholder="Tên..."
                      autoFocus
                    />
                    <select
                      value={editBudget}
                      onChange={(e) => setEditBudget(Number(e.target.value))}
                      className="px-2 py-1.5 text-sm rounded-lg border border-neutral-200 focus:ring-1 focus:ring-orange-500 outline-none"
                    >
                      {BUDGET_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                      <option value={1000000}>1M</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-2 p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                    {TASTE_LABELS.map((label, idx) => (
                      <div key={label} className="text-[10px]">
                        <div className="flex justify-between mb-1 text-neutral-600">
                          <span>{label}</span>
                          <span className="text-orange-500 font-medium">{editTastes[idx]}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="5"
                          value={editTastes[idx]}
                          onChange={(e) => {
                            const newTastes = [...editTastes];
                            newTastes[idx] = Number(e.target.value);
                            setEditTastes(newTastes);
                          }}
                          className="w-full accent-orange-500 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Allergy in Edit Mode */}
                  <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                    <AllergyInput 
                      allergies={editAllergies} 
                      onAllergiesChange={setEditAllergies} 
                    />
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUserId(null)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={saveEditUser}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              ) : (
                // Chế độ View
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-neutral-800 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        {formatPrice(user.budget)}
                      </p>
                      {user.allergies && user.allergies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.allergies.map(a => (
                            <span key={a} className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded text-[8px] font-bold border border-red-100">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveUser(user.id); }}
                    className="p-1.5 ml-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {users.length === 0 && !showForm && (
          <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
            <UserPlus className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">Chưa có thành viên nào</p>
            <p className="text-neutral-400 text-xs mt-1">Bấm "Thêm" để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Add User Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddUser}
            className="bg-white/90 backdrop-blur-xl rounded-2xl border border-orange-100 shadow-sm overflow-hidden"
          >
            <div className="p-5 space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 flex justify-between">
                  <span>Tên thành viên</span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                  >
                    {isGettingLocation ? (
                      <span className="animate-pulse">Đang định vị...</span>
                    ) : userLocation ? (
                      <span className="text-emerald-600 flex items-center gap-1">✓ Đã lấy vị trí</span>
                    ) : (
                      '📍 Lấy vị trí riêng'
                    )}
                  </button>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
                  placeholder="Nhập tên..."
                  autoFocus
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Ngân sách: <span className="text-orange-600 font-bold">{formatPrice(budget)}</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setBudget(preset.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        budget === preset.value
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1000000"
                  step="10000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              {/* Taste preferences */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Mức độ sở thích ẩm thực (%)
                </label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {TASTE_LABELS.map((label, idx) => (
                    <div key={label} className="text-xs">
                      <div className="flex justify-between mb-1.5 font-medium text-neutral-600">
                        <span>{label}</span>
                        <span className="text-orange-600">{tastes[idx]}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="5"
                        value={tastes[idx]}
                        onChange={(e) => {
                          const newTastes = [...tastes];
                          newTastes[idx] = Number(e.target.value);
                          setTastes(newTastes);
                        }}
                        className="w-full accent-orange-500 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergy in Add Mode */}
              <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100/50">
                 <AllergyInput 
                    allergies={allergies} 
                    onAllergiesChange={setAllergies} 
                 />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Xác nhận thêm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setName('');
                    setTastes(new Array(7).fill(40));
                  }}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl font-medium text-sm transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
