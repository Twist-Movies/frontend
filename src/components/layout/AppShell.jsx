import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { LogFilmModal } from './LogFilmModal';
import { useAuth } from '../../auth';

export function AppShell() {
  const [logOpen, setLogOpen] = useState(false);
  const { session, signOut } = useAuth();

  return (
    <div className="flex min-h-full flex-col pb-14 md:pb-0">
      <TopBar
        username={session?.username ?? ''}
        avatarUrl={session?.avatarUrl}
        onLogFilm={() => setLogOpen(true)}
        onSignOut={signOut}
      />

      <main className="flex-1 pt-6 pb-10 md:pt-8 md:pb-12">
        <div className="wrap">
          <Outlet />
        </div>
      </main>

      <Footer />

      <BottomNav />

      <LogFilmModal open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
