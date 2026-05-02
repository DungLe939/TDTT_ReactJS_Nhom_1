import { createBrowserRouter } from 'react-router';
import { Layout } from './common/components/Layout';

import { Home } from './pages/Home';
import SchedulePage from './modules/schedule/pages/SchedulePage/SchedulePage';
import { FoodScan } from './pages/FoodScan';
import { SmartMenu } from './pages/SmartMenu';
import { Quests } from './pages/Quests';
import { GroupTaste } from './pages/GroupTaste';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { FileUploadDemo } from './pages/FileUploadDemo';
import { LoadingModalDemo } from './pages/LoadingModalDemo';
import { Auth } from './modules/auth/pages/Auth';
import { Profile } from './modules/auth/pages/Profile';
import { TestDataConnect } from './pages/TestDataConnect';
import { FoodMarket } from './pages/FoodMarket';
import { Store } from './pages/Store';

export const router = createBrowserRouter([
  {
    path: '/',
    // Layout như kiểu là footer và header của trang nếu chuyển qua page khác sẽ không bị mất
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'itinerary', Component: SchedulePage },
      { path: 'scan', Component: FoodScan },
      { path: 'menu', Component: SmartMenu },
      { path: 'quests', Component: Quests },
      { path: 'group', Component: GroupTaste },
      { path: 'market', Component: FoodMarket },
      { path: 'group/:groupId', Component: GroupTaste },
      { path: 'admin', Component: Admin },
      { path: 'admin-login', Component: AdminLogin },
      { path: 'upload-demo', Component: FileUploadDemo },
      { path: 'loading-demo', Component: LoadingModalDemo },
      { path: 'auth', Component: Auth },
      { path: 'profile', Component: Profile },
      { path: 'test', Component: TestDataConnect },
      { path: 'store', Component: Store },
    ],
  },
]);
