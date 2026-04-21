import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

import type { Reward, RewardType } from '../../types/quest.types';
import { REWARD_TYPES } from '../../constants/admin.constants';
import { rewardTypeBadge, rewardTypeIcon } from '../../constants/admin.constants';
import { FieldLabel, QInput, StatusBanner, CopyButton } from '../../components/AdminQuestsPanel/AdminFormAtoms';
import { createReward } from '@/modules/quests/services/achievementService';


/**
 * Form tạo Reward mới
 */
export function CreateRewardForm({ onCreated, onPreviewChange }: {
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

    useEffect(() => { onPreviewChange({ type, description, value, expiresAt }); },
        [type, description, value, expiresAt]);

    const valueHint: Record<RewardType, string> = {
        voucher: 'Phần trăm giảm (VD: 15 = 15%)',
        badge: 'Số lượng huy hiệu (VD: 1)',
        points: 'Điểm XP (VD: 100)',
    };

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
            setStatus({ type: 'success', message: 'Reward đã được tạo thành công!' });
            onCreated(reward);
            setValue(''); setDescription(''); setExpiresAt('');
        } catch (e: any) {
            setStatus({ type: 'error', message: e?.response?.data?.message ?? 'Có lỗi xảy ra.' });
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <div>
                <FieldLabel required>Loại</FieldLabel>
                <div className="flex gap-2">
                    {REWARD_TYPES.map(t => (
                        <button key={t} onClick={() => setType(t)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                text-sm font-bold border transition-all
                ${type === t ? rewardTypeBadge(t) : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                            {rewardTypeIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <FieldLabel required>Mô tả</FieldLabel>
                <QInput value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="VD: Voucher giảm 15% tại nhà hàng đối tác" />
            </div>

            <div>
                <FieldLabel required>Giá trị</FieldLabel>
                <QInput type="number" min={0} value={value}
                    onChange={e => setValue(e.target.value)} placeholder={valueHint[type]} />
                <p className="text-xs text-neutral-400 mt-1">{valueHint[type]}</p>
            </div>

            {type === 'voucher' && (
                <div>
                    <FieldLabel>Ngày hết hạn (tùy chọn)</FieldLabel>
                    <QInput type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                        min={new Date().toISOString().split('T')[0]} />
                </div>
            )}

            <AnimatePresence>{status && <StatusBanner type={status.type} message={status.message} />}</AnimatePresence>

            {createdId && (
                <div>
                    <FieldLabel>ID (dùng cho Achievement)</FieldLabel>
                    <div className="flex items-center gap-2 bg-neutral-900 rounded-xl px-3 py-2">
                        <code className="flex-1 text-emerald-400 text-xs font-mono break-all">{createdId}</code>
                        <CopyButton text={createdId} />
                    </div>
                </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white
          font-bold rounded-xl shadow-sm hover:shadow-md transition-all
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {loading ? 'Đang tạo...' : 'Tạo Reward'}
            </button>
        </div>
    );
}

function Plus({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
        className={className}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}