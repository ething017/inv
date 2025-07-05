import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  FolderIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  PercentBadgeIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'لوحة التحكم', href: '/dashboard', icon: HomeIcon, current: location.pathname === '/dashboard' },
    { name: 'التقارير', href: '/reports', icon: ChartBarIcon, current: location.pathname === '/reports', permission: 'canViewReports' },
    { name: 'العملاء', href: '/clients', icon: UsersIcon, current: location.pathname === '/clients', permission: 'canManageClients' },
    { name: 'الموزعين', href: '/distributors', icon: UserGroupIcon, current: location.pathname === '/distributors', adminOnly: true },
    { name: 'الشركات', href: '/companies', icon: BuildingOfficeIcon, current: location.pathname === '/companies', permission: 'canCreateCompanies' },
    { name: 'الملفات', href: '/files', icon: FolderIcon, current: location.pathname === '/files' },
    { name: 'الفواتير', href: '/invoices', icon: DocumentTextIcon, current: location.pathname === '/invoices', permission: 'canCreateInvoices' },
    { name: 'مستويات العمولة', href: '/commission-tiers', icon: PercentBadgeIcon, current: location.pathname === '/commission-tiers', adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.permission && user?.role !== 'admin' && !user?.permissions[item.permission as keyof typeof user.permissions]) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-lg font-semibold text-gray-900">نظام الفواتير</h2>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="ml-3 h-6 w-6 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'مدير النظام' : 'موزع'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowRightOnRectangleIcon className="ml-3 h-5 w-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 shadow-xl">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">نظام إدارة الفواتير</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                          item.current
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="sr-only">ملفك الشخصي</span>
                  <div className="flex flex-col">
                    <span>{user?.username}</span>
                    <span className="text-xs text-gray-500">
                      {user?.role === 'admin' ? 'مدير النظام' : 'موزع'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" />
                  تسجيل الخروج
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <h1 className="text-lg font-semibold text-gray-900">نظام الفواتير</h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pr-72">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;