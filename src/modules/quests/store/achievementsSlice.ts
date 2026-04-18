import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AchievementNotification, AchievementWithProgress, UserRewardResolved } from '@/modules/quests/types/quest.types';
import * as achievementService from '@/modules/quests/services/achievementService';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AchievementsState {
  achievements: AchievementWithProgress[];
  userRewards: UserRewardResolved[];
  notifications: AchievementNotification[];
  loading: boolean;
  error: string | null;
}

const initialState: AchievementsState = {
  achievements: [],
  userRewards: [],
  notifications: [],
  loading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchAchievements = createAsyncThunk(
  'achievements/fetchAchievements',
  (userId: string) => achievementService.getAchievementsForUser(userId),
);

export const fetchUserRewards = createAsyncThunk(
  'achievements/fetchUserRewards',
  (userId: string) => achievementService.getUserRewards(userId),
);

export const redeemVoucher = createAsyncThunk(
  'achievements/redeemVoucher',
  ({ userId, userRewardId }: { userId: string; userRewardId: string }) =>
    achievementService.redeemVoucher(userId, userRewardId),
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    pushNotification(state, action: PayloadAction<AchievementNotification>) {
      state.notifications.push(action.payload);
    },
    dismissNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements = action.payload;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Lỗi tải thành tựu';
      })
      .addCase(fetchUserRewards.fulfilled, (state, action) => {
        state.userRewards = action.payload;
      })
      .addCase(redeemVoucher.fulfilled, (state, action) => {
        // Re-mark the reward as used in state if redemption succeeded
        if (action.meta.arg && action.payload.success) {
          const ur = state.userRewards.find(
            (r) => r.id === action.meta.arg.userRewardId,
          );
          if (ur) ur.isUsed = true;
        }
      });
  },
});

export const {
  pushNotification,
  dismissNotification,
  clearNotifications,
} = achievementsSlice.actions;

export default achievementsSlice.reducer;
