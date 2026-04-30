import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { createAchievement } from '@/modules/quests/services/achievementService';
import type { Reward, ActivityEventType } from '@/modules/quests/types/quest.types';
import { ACTIVITY_EVENT_TYPES, COMMON_ICONS, CUISINE_TYPES, ALL_TAGS, rewardValueLabel } from '@/modules/quests/constants/admin.constants';
import { FieldLabel, QInput, QTextarea, QSelect, StatusBanner } from '@/modules/quests/components/AdminQuestsPanel/AdminFormAtoms';


/**
 * Form tạo Achievement mới
 */
export function CreateAchievementForm({ rewards, onPreviewChange }: {
    rewards: Reward[];
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
            setName(''); setDescription(''); setIcon('🍜'); setRewardId('');
            setEventType(''); setRequired(''); setCuisine(''); setWithin(''); setTag('');
        } catch (e: any) {
            setStatus({ type: 'error', message: e?.response?.data?.message ?? 'Có lỗi xảy ra.' });
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <div>
                <FieldLabel required>Icon</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                    {COMMON_ICONS.map(em => (
                        <button key={em} onClick={() => setIcon(em)}
                            className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition-all
                ${icon === em ? 'border-orange-400 bg-orange-50 scale-110' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'}`}>
                            {em}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <FieldLabel required>Tên nhiệm vụ</FieldLabel>
                <QInput value={name} onChange={e => setName(e.target.value)} placeholder="VD: Thợ Săn Ẩm Thực" />
            </div>

            <div>
                <FieldLabel required>Mô tả</FieldLabel>
                <QTextarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết nhiệm vụ cho người dùng..." rows={2} />
            </div>

            {/* Điều kiện */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-3">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Điều kiện</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel required>Sự kiện</FieldLabel>
                        <QSelect value={eventType} onChange={setEventType}
                            placeholder="-- Chọn --"
                            options={ACTIVITY_EVENT_TYPES.map(t => ({ value: t.value, label: t.value, meta: t.source }))} />
                    </div>
                    <div>
                        <FieldLabel required>Số lần</FieldLabel>
                        <QInput type="number" min={1} value={requiredCount}
                            onChange={e => setRequired(e.target.value)} placeholder="VD: 3" />
                    </div>
                </div>

                <button onClick={() => setShowFilters(v => !v)}
                    className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600">
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
                                    <QSelect value={cuisineType} onChange={setCuisine} placeholder="-- Không lọc --"
                                        options={CUISINE_TYPES.map(c => ({ value: c, label: c }))} />
                                </div>
                                <div>
                                    <FieldLabel>Tag</FieldLabel>
                                    <QSelect value={tag} onChange={setTag} placeholder="-- Không lọc --"
                                        options={ALL_TAGS.map(t => ({ value: t, label: t }))} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel>Trong vòng N ngày</FieldLabel>
                                <QInput type="number" min={1} value={withinDays}
                                    onChange={e => setWithin(e.target.value)} placeholder="VD: 30" />
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
                        Chưa có reward. Tạo ở tab Reward trước.
                    </div>
                ) : (
                    <QSelect value={rewardId} onChange={setRewardId}
                        placeholder="-- Chọn phần thưởng --"
                        options={rewards.map(r => ({
                            value: r.id,
                            label: `[${r.type.toUpperCase()}] ${r.description} · ${rewardValueLabel(r)}`,
                        }))} />
                )}
            </div>

            {/* isActive */}
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
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white
          font-bold rounded-xl shadow-sm hover:shadow-md transition-all
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Đang tạo...' : 'Tạo Achievement'}
            </button>
        </div>
    );
}