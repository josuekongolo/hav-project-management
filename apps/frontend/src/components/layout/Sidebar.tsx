import { NavLink } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Calendar, Users, Target, Tag, UserCircle, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Kanban Board', href: '/kanban', icon: KanbanSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Milestones', href: '/milestones', icon: Target },
  { name: 'Labels', href: '/labels', icon: Tag },
  { name: 'Users', href: '/users', icon: UserCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transform transition-all duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-16' : 'w-64'
        )}
      >
        <div className="relative h-full">
          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors z-10"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className={clsx('h-4 w-4 text-gray-600 transition-transform', isCollapsed && 'rotate-180')} />
            </button>
          )}

          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-lg transition-colors',
                    isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )
                }
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
