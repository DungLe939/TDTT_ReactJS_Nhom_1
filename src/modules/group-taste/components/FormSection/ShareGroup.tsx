import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, Check, Link2, Users } from 'lucide-react';
import { groupTasteApiService } from '../../../../services/groupTaste.service';
import { generateId } from '../../utils/math.utils';

interface ShareGroupProps {
  /** Số lượng user hiện tại trong nhóm */
  userCount: number;
  /** GroupId nếu đã tạo */
  groupId: string | null;
  /** Callback khi tạo group thành công */
  onGroupCreated: (groupId: string) => void;
}

/**
 * ShareGroup — Component tạo link chia sẻ nhóm.
 *
 * Flow:
 * 1. Click "Chia sẻ nhóm"
 * 2. Gọi API tạo groupId (fallback nếu backend chưa hỗ trợ)
 * 3. Sinh link: /group/:groupId
 * 4. Hiện modal với link + nút copy
 */
export const ShareGroup: React.FC<ShareGroupProps> = ({
  userCount,
  groupId: existingGroupId,
  onGroupCreated,
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(existingGroupId);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = groupId
    ? `${window.location.origin}/group/${groupId}`
    : null;

  useEffect(() => {
    setGroupId(existingGroupId);
  }, [existingGroupId]);

  const handleCreateGroup = useCallback(async () => {
    setCreating(true);
    try {
      const result = await groupTasteApiService.createGroup();
      setGroupId(result.groupId);
      onGroupCreated(result.groupId);
      setShowPanel(true);
    } catch {
      const fallbackGroupId = generateId('grp');
      setGroupId(fallbackGroupId);
      onGroupCreated(fallbackGroupId);
      setShowPanel(true);
    } finally {
      setCreating(false);
    }
  }, [onGroupCreated]);

  const handleCopy = useCallback(async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareLink]);

  const handleNativeShare = useCallback(async () => {
    if (!shareLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ăn gì nhóm? — TasteTrekker',
          text: `Nhóm ${userCount} người đang tìm nhà hàng. Tham gia ngay!`,
          url: shareLink,
        });
      } catch {
        /* Người dùng huỷ share */
      }
    }
  }, [shareLink, userCount]);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={groupId ? () => setShowPanel(!showPanel) : handleCreateGroup}
        disabled={creating}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] border border-indigo-100"
      >
        {creating ? (
          <span className="animate-pulse">Đang tạo nhóm...</span>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            {groupId ? 'Xem link chia sẻ' : 'Chia sẻ nhóm'}
          </>
        )}
      </button>

      <AnimatePresence>
        {showPanel && shareLink && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <Link2 className="w-4 h-4 text-indigo-500" />
                Link mời tham gia
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-neutral-50 rounded-lg text-xs text-neutral-600 truncate font-mono border border-neutral-200">
                  {shareLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`p-2 rounded-lg transition-all ${
                    copied
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Chia sẻ qua ứng dụng
                </button>
              )}

              <p className="text-xs text-neutral-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Người khác vào link sẽ tham gia nhóm và nhập sở thích của họ
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
