import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Plus, Ticket, Award, Coins, ChevronDown,
  Copy, Check, AlertCircle, Loader2, Sparkles,
  ToggleLeft, ToggleRight, Eye, Trash2, Layers,
} from 'lucide-react';
import { createReward, createAchievement, getAllRewards } from '@/modules/quests/services/achievementService';
import type {
  Reward, RewardType, ActivityEventType, CuisineType, Tag,
} from '@/modules/quests/types/quest.types';
// import { useAuth } from '@/context/AuthContext';

// ─── constants ───────────────────────────────────────────────────────────────

const REWARD_TYPES: RewardType[] = ['voucher', 'badge', 'points'];

const ACTIVITY_EVENT_TYPES: { value: ActivityEventType; label: string; source: string }[] = [
  { value: 'POST_CREATED', label: 'POST_CREATED', source: 'Blog' },
  { value: 'RESTAURANT_VISITED', label: 'RESTAURANT_VISITED', source: 'Blog' },
  { value: 'POST_LIKED', label: 'POST_LIKED', source: 'Blog' },
  { value: 'FOOD_SCANNED', label: 'FOOD_SCANNED', source: 'Feature 2' },
  { value: 'MENU_TRANSLATED', label: 'MENU_TRANSLATED', source: 'Feature 3' },
  { value: 'SCHEDULE_COMPLETED', label: 'SCHEDULE_COMPLETED', source: 'Feature 1' },
  { value: 'GROUP_TASTE_USED', label: 'GROUP_TASTE_USED', source: 'Feature 4' },
];

const CUISINE_TYPES: CuisineType[] = [
  'japanese', 'vietnamese', 'italian', 'korean',
  'chinese', 'thai', 'french', 'indian',
];

const ALL_TAGS: Tag[] = [
  'japanese', 'vietnamese', 'italian', 'korean', 'chinese', 'thai', 'french', 'indian',
  'budget', 'mid-range', 'fine-dining',
  'vegetarian', 'vegan', 'halal',
  'breakfast', 'lunch', 'dinner', 'cafe', 'street-food',
];

const COMMON_ICONS = [
  '🍜', '🍣', '🍕', '🌮', '🍔', '🥗', '🍱', '🥘',
  '🍛', '🍝', '🏆', '⭐', '🔥', '🎯', '💎', '🎖️',
  '🧋', '🍦', '🍩', '🎉',
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function rewardTypeIcon(type: RewardType) {
  switch (type) {
    case 'voucher': return <Ticket className="w-4 h-4" />;
    case 'badge': return <Award className="w-4 h-4" />;
    case 'points': return <Coins className="w-4 h-4" />;
  }
}

function rewardTypeBadge(type: RewardType) {
  switch (type) {
    case 'voucher': return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'badge': return 'bg-amber-100  text-amber-700  border-amber-200';
    case 'points': return 'bg-sky-100    text-sky-700    border-sky-200';
  }
}

function rewardValueLabel(r: Reward) {
  switch (r.type) {
    case 'voucher': return `${r.value}% off`;
    case 'points': return `${r.value} XP`;
    case 'badge': return `×${r.value}`;
  }
}

// ─── shared form atoms ───────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5
        text-sm text-neutral-800 placeholder:text-neutral-400
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all
        ${props.className ?? ''}`}
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
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; meta?: string }[];
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
          <option key={o.value} value={o.value}>{o.label}{o.meta ? ` · ${o.meta}` : ''}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
    </div>
  );
}

function StatusBanner({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-orange-500 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Đã copy' : 'Copy ID'}
    </button>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

function PreviewQuestCard({ icon, name, description, reward, requiredCount, eventType, isActive }: {
  icon: string; name: string; description: string;
  reward: Reward | null; requiredCount: string;
  eventType: string; isActive: boolean;
}) {
  const req = Number(requiredCount) || 1;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
      {/* active indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${isActive ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-neutral-200'}`} />

      <div className="p-4 flex gap-4 mt-1">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl shrink-0 shadow-inner">
          {icon || '🍜'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-neutral-800 leading-tight">
            {name || <span className="text-neutral-300">Tên nhiệm vụ...</span>}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 leading-snug line-clamp-2">
            {description || <span className="text-neutral-300">Mô tả nhiệm vụ...</span>}
          </p>
          {reward && (
            <div className={`inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold
              px-2.5 py-1 rounded-xl border ${rewardTypeBadge(reward.type)}`}>
              {rewardTypeIcon(reward.type)}
              {reward.description}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-neutral-400 font-semibold">Tiến độ</span>
          <span className="text-xs font-black text-orange-500 tabular-nums">0 / {req}</span>
        </div>
        <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full w-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full" />
        </div>
        {req <= 10 && (
          <div className="flex gap-1 mt-2">
            {Array.from({ length: req }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-neutral-200" />
            ))}
          </div>
        )}
        {eventType && (
          <p className="text-[10px] text-neutral-400 mt-2 font-medium">
            Trigger: <code className="bg-neutral-100 px-1 rounded">{eventType}</code>
          </p>
        )}
      </div>

      {!isActive && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-3xl flex items-center justify-center">
          <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
            Nháp — chưa kích hoạt
          </span>
        </div>
      )}
    </div>
  );
}

function PreviewRewardCard({ type, description, value, expiresAt }: {
  type: RewardType; description: string; value: string; expiresAt: string;
}) {
  return (
    <div className={`rounded-3xl border p-4 ${rewardTypeBadge(type)}`}>
      <div className="flex items-center gap-2 mb-2">
        {rewardTypeIcon(type)}
        <span className="text-xs font-black uppercase tracking-widest">{type}</span>
        {value && (
          <span className="ml-auto text-sm font-black">
            {type === 'voucher' ? `${value}% off` : type === 'points' ? `${value} XP` : `×${value}`}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold leading-snug">
        {description || <span className="opacity-50">Mô tả reward...</span>}
      </p>
      {expiresAt && (
        <p className="text-[11px] opacity-60 mt-2 font-medium">
          Hết hạn: {new Date(expiresAt).toLocaleDateString('vi-VN')}
        </p>
      )}
    </div>
  );
}

// ─── Create Reward Form ───────────────────────────────────────────────────────

function CreateRewardForm({
  onCreated, onPreviewChange,
}: {
  onCreated: (r: Reward) => void;
  onPreviewChange: (p: { type: RewardType; description: string; value: string; expiresAt: string }) => void;
}) {
  const [type, setType] = useState<RewardType>('voucher');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    onPreviewChange({ type, description, value, expiresAt });
  }, [type, description, value, expiresAt]);

  const handleSubmit = async () => {
    if (!value || !description) {
      setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
      return;
    }
    setLoading(true); setStatus(null);
    try {
      const reward = await createReward({
        type, value: Number(value), description,
        ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
      });
      setCreatedId(reward.id);
      setStatus({ type: 'success', message: `Reward đã được tạo thành công!` });
      onCreated(reward);
      setValue(''); setDescription(''); setExpiresAt('');
    } catch (e: any) {
      setStatus({ type: 'error', message: e?.response?.data?.message ?? 'Có lỗi xảy ra.' });
    } finally {
      setLoading(false);
    }
  };

  const valueHint: Record<RewardType, string> = {
    voucher: 'Phần trăm giảm (VD: 15 = 15%)',
    badge: 'Số lượng huy hiệu (VD: 1)',
    points: 'Điểm XP (VD: 100)',
  };

  return (
    <div className="space-y-5">
      {/* type buttons */}
      <div>
        <FieldLabel required>Loại</FieldLabel>
        <div className="flex gap-2">
          {REWARD_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5
                rounded-xl text-sm font-bold border transition-all
                ${type === t ? rewardTypeBadge(t) : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
              {rewardTypeIcon(t)}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel required>Mô tả</FieldLabel>
        <Input value={description} onChange={e => setDescription(e.target.value)}
          placeholder="VD: Voucher giảm 15% tại nhà hàng đối tác" />
      </div>

      <div>
        <FieldLabel required>Giá trị</FieldLabel>
        <Input type="number" min={0} value={value} onChange={e => setValue(e.target.value)}
          placeholder={valueHint[type]} />
        <p className="text-xs text-neutral-400 mt-1">{valueHint[type]}</p>
      </div>

      {type === 'voucher' && (
        <div>
          <FieldLabel>Ngày hết hạn (tùy chọn)</FieldLabel>
          <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]} />
        </div>
      )}

      <AnimatePresence>{status && <StatusBanner type={status.type} message={status.message} />}</AnimatePresence>

      {createdId && (
        <div>
          <FieldLabel>ID (dùng cho Achievement)</FieldLabel>
          <div className="flex items-center gap-2 bg-neutral-900 rounded-xl px-3 py-2.5">
            <code className="flex-1 text-emerald-400 text-xs font-mono break-all">{createdId}</code>
            <CopyButton text={createdId} />
          </div>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white
          font-bold rounded-xl shadow-md shadow-orange-200 hover:shadow-lg transition-all
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {loading ? 'Đang tạo...' : 'Tạo Reward'}
      </button>
    </div>
  );
}

// ─── Create Achievement Form ──────────────────────────────────────────────────

function CreateAchievementForm({
  rewards, onCreated, onPreviewChange,
}: {
  rewards: Reward[];
  onCreated: () => void;
  onPreviewChange: (p: {
    icon: string; name: string; description: string; rewardId: string;
    requiredCount: string; eventType: string; isActive: boolean;
  }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🍜');
  const [isActive, setIsActive] = useState(true);
  const [rewardId, setRewardId] = useState('');
  const [eventType, setEventType] = useState('');
  const [requiredCount, setRequired] = useState('');
  const [cuisineType, setCuisine] = useState('');
  const [withinDays, setWithin] = useState('');
  const [tag, setTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    onPreviewChange({ icon, name, description, rewardId, requiredCount, eventType, isActive });
  }, [icon, name, description, rewardId, requiredCount, eventType, isActive]);

  const handleSubmit = async () => {
    if (!name || !description || !eventType || !requiredCount || !rewardId) {
      setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc (*).' });
      return;
    }
    setLoading(true); setStatus(null);
    try {
      const filters: Record<string, unknown> = {};
      if (cuisineType) filters.cuisineType = cuisineType;
      if (withinDays) filters.withinDays = Number(withinDays);
      if (tag) filters.tag = tag;

      await createAchievement({
        name, description, icon, rewardId, isActive,
        condition: {
          eventType: eventType as ActivityEventType,
          requiredCount: Number(requiredCount),
          ...(Object.keys(filters).length ? { filters } : {}),
        },
      });
      setStatus({ type: 'success', message: `Achievement "${name}" đã tạo thành công!` });
      onCreated();
      setName(''); setDescription(''); setIcon('🍜'); setRewardId('');
      setEventType(''); setRequired(''); setCuisine(''); setWithin(''); setTag('');
    } catch (e: any) {
      setStatus({ type: 'error', message: e?.response?.data?.message ?? 'Có lỗi xảy ra.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* icon grid */}
      <div>
        <FieldLabel required>Icon</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {COMMON_ICONS.map(em => (
            <button key={em} onClick={() => setIcon(em)}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border-2 transition-all
                ${icon === em
                  ? 'border-orange-400 bg-orange-50 scale-110 shadow-sm'
                  : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'}`}>
              {em}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <FieldLabel required>Tên nhiệm vụ</FieldLabel>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Thợ Săn Ẩm Thực" />
        </div>
        <div className="col-span-2">
          <FieldLabel required>Mô tả</FieldLabel>
          <Textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết nhiệm vụ cho người dùng..." />
        </div>
      </div>

      {/* condition block */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-4">
        <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Điều kiện hoàn thành</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <FieldLabel required>Sự kiện kích hoạt</FieldLabel>
            <Select value={eventType} onChange={setEventType}
              placeholder="-- Chọn sự kiện --"
              options={ACTIVITY_EVENT_TYPES.map(t => ({ value: t.value, label: t.label, meta: t.source }))} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <FieldLabel required>Số lần yêu cầu</FieldLabel>
            <Input type="number" min={1} value={requiredCount}
              onChange={e => setRequired(e.target.value)} placeholder="VD: 3" />
          </div>
        </div>

        <button onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          Bộ lọc nâng cao (tùy chọn)
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Cuisine</FieldLabel>
                  <Select value={cuisineType} onChange={setCuisine} placeholder="-- Không lọc --"
                    options={CUISINE_TYPES.map(c => ({ value: c, label: c }))} />
                </div>
                <div>
                  <FieldLabel>Tag</FieldLabel>
                  <Select value={tag} onChange={setTag} placeholder="-- Không lọc --"
                    options={ALL_TAGS.map(t => ({ value: t, label: t }))} />
                </div>
                <div className="col-span-2">
                  <FieldLabel>Trong vòng N ngày</FieldLabel>
                  <Input type="number" min={1} value={withinDays}
                    onChange={e => setWithin(e.target.value)} placeholder="VD: 30" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* reward picker */}
      <div>
        <FieldLabel required>Phần thưởng</FieldLabel>
        {rewards.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700 font-medium">
            Chưa có reward. Hãy tạo ở tab Reward trước.
          </div>
        ) : (
          <Select value={rewardId} onChange={setRewardId}
            placeholder="-- Chọn phần thưởng --"
            options={rewards.map(r => ({
              value: r.id,
              label: `[${r.type.toUpperCase()}] ${r.description} · ${rewardValueLabel(r)}`,
            }))} />
        )}
      </div>

      {/* isActive toggle */}
      <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
        <div>
          <p className="text-sm font-bold text-neutral-700">Kích hoạt ngay</p>
          <p className="text-xs text-neutral-400">Tắt để lưu nháp</p>
        </div>
        <button onClick={() => setIsActive(v => !v)}>
          {isActive
            ? <ToggleRight className="w-8 h-8 text-orange-500" />
            : <ToggleLeft className="w-8 h-8 text-neutral-400" />}
        </button>
      </div>

      <AnimatePresence>{status && <StatusBanner type={status.type} message={status.message} />}</AnimatePresence>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white
          font-bold rounded-xl shadow-md shadow-orange-200 hover:shadow-lg transition-all
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Đang tạo...' : 'Tạo Achievement'}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type AdminTab = 'reward' | 'achievement';

export const AdminQuests = () => {
  // ── Auth guard (bỏ comment khi auth hoàn chỉnh) ──────────────────────────
  // const { isAdmin } = useAuth();
  // if (!isAdmin) return (
  //   <div className="flex items-center justify-center min-h-screen text-neutral-500 text-sm">
  //     🚫 Bạn không có quyền truy cập trang này.
  //   </div>
  // );
  // ─────────────────────────────────────────────────────────────────────────

  const [tab, setTab] = useState<AdminTab>('reward');
  const [rewards, setRewards] = useState<Reward[]>([]);

  // live preview state
  const [rewardPreview, setRewardPreview] = useState({
    type: 'voucher' as RewardType, description: '', value: '', expiresAt: '',
  });
  const [achPreview, setAchPreview] = useState({
    icon: '🍜', name: '', description: '', rewardId: '',
    requiredCount: '', eventType: '', isActive: true,
  });

  useEffect(() => { getAllRewards().then(setRewards).catch(() => { }); }, []);

  const selectedReward = rewards.find(r => r.id === achPreview.rewardId) ?? null;

  return (
    <div className="max-w-[1500px] mx-auto w-full pt-6 pb-20 px-4 sm:px-6 lg:px-8">

      {/* ── page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-900 leading-tight">Admin · Quản lý nhiệm vụ</h1>
            <p className="text-sm text-neutral-400">Tạo reward trước, sau đó gắn vào achievement.</p>
          </div>
        </div>

        {/* tab switcher */}
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-2xl">
          {([
            { key: 'reward', label: '🎁 Reward' },
            { key: 'achievement', label: '🏆 Achievement' },
          ] as { key: AdminTab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all
                ${tab === t.key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT — rewards library ─────────────────────────────── col 1-3 */}
        <aside className="lg:col-span-3 flex flex-col gap-4 sticky top-[90px]">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-neutral-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-400" />
              <h2 className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                Rewards hiện có
              </h2>
              <span className="ml-auto text-xs font-black text-orange-500">{rewards.length}</span>
            </div>

            {rewards.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-2xl mb-2">🎁</p>
                <p className="text-xs text-neutral-400 font-medium">Chưa có reward nào.<br />Tạo ở form bên phải.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-50 max-h-[60vh] overflow-y-auto">
                {rewards.map(r => (
                  <div key={r.id} className="px-4 py-3 hover:bg-neutral-50 transition-colors group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
                        border text-[10px] font-bold ${rewardTypeBadge(r.type)}`}>
                        {rewardTypeIcon(r.type)}
                        {r.type}
                      </span>
                      <span className="text-xs font-black text-neutral-600 ml-auto">
                        {rewardValueLabel(r)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 font-medium leading-snug">{r.description}</p>
                    <div className="mt-1.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <code className="text-[10px] text-neutral-400 font-mono truncate flex-1">{r.id}</code>
                      <CopyButton text={r.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* hint card */}
          <div className="bg-neutral-900 rounded-3xl p-4 text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Workflow</p>
            <ol className="space-y-2 text-xs text-neutral-300 font-medium">
              <li className="flex gap-2"><span className="text-orange-400 font-black shrink-0">01</span>Tạo Reward (voucher/badge/points)</li>
              <li className="flex gap-2"><span className="text-orange-400 font-black shrink-0">02</span>Chuyển sang tab Achievement</li>
              <li className="flex gap-2"><span className="text-orange-400 font-black shrink-0">03</span>Chọn reward từ dropdown</li>
              <li className="flex gap-2"><span className="text-orange-400 font-black shrink-0">04</span>Đặt điều kiện và tạo</li>
            </ol>
          </div>
        </aside>

        {/* CENTER — active form ────────────────────────────────── col 4-8 */}
        <main className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6"
            >
              <h2 className="text-base font-black text-neutral-800 mb-5 flex items-center gap-2">
                {tab === 'reward'
                  ? <><Ticket className="w-4 h-4 text-violet-500" /> Tạo Reward mới</>
                  : <><Sparkles className="w-4 h-4 text-orange-500" /> Tạo Achievement mới</>}
              </h2>

              {tab === 'reward' ? (
                <CreateRewardForm
                  onCreated={r => setRewards(prev => [...prev, r])}
                  onPreviewChange={setRewardPreview}
                />
              ) : (
                <CreateAchievementForm
                  rewards={rewards}
                  onCreated={() => { }}
                  onPreviewChange={setAchPreview}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* RIGHT — live preview ────────────────────────────────── col 9-12 */}
        <aside className="lg:col-span-4 flex flex-col gap-4 sticky top-[90px]">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-neutral-400" />
              <h2 className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                Live Preview
              </h2>
              <span className="ml-auto text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full font-medium">
                Xem trước
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}>
                {tab === 'reward' ? (
                  <PreviewRewardCard {...rewardPreview} />
                ) : (
                  <PreviewQuestCard
                    icon={achPreview.icon}
                    name={achPreview.name}
                    description={achPreview.description}
                    reward={selectedReward}
                    requiredCount={achPreview.requiredCount}
                    eventType={achPreview.eventType}
                    isActive={achPreview.isActive}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* field guide */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5">
            <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3">
              Giải thích sự kiện
            </p>
            <div className="space-y-2">
              {ACTIVITY_EVENT_TYPES.map(e => (
                <div key={e.value} className="flex items-start gap-2">
                  <code className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono shrink-0 mt-0.5">
                    {e.value}
                  </code>
                  <span className="text-xs text-neutral-400">{e.source}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};