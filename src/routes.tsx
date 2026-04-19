import { createBrowserRouter } from 'react-router';
import { Layout } from './common/components/Layout';

import { Home } from './pages/Home';
import { Itinerary } from './pages/Itinerary';
import { FoodScan } from './pages/FoodScan';
import { SmartMenu } from './pages/SmartMenu';
import { Quests } from './pages/Quests';
import { GroupTaste } from './pages/GroupTaste';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { FileUploadDemo } from './pages/FileUploadDemo';
import { LoadingModalDemo } from './pages/LoadingModalDemo';
import { Auth } from './pages/Auth';
import { AdminQuests } from './pages/AdminQuests';

export const router = createBrowserRouter([
  {
    path: '/',
    // Layout như kiểu là footer và header của trang nếu chuyển qua page khác sẽ không bị mất
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'itinerary', Component: Itinerary },
      { path: 'scan', Component: FoodScan },
      { path: 'menu', Component: SmartMenu },
      { path: 'quests', Component: Quests },
      { path: 'group', Component: GroupTaste },
      { path: 'group/:groupId', Component: GroupTaste },
      { path: 'admin', Component: Admin },
      { path: 'admin-login', Component: AdminLogin },
      { path: 'upload-demo', Component: FileUploadDemo },
      { path: 'loading-demo', Component: LoadingModalDemo },
      { path: 'auth', Component: Auth },
<<<<<<< HEAD
      { path: 'admin-quests', Component: AdminQuests },
      { path: 'blogs', Component: BlogPage },
=======
      { path: 'admin-quests', Component: AdminQuests }
>>>>>>> 3553cc0 ([UPDATE] Hoàn thiện tích hợp Firebase và Incremental Sync cho Frontend)
    ],
  },
]);
