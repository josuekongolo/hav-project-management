import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showHamburger, setShowHamburger] = useState(true);
  const lastScrollY = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const currentScrollY = mainElement.scrollTop;

      if (currentScrollY < 10) {
        // Always show at top
        setShowHamburger(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide
        setShowHamburger(false);
      } else {
        // Scrolling up - show
        setShowHamburger(true);
      }

      lastScrollY.current = currentScrollY;
    };

    mainElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main ref={mainRef} className="flex-1 overflow-auto">
          {/* Mobile menu button */}
          {!isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={clsx(
                'lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-gray-300 rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all backdrop-blur-sm bg-opacity-95',
                showHamburger ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
              )}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="lg:pt-0 pt-16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
