import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isProfilePage = location.pathname === '/' || location.pathname === '/profile';
  const isPublicCardExperience = location.pathname.startsWith('/card/');
  const showChrome = !isAuthPage && !isPublicCardExperience;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-cream-white)] text-black">
      {showChrome && <Navbar />}
      <main
        className={
          isAuthPage
            ? 'flex-1'
            : isPublicCardExperience
              ? 'flex-1 w-full'
            : `flex-1 w-full max-w-7xl mx-auto ${
                isProfilePage
                  ? 'px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-2'
                  : 'px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4'
              } animate-in fade-in duration-500`
        }
      >
        {children}
      </main>
      {showChrome && (
        <footer className="site-footer mt-auto text-white text-center px-4 py-3 backdrop-blur-sm">
          <p className="text-sm opacity-80">&copy; {new Date().getFullYear()} Akbar Brothers Employee Management System</p>
        </footer>
      )}
    </div>
  );
};

export default Layout;
