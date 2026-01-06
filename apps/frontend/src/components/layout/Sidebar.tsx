import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Calendar, Users, Target, Tag, UserCircle, ChevronLeft, Building2, Mail, Send, TrendingUp, Cloud, LogOut, Settings, User, Bell } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { NotificationDropdown } from '../features/notifications/NotificationDropdown';
import { ProfileModal } from '../features/profile/ProfileModal';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Kanban Board', href: '/kanban', icon: KanbanSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Milestones', href: '/milestones', icon: Target },
  { name: 'Labels', href: '/labels', icon: Tag },
  { name: 'Users', href: '/users', icon: UserCircle },
  { name: 'CRM', href: '/crm/contacts', icon: Building2 },
  { name: 'Companies', href: '/crm/companies', icon: Building2 },
  { name: 'Deals', href: '/crm/deals', icon: TrendingUp },
  { name: 'Emails', href: '/crm/emails', icon: Send },
  { name: 'Email Templates', href: '/crm/templates', icon: Mail },
  { name: 'Google Drive', href: '/google-drive', icon: Cloud },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'BUSY':
        return 'bg-red-500';
      case 'AWAY':
        return 'bg-yellow-500';
      case 'OFFLINE':
        return 'bg-gray-500';
      default:
        return 'bg-green-500';
    }
  };

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
          'fixed lg:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transform transition-all duration-200 ease-in-out lg:translate-x-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-16' : 'w-64'
        )}
      >
        {/* Logo/Brand */}
        <div className={clsx('p-4 border-b border-gray-200', isCollapsed && 'lg:px-2')}>
          {!isCollapsed ? (
            <h1 className="text-xl font-bold text-primary-600">Havdis Ctrl</h1>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
            </div>
          )}
        </div>

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

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

        {/* User Profile Section */}
        <div className="border-t border-gray-200">
          {!isCollapsed ? (
            <div className="p-4 space-y-3">
              {/* Notifications */}
              <div className="flex justify-center">
                <NotificationDropdown />
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 px-2">
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary-700">
                        {user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}
                      </span>
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(user?.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {/* Notifications (collapsed) */}
              <div className="flex justify-center">
                <NotificationDropdown />
              </div>

              {/* User Avatar (collapsed) */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-medium text-primary-700">
                        {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${getStatusColor(user?.status)}`} />
                </div>
              </div>

              {/* Settings Button (collapsed) */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex justify-center"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* Logout Button (collapsed) */}
              <button
                onClick={handleLogout}
                className="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex justify-center"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
}
