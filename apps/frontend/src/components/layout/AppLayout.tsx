import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden fixed top-2 left-2 z-50 p-2.5 bg-white border border-gray-300 rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors backdrop-blur-sm bg-opacity-95"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Add padding to content on mobile to avoid hamburger overlap */}
          <div className="lg:pl-0 pl-14">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
