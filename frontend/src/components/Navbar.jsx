import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { clearStoredUser, getStoredUser, subscribeToStoredUser } from '../utils/auth';
import { getStoredTheme, subscribeToTheme, toggleTheme } from '../utils/theme';

const createNavLinkClassName = (sizeClasses) => ({ isActive }) =>
  `rounded-full ${sizeClasses} font-semibold transition ${
    isActive
      ? 'bg-white/86 text-black shadow-sm'
      : 'text-black hover:bg-white/55 hover:text-black'
  }`;

const desktopNavLinkClassName = createNavLinkClassName('px-4 py-2 text-sm');
const mobileNavLinkClassName = createNavLinkClassName(
  'px-2.5 py-1.5 text-[0.7rem] sm:px-3 sm:text-xs',
);

const Navbar = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(() => getStoredUser());
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => subscribeToStoredUser(setUserInfo), []);
  useEffect(() => subscribeToTheme(setTheme), []);

  const handleLogout = () => {
    clearStoredUser();
    navigate('/login');
  };
  const handleThemeToggle = () => {
    setTheme(toggleTheme());
  };
  const isDarkMode = theme === 'dark';
  const themeToggleLabel = isDarkMode ? 'Disable dark mode' : 'Enable dark mode';

  const displayName =
    userInfo?.fullName?.trim() || userInfo?.employeeNumber || userInfo?.email || 'Employee';
  const mobileInitials = (userInfo?.fullName?.trim() || userInfo?.employeeNumber || 'EM')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const renderNavLinks = (className) => (
    <>
      <NavLink to="/" end className={className}>
        Home
      </NavLink>
      {userInfo?.role === 'admin' && (
        <NavLink to="/admin" className={className}>
          Admin Panel
        </NavLink>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-black/6 bg-white/35 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 py-3 lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to="/"
              aria-label="Akbar Brothers EMS home"
              className="flex shrink-0 items-center"
            >
              <img
                src="/akbar-corporate-logo.png"
                alt="Akbar Brothers corporate logo"
                className="theme-logo-image h-10 w-auto object-contain"
              />
            </Link>

            <div className="flex min-w-0 shrink items-center gap-1.5">
              {renderNavLinks(mobileNavLinkClassName)}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white text-[0.72rem] font-bold text-[var(--color-brand-ink)] shadow-sm">
              {userInfo?.profileImage ? (
                <img
                  src={userInfo.profileImage}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                mobileInitials
              )}
            </div>
            <button
              onClick={handleThemeToggle}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-[#f3f3f3]"
              title={themeToggleLabel}
              aria-label={themeToggleLabel}
            >
              <img
                src="/moon-dark-mode.png"
                alt=""
                aria-hidden="true"
                className="theme-toggle-icon h-4 w-4 object-contain"
              />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-red)] text-white transition hover:bg-[var(--color-brand-red-dark)]"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="hidden py-4 lg:flex lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              aria-label="Akbar Brothers EMS home"
              className="flex w-fit items-center"
            >
              <img
                src="/akbar-corporate-logo.png"
                alt="Akbar Brothers corporate logo"
                className="theme-logo-image h-12 w-auto object-contain"
              />
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {renderNavLinks(desktopNavLinkClassName)}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-full border border-black/8 bg-white/70 px-4 py-2.5 text-[var(--color-brand-ink)] shadow-sm backdrop-blur-sm lg:min-w-[19rem]">
            <span className="truncate text-sm font-semibold">
              {displayName}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleThemeToggle}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-[#f3f3f3]"
                title={themeToggleLabel}
                aria-label={themeToggleLabel}
              >
                <img
                  src="/moon-dark-mode.png"
                  alt=""
                  aria-hidden="true"
                  className="theme-toggle-icon h-4 w-4 object-contain"
                />
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-red)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
