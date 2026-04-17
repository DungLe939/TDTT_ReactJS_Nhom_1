/**
 * GroupTaste Page
 *
 * Trang chính cho feature "Ăn gì nhóm?" — Dung hòa khẩu vị nhóm.
 * Route: /group
 *
 * Render GroupTastePage module, which handles:
 *   - User input (name, budget, taste preferences)
 *   - API call to POST /group/recommend
 *   - Display recommended restaurants with explainable scores
 */
import { GroupTastePage } from '../modules/group-taste';

export const GroupTaste = () => {
  return <GroupTastePage />;
};