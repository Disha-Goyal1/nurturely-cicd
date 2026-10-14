import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  HeartHandshake,
  House,
  LifeBuoy,
  Menu,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

const navigationByRole = {
  parent: [
    { label: 'Overview', to: '/dashboard', icon: House },
    { label: 'My children', to: '/app/children', icon: UsersRound },
    { label: 'AI support', to: '/app/ai-support', icon: Sparkles },
    { label: 'Common Ground', to: '/app/common-ground', icon: HeartHandshake },
    { label: 'Find a therapist', to: '/app/therapists', icon: BookOpen },
    { label: 'Parent community', to: '/app/community', icon: MessageCircle },
    { label: 'Find childcare', to: '/app/caregivers', icon: UserRound },
    { label: 'My bookings', to: '/app/bookings', icon: CalendarDays },
    { label: 'Subscription', to: '/app/subscription', icon: ShieldCheck },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ],
  caregiver: [
    { label: 'Overview', to: '/dashboard', icon: House },
    { label: 'Care requests', to: '/app/requests', icon: LifeBuoy },
    { label: 'My bookings', to: '/app/bookings', icon: CalendarDays },
    { label: 'Trust profile', to: '/app/trust-profile', icon: ShieldCheck },
    { label: 'Availability', to: '/app/availability', icon: Settings },
  ],
  therapist: [
    { label: 'Overview', to: '/dashboard', icon: House },
    { label: 'Session requests', to: '/app/requests', icon: MessageCircle },
    { label: 'My sessions', to: '/app/sessions', icon: CalendarDays },
    { label: 'Availability', to: '/app/availability', icon: Settings },
    { label: 'Professional profile', to: '/app/profile', icon: UserRound },
  ],
};

function Wordmark() {
  return (
    <Link className="flex items-center gap-3" to="/dashboard" aria-label="Nurturely overview">
      <span className="brand-mark" aria-hidden="true">n</span>
      <span>
        <span className="block text-[17px] font-semibold tracking-[-0.03em] text-ink">nurturely</span>
        <span className="block text-[10px] tracking-[0.11em] text-muted">AI FAMILY ECOSYSTEM</span>
      </span>
    </Link>
  );
}

export function AppLayout() {
  const { user, logout, authError } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const navigation = navigationByRole[user.role] ?? navigationByRole.parent;
  const currentItem = navigation.find((item) => item.to === location.pathname);
  const pageTitle = currentItem?.label ?? 'Nurturely';
  const mobileItems = navigation.slice(0, 4);

  function closeMenus() {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // The authentication context exposes the failure in the open profile menu.
    }
  }

  return (
    <div className="min-h-screen bg-page text-ink">
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="px-6 pb-8 pt-7"><Wordmark /></div>
        <div className="mx-4 mb-3 border-t border-line pt-5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">Your space</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Your space">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              aria-current={location.pathname === to ? 'page' : undefined}
              className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
              end={to === '/dashboard'}
              onClick={closeMenus}
              to={to}
            >
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        {user.role === 'parent' && (
          <div className="px-4 pb-4 pt-5">
            <Link className="sos-link" to="/app/sos">
              <LifeBuoy size={18} aria-hidden="true" />
              <span>SOS childcare</span>
            </Link>
          </div>
        )}
        <div className="border-t border-line p-4">
          <p className="truncate px-2 text-sm font-medium text-ink">{user.name}</p>
          <p className="px-2 pt-0.5 text-xs capitalize text-muted">{user.role} account</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            className="icon-button mobile-menu-trigger"
            onClick={() => setMobileMenuOpen((open) => !open)}
            type="button"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="text-sm font-medium text-muted">{pageTitle}</p>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                aria-expanded={noticeOpen}
                aria-label="Notifications"
                className="icon-button"
                onClick={() => { setNoticeOpen((open) => !open); setProfileOpen(false); }}
                type="button"
              >
                <span className="notification-dot" aria-hidden="true" />
                <MessageCircle size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
              {noticeOpen && (
                <div className="topbar-popover" role="status">
                  <p className="text-sm font-semibold">You’re all caught up</p>
                  <p className="mt-1 text-xs leading-5 text-muted">Updates will appear here when available.</p>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="profile-trigger"
                onClick={() => { setProfileOpen((open) => !open); setNoticeOpen(false); }}
                type="button"
              >
                <span className="avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-32 truncate text-sm font-medium">{user.name}</span>
                  <span className="block text-xs capitalize text-muted">{user.role}</span>
                </span>
              </button>
              {profileOpen && (
                <div className="topbar-popover" role="menu">
                  <p className="truncate text-sm font-semibold">{user.email}</p>
                  {authError && <p className="auth-error mt-2" role="alert">{authError}</p>}
                  <button className="mt-3 w-full rounded-lg px-2 py-2 text-left text-sm text-ink hover:bg-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage" onClick={handleLogout} role="menuitem" type="button">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <nav className="mobile-drawer" aria-label="Mobile navigation">
            {navigation.map(({ label, to, icon: Icon }) => (
              <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`} end={to === '/dashboard'} key={to} onClick={closeMenus} to={to}>
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
            {user.role === 'parent' && <Link className="sos-link mt-3" onClick={closeMenus} to="/app/sos"><LifeBuoy size={18} />SOS childcare</Link>}
          </nav>
        )}

        <main className="app-content" id="main-content">
          <Outlet />
        </main>
        <nav className="mobile-bottom-nav" aria-label="Quick navigation">
          {mobileItems.map(({ label, to, icon: Icon }) => (
            <NavLink className={({ isActive }) => `mobile-nav-link${isActive ? ' mobile-nav-link-active' : ''}`} end={to === '/dashboard'} key={to} to={to}>
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
