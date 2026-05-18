import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './modules/auth/context/AuthContext';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './common/components/ThemeProvider';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" enableSystem={false} attribute="class">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'backdrop-blur-xl border rounded-2xl shadow-2xl p-4 font-sans',
              classNames: {
                toast: 'bg-white/90 border-neutral-200 dark:bg-slate-900/90 dark:border-white/10 text-neutral-800 dark:text-white',
                title: 'text-sm font-bold',
                description: 'text-xs text-neutral-500 dark:text-neutral-400',
                success: 'bg-emerald-50/90 border-emerald-200 text-emerald-700 dark:bg-emerald-950/90 dark:border-emerald-800/50 dark:text-emerald-400',
                error: 'bg-rose-50/90 border-rose-200 text-rose-700 dark:bg-rose-950/90 dark:border-rose-800/50 dark:text-rose-400',
                info: 'bg-blue-50/90 border-blue-200 text-blue-700 dark:bg-blue-950/90 dark:border-blue-800/50 dark:text-blue-400',
                warning: 'bg-amber-50/90 border-amber-200 text-amber-700 dark:bg-amber-950/90 dark:border-amber-800/50 dark:text-amber-400',
                icon: 'w-5 h-5',
              }
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
