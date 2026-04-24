import { useState, useEffect } from 'react';
import { Layers, Ticket, Sparkles, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import type { Reward, RewardType } from '../../types/quest.types';
import { CreateRewardForm } from './CreateRewardForm.tsx';
import { CreateAchievementForm } from './CreateAchievementForm.tsx';
import { PreviewRewardCard, PreviewQuestCard } from './QuestPreviews';
import { rewardTypeBadge, rewardTypeIcon, rewardValueLabel, ACTIVITY_EVENT_TYPES } from '../../constants/admin.constants';
import { getAllRewards } from '@/modules/quests/services/achievementService';
import { CopyButton } from './AdminFormAtoms';

/**
 * AdminQuestsPanel bao gồm 2 sub-tab: tạo reward và tạo achievement
 * Được export sang Admin.tsx
 */
type QuestSubTab = 'reward' | 'achievement';

export function AdminQuestsPanel() {
    const [subTab, setSubTab] = useState<QuestSubTab>('reward');
    const [rewards, setRewards] = useState<Reward[]>([]);

    const [rewardPreview, setRewardPreview] = useState({
        type: 'voucher' as RewardType, description: '', value: '', expiresAt: '',
    });
    const [achPreview, setAchPreview] = useState({
        icon: '🍜', name: '', description: '', rewardId: '',
        requiredCount: '', eventType: '', isActive: true,
    });

    const [quotaExceeded, setQuotaExceeded] = useState(false);

    useEffect(() => {
        getAllRewards()
            .then(setRewards)
            .catch((err) => {
                if (err?.response?.status === 500 || err?.message?.includes('quota')) {
                    setQuotaExceeded(true);
                }
            })
            .catch(() => { });
    }, []);

    const selectedReward = rewards.find(r => r.id === achPreview.rewardId) ?? null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* Quota exceeded banner */}
            {quotaExceeded && (
                <div className="lg:col-span-12 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-700">Firebase quota exceeded</p>
                        <p className="text-xs text-red-600 mt-0.5">
                            Đã đạt đến giới hạn đọc dữ liệu hàng ngày trên Firestore. Các thao tác ghi sẽ thất bại cho đến khi giới hạn được đặt lại vào lúc nửa đêm theo giờ Thái Bình Dương.
                            <br /> Hãy kiểm tra Firebase console hoặc xem xét nâng cấp gói.
                        </p>
                    </div>
                </div>
            )}

            {/* Cột bên trái — Show các reward đã tạo ── col 1-3 */}
            <aside className="lg:col-span-3 flex flex-col gap-3 lg:sticky lg:top-[90px]">
                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-neutral-200 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            Rewards hiện có
                        </span>
                        <span className="ml-auto text-xs font-black text-orange-500">{rewards.length}</span>
                    </div>

                    {rewards.length === 0 ? (
                        <div className="px-3 py-6 text-center">
                            <p className="text-xl mb-1">🎁</p>
                            <p className="text-xs text-neutral-400">Chưa có reward nào.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
                            {rewards.map(r => (
                                <div key={r.id} className="px-3 py-2.5 hover:bg-white transition-colors group">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                      border text-[9px] font-bold ${rewardTypeBadge(r.type)}`}>
                                            {rewardTypeIcon(r.type)} {r.type}
                                        </span>
                                        <span className="text-xs font-black text-neutral-600 ml-auto">{rewardValueLabel(r)}</span>
                                    </div>
                                    <p className="text-xs text-neutral-700 leading-snug">{r.description}</p>
                                    <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <code className="text-[9px] text-neutral-400 font-mono truncate flex-1">{r.id}</code>
                                        <CopyButton text={r.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* workflow hint */}
                <div className="bg-neutral-900 rounded-2xl p-3 text-white">
                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2">Workflow</p>
                    <ol className="space-y-1.5 text-[11px] text-neutral-300">
                        <li className="flex gap-1.5"><span className="text-orange-400 font-black shrink-0">01</span>Tạo Reward</li>
                        <li className="flex gap-1.5"><span className="text-orange-400 font-black shrink-0">02</span>Chuyển sang Achievement</li>
                        <li className="flex gap-1.5"><span className="text-orange-400 font-black shrink-0">03</span>Chọn reward từ dropdown</li>
                        <li className="flex gap-1.5"><span className="text-orange-400 font-black shrink-0">04</span>Đặt điều kiện và tạo</li>
                    </ol>
                </div>
            </aside>

            {/* Cột giữa — Form tạo reward và achievement mới ── col 4-9 */}
            <main className="lg:col-span-5">
                {/* sub-tab switcher - Chuyển đổi giữa form tạo reward và achievement*/}
                <div className="flex gap-2 mb-4">
                    {([
                        { key: 'reward', label: '🎁 Reward' },
                        { key: 'achievement', label: '🏆 Achievement' },
                    ] as { key: QuestSubTab; label: string }[]).map(t => (
                        <button key={t.key} onClick={() => setSubTab(t.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all
                ${subTab === t.key
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200'
                                    : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={subTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5"
                    >
                        {subTab === 'reward' ? (
                            <>
                                <h3 className="text-sm font-black text-neutral-700 mb-4 flex items-center gap-2">
                                    <Ticket className="w-4 h-4 text-violet-500" /> Tạo Reward mới
                                </h3>
                                <CreateRewardForm
                                    onCreated={r => setRewards(prev => [...prev, r])}
                                    onPreviewChange={setRewardPreview}
                                />
                            </>
                        ) : (
                            <>
                                <h3 className="text-sm font-black text-neutral-700 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-orange-500" /> Tạo Achievement mới
                                </h3>
                                <CreateAchievementForm
                                    rewards={rewards}
                                    onPreviewChange={setAchPreview}
                                />
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Cột bên phải — live preview reward/achievement mới ── col 10-12 */}
            <aside className="lg:col-span-4 flex flex-col gap-3 lg:sticky lg:top-[90px]">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Live Preview</span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div key={subTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {subTab === 'reward' ? (
                                <PreviewRewardCard {...rewardPreview} />
                            ) : (
                                <PreviewQuestCard
                                    icon={achPreview.icon} name={achPreview.name}
                                    description={achPreview.description} reward={selectedReward}
                                    requiredCount={achPreview.requiredCount}
                                    eventType={achPreview.eventType} isActive={achPreview.isActive}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Giải thích các event */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Sự kiện</p>
                    <div className="space-y-1.5">
                        {ACTIVITY_EVENT_TYPES.map(e => (
                            <div key={e.value} className="flex items-center gap-2">
                                <code className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono">
                                    {e.value}
                                </code>
                                <span className="text-[10px] text-neutral-400">{e.source}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}
