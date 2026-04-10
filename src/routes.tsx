import { createBrowserRouter } from 'react-router';
import { Layout } from './common/components/Layout';

import { Home } from './pages/Home';
import { FoodScan } from './pages/FoodScan';
import { SmartMenu } from './pages/SmartMenu';
import { Quests } from './pages/Quests';
import { GroupTaste } from './pages/GroupTaste';
import { Admin } from './pages/Admin';
import { FileUploadDemo } from './pages/FileUploadDemo';
import { LoadingModalDemo } from './pages/LoadingModalDemo';
import { Auth } from './pages/Auth';

export const router = createBrowserRouter([
  {
    path: '/',
    // Layout như kiểu là footer và header của trang nếu chuyển qua page khác sẽ không bị mất
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'scan', Component: FoodScan },
      { path: 'menu', Component: SmartMenu },
      { path: 'quests', Component: Quests },
      { path: 'group', Component: GroupTaste },
      { path: 'admin', Component: Admin },
      { path: 'upload-demo', Component: FileUploadDemo },
      { path: 'loading-demo', Component: LoadingModalDemo },
      { path: 'auth', Component: Auth },
    ],
  },
]);
