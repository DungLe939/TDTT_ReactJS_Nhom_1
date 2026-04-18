import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Plus, Ticket, Award, Coins,
  ChevronDown, Copy, Check, AlertCircle, Loader2,
  Sparkles, ToggleLeft, ToggleRight, ArrowLeft,
} from 'lucide-react';
import { createReward, createAchievement, getAllRewards } from '@/modules/quests/services/achievementService';
import type { Reward, RewardType, ActivityEventType, CuisineType, Tag } from '@/modules/quests/types/quest.types';
// import { useAuth } from '@/modules/auth/context/AuthContext';

// ─── constants (sourced from quest.types.ts) ─────────────────────────────────

const REWARD_TYPES: RewardType[] = ['voucher', 'badge', 'points'];

const ACTIVITY_EVENT_TYPES: ActivityEventType[] = [
  'POST_CREATED',
  'RESTAURANT_VISITED',
  'POST_LIKED',
  'FOOD_SCANNED',
  'MENU_TRANSLATED',
  'SCHEDULE_COMPLETED',
  'GROUP_TASTE_USED',
];

const CUISINE_TYPES: CuisineType[] = [
  'japanese', 'vietnamese', 'italian', 'korean',
  'chinese', 'thai', 'french', 'indian',
];

const TAGS: Tag[] = [
  'japanese', 'vietnamese', 'italian', 'korean', 'chinese', 'thai', 'french', 'indian',
  'budget', 'mid-range', 'fine-dining',
  'vegetarian', 'vegan', 'halal',
  'breakfast', 'lunch', 'dinner', 'cafe', 'street-food',
];

const COMMON_ICONS = ['🍜', '🍣', '🍕', '🌮', '🍔', '🥗', '🍱', '🥘', '🍛', '🍝', '🏆', '⭐', '🔥', '🎯', '💎', '🎖️'];

// ─── helpers ─────────────────────────────────────────────────────────────────

function rewardTypeIcon(type: RewardType) {
  switch (type) {
    case 'voucher': return <Ticket className="w-4 h-4" />;
    case 'badge':   return <Award  className="w-4 h-4" />;
    case 'points':  return <Coins  className="w-4 h-4" />;
  }
}

function rewardTypeColor(type: RewardType) {
  switch (type) {
    case 'voucher': return 'bg-violet-100 text-violet-700 border-violet-300';
    case 'badge':   return 'bg-amber-100  text-amber-700  border-amber-300';
    case 'points':  return 'bg-sky-100    text-sky-700    border-sky-300';
  }
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5
        text-sm text-neutral-800 placeholder:text-neutral-400
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
        transition-all ${props.className ?? ''}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5
        text-sm text-neutral-800 placeholder:text-neutral-400 resize-none
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
        transition-all"
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl
          px-3 py-2.5 pr-8 text-sm text-neutral-800
          focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
          transition-all cursor-pointer"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
    </div>
  );
}

function StatusBanner({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm font-medium
        ${type === 'success'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-red-50 text-red-700 border border-red-200'}`}
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      {message}
    </motion.div>
  );
}

function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 bg-neutral-900 rounded-xl px-3 py-2.5 mt-2">
      <code className="flex-1 text-emerald-400 text-xs font-mono break-all">{id}</code>
      <button onClick={copy} className="shrink-0 text-neutral-400 hover:text-white transition-colors">
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Create Reward Panel ─────────────────────────────────────────────────────

function CreateRewardPanel({ onCreated }: { onCreated: (r: Reward) => void }) {
  const [type, setType]               = useState<RewardType>('voucher');
  const [value, setValue]             = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [status, setStatus]           = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [createdId, setCreatedId]     = useState<string | null>(null);

  const valueHint: Record<RewardType, string> = {
    voucher: 'Phần trăm giảm giá (VD: 15 = giảm 15%)',
    badge:   'Giá trị hiển thị (VD: 1 = 1 huy hiệu)',
    points:  'Số điểm XP (VD: 100)',
  };

  const handleSubmit = async () => {
    if (!value || !description) {
      setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const payload: Parameters<typeof createReward>[0] = {
        type,
        value: Number(value),
        description,
        ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
      };
      const reward = await createReward(payload);
      setCreatedId(reward.id);
      setStatus({ type: 'success', message: `Reward "${reward.description}" đã được tạo thành công!` });
      onCreated(reward);
      // reset
      setValue('');
      setDescription('');
      setExpiresAt('');
    } catch (e: any) {
      setStatus({ type: 'error', message: e?.response?.data?.message ?? 'Có lỗi xảy ra. Thử lại nhé.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* type selector */}
      <div>
        <Label required>Loại phần thưởng</Label>
        <div className="flex gap-2">
          {REWARD_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                text-sm font-bold border transition-all
                ${type === t ? rewardTypeColor(t) : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
            >
              {rewardTypeIcon(t)}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label required>Mô tả</Label>
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="VD: Voucher giảm 15% tại nhà hàng đối tác"
        />
      </div>

      <div>
        <Label required>Giá trị</Label>
        <Input
          type="number"
          min={0}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={valueHint[type]}
        />
        <p className="text-xs text-neutral-400 mt-1">{valueHint[type]}</p>
      </div>

      {type === 'voucher' && (
        <div>
          <Label>Ngày hết hạn (tùy chọn)</Label>
          <Input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      <AnimatePresence>
        {status && <StatusBanner type={status.type} message={status.message} />}
      </AnimatePresence>

      {createdId && (
        <div>
          <Label>ID của reward vừa tạo (copy để dùng bên Achievement)</Label>
          <CopyableId id={createdId} />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white
          font-bold rounded-xl shadow-md shadow-orange-200 hover:shadow-lg
          hover:from-orange-600 hover:to-red-600 transition-all
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {loading ? 'Đang tạo...' : 'Tạo Reward'}
      </button>
    </div>
  );
}

// ─── Create Achievement Panel ─────────────────────────────────────────────────

function CreateAchievementPanel({ rewards }: { rewards: Reward[] }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon]               = useState('🍜');
  const [isActive, setIsActive]       = useState(true);
  const [rewardId, setRewardId]       = useState('');
  const [eventType, setEventType]     = useState<ActivityEventType | ''>('');
  const [requiredCount, setRequiredCount] = useState('');
  // optional filters
  const [cuisineType, setCuisineType] = useState('');
  const [withinDays, setWithinDays]   = useState('');
  const [tag, setTag]                 = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async () => {
    if (!name || !description || !eventType || !requiredCount || !rewardId) {
      setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc (*).' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const filters: Record<string, unknown> = {};
      if (cuisineType) filters.cuisineType = cuisineType;
      if (withinDays)  filters.withinDays  = Number(withinDays);
      if (tag)         filters.tag         = tag;

      await createAchievement({
        name,
        description,
        icon,
        rewardId,
        isActive,
        condition: {
          eventType: eventType as ActivityEventType,
          requiredCount: Number(requiredCount),
          ...(Object.keys(filters).length ? { filters } : {}),
        },
      });

      setStatus({ type: 'success', message: `Achievement "${name}" đã được tạo thành công!` });
      // reset
      setName(''); setDescription(''); setIcon('🍜'); setRewardId('');
      setEventType(''); setRequiredCount(''); setCuisineType(''); setWithinDays(''); setTag('');
    } catch (e: any) {
      setStatus({ type: 'error', message: e?.response?.data?.message ?? 'Có lỗi xảy ra. Thử lại nhé.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedReward = rewards.find(r => r.id === rewardId);

  return (
    <div className="space-y-4">
      {/* icon picker */}
      <div>
        <Label required>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_ICONS.map(em => (
            <button
              key={em}
              onClick={() => setIcon(em)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center
                border-2 transition-all
                ${icon === em ? 'border-orange-400 bg-orange-50 scale-110' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'}`}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label required>Tên nhiệm vụ</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Thợ Săn Ẩm Thực" />
      </div>

      <div>
        <Label required>Mô tả</Label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Mô tả chi tiết nhiệm vụ cho người dùng..."
        />
      </div>

      {/* condition */}
      <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-3 space-y-3">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Điều kiện hoàn thành</p>

        <div>
          <Label required>Sự kiện kích hoạt</Label>
          <Select
            value={eventType}
            onChange={v => setEventType(v as ActivityEventType)}
            placeholder="-- Chọn loại sự kiện --"
            options={ACTIVITY_EVENT_TYPES.map(t => ({ value: t, label: t }))}
          />
        </div>

        <div>
          <Label required>Số lần yêu cầu</Label>
          <Input
            type="number"
            min={1}
            value={requiredCount}
            onChange={e => setRequiredCount(e.target.value)}
            placeholder="VD: 3 (hoàn thành 3 lần)"
          />
        </div>

        {/* optional filters toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          Bộ lọc nâng cao (tùy chọn)
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              <div>
                <Label>Loại cuisine (lọc theo ẩm thực)</Label>
                <Select
                  value={cuisineType}
                  onChange={setCuisineType}
                  placeholder="-- Không lọc --"
                  options={CUISINE_TYPES.map(c => ({ value: c, label: c }))}
                />
              </div>

              <div>
                <Label>Tag (lọc theo tag bài đăng)</Label>
                <Select
                  value={tag}
                  onChange={setTag}
                  placeholder="-- Không lọc --"
                  options={TAGS.map(t => ({ value: t, label: t }))}
                />
              </div>

              <div>
                <Label>Trong vòng N ngày</Label>
                <Input
                  type="number"
                  min={1}
                  value={withinDays}
                  onChange={e => setWithinDays(e.target.value)}
                  placeholder="VD: 30 (trong vòng 30 ngày)"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* reward picker */}
      <div>
        <Label required>Phần thưởng</Label>
        {rewards.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700 font-medium">
            Chưa có reward nào. Hãy tạo reward trước ở tab bên trái.
          </div>
        ) : (
          <Select
            value={rewardId}
            onChange={setRewardId}
            placeholder="-- Chọn phần thưởng --"
            options={rewards.map(r => ({
              value: r.id,
              label: `[${r.type.toUpperCase()}] ${r.description} (${r.value})`,
            }))}
          />
        )}
        {selectedReward && (
          <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl
            border text-xs font-semibold ${rewardTypeColor(selectedReward.type)}`}>
            {rewardTypeIcon(selectedReward.type)}
            {selectedReward.description} · {selectedReward.value}
            {selectedReward.type === 'voucher' ? '%' : selectedReward.type === 'points' ? ' XP' : ''}
          </div>
        )}
      </div>

      {/* isActive toggle */}
      <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
        <div>
          <p className="text-sm font-bold text-neutral-700">Kích hoạt ngay</p>
          <p className="text-xs text-neutral-400">Tắt nếu muốn lưu nháp trước</p>
        </div>
        <button onClick={() => setIsActive(v => !v)}>
          {isActive
            ? <ToggleRight className="w-8 h-8 text-orange-500" />
            : <ToggleLeft  className="w-8 h-8 text-neutral-400" />}
        </button>
      </div>

      <AnimatePresence>
        {status && <StatusBanner type={status.type} message={status.message} />}
      </AnimatePresence>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white
          font-bold rounded-xl shadow-md shadow-orange-200 hover:shadow-lg
          hover:from-orange-600 hover:to-red-600 transition-all
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Đang tạo...' : 'Tạo Achievement'}
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type AdminTab = 'reward' | 'achievement';

export const AdminQuests = () => {
  // ── Auth guard (uncomment when auth is ready) ────────────────────────────
  // const { user, isAdmin } = useAuth();
  // if (!isAdmin) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen text-neutral-500 text-sm">
  //       🚫 Bạn không có quyền truy cập trang này.
  //     </div>
  //   );
  // }
  // ────────────────────────────────────────────────────────────────────────

  const [tab, setTab]         = useState<AdminTab>('reward');
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    getAllRewards().then(setRewards).catch(() => {});
  }, []);

  const handleRewardCreated = (r: Reward) => {
    setRewards(prev => [...prev, r]);
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-neutral-50 pb-20">
      {/* header */}
      <div className="bg-neutral-900 px-5 pt-10 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-orange-400" />
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Admin Panel</span>
        </div>
        <h1 className="text-white text-2xl font-black">Quản lý nhiệm vụ</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Tạo rewards trước, sau đó gắn vào achievement.
        </p>

        {/* tabs */}
        <div className="flex gap-2 mt-5">
          {(['reward', 'achievement'] as AdminTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all
                ${tab === t
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-neutral-400 hover:bg-white/20'}`}
            >
              {t === 'reward' ? '🎁 Reward' : '🏆 Achievement'}
            </button>
          ))}
        </div>
      </div>

      {/* panels */}
      <div className="px-4 mt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5"
          >
            {tab === 'reward' ? (
              <>
                <h2 className="text-base font-black text-neutral-800 mb-4 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-violet-500" /> Tạo Reward mới
                </h2>
                <CreateRewardPanel onCreated={handleRewardCreated} />
              </>
            ) : (
              <>
                <h2 className="text-base font-black text-neutral-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" /> Tạo Achievement mới
                </h2>
                <CreateAchievementPanel rewards={rewards} />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* existing rewards summary (visible on achievement tab as reference) */}
        {tab === 'achievement' && rewards.length > 0 && (
          <div className="mt-4 bg-white rounded-3xl border border-neutral-100 shadow-sm p-5">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
              Rewards hiện có ({rewards.length})
            </p>
            <div className="space-y-2">
              {rewards.map(r => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold shrink-0 ${rewardTypeColor(r.type)}`}>
                    {rewardTypeIcon(r.type)} {r.type}
                  </div>
                  <span className="text-sm text-neutral-700 flex-1 truncate">{r.description}</span>
                  <CopyableId id={r.id} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
