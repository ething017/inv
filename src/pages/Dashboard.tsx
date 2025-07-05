import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  DocumentTextIcon,
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalInvoices: number;
  totalClients: number;
  totalCompanies: number;
  totalDistributors: number;
  recentInvoices: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalClients: 0,
    totalCompanies: 0,
    totalDistributors: 0,
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      name: 'إجمالي الفواتير',
      value: stats.totalInvoices,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      href: '/invoices',
    },
    {
      name: 'إجمالي العملاء',
      value: stats.totalClients,
      icon: UsersIcon,
      color: 'bg-green-500',
      href: '/clients',
    },
    {
      name: 'إجمالي الشركات',
      value: stats.totalCompanies,
      icon: BuildingOfficeIcon,
      color: 'bg-purple-500',
      href: '/companies',
    },
    {
      name: 'إجمالي الموزعين',
      value: stats.totalDistributors,
      icon: UserGroupIcon,
      color: 'bg-orange-500',
      href: '/distributors',
      adminOnly: true,
    },
  ];

  const quickActions = [
    {
      name: 'إنشاء فاتورة جديدة',
      href: '/invoices/new',
      icon: DocumentTextIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      permission: 'canCreateInvoices',
    },
    {
      name: 'إضافة عميل جديد',
      href: '/clients/new',
      icon: UsersIcon,
      color: 'bg-green-600 hover:bg-green-700',
      permission: 'canManageClients',
    },
    {
      name: 'إضافة شركة جديدة',
      href: '/companies/new',
      icon: BuildingOfficeIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
      permission: 'canCreateCompanies',
    },
    {
      name: 'عرض التقارير',
      href: '/reports',
      icon: ChartBarIcon,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      permission: 'canViewReports',
    },
  ];

  const filteredStatsCards = statsCards.filter(card => {
    if (card.adminOnly && user?.role !== 'admin') return false;
    return true;
  });

  const filteredQuickActions = quickActions.filter(action => {
    if (user?.role === 'admin') return true;
    return user?.permissions[action.permission as keyof typeof user.permissions];
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">لوحة التحكم</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          مرحباً {user?.username}، إليك نظرة عامة على النظام
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filteredStatsCards.map((card) => (
          <Link
            key={card.name}
            to={card.href}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-lg transition-shadow sm:px-6 sm:py-6"
          >
            <div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-md p-3`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{card.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{card.value.toLocaleString('ar-SA')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">الإجراءات السريعة</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredQuickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className={`${action.color} text-white rounded-lg p-4 text-center hover:shadow-lg transition-all transform hover:scale-105`}
              >
                <action.icon className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      {stats.recentInvoices.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">الفواتير الأخيرة</h3>
              <Link
                to="/invoices"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                عرض الكل
              </Link>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الفاتورة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentInvoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.client?.fullName || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.amount.toLocaleString('ar-SA')} ريال
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status === 'completed' ? 'مكتملة' : 
                           invoice.status === 'pending' ? 'قيد الانتظار' : 'ملغية'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;