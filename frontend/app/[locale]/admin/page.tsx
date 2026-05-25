'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Car, Calendar, Clock } from 'lucide-react'
import { KPICard } from '@/components/admin/kpi-card'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/admin/badge'
import { useAdminPage } from '@/components/admin/admin-page-context'
import { useState } from 'react'

// Mock data
const kpiData = [
  { label: 'Total Users', value: '2,847', unit: 'accounts', trend: 12, icon: <Users size={24} /> },
  { label: 'Active Bookings', value: '156', unit: 'bookings', trend: 28, icon: <Calendar size={24} /> },
  { label: 'Inventory', value: '186', unit: 'vehicles', trend: 5, icon: <Car size={24} /> },
  { label: 'Pending Reviews', value: '24', unit: 'pending', trend: -8, icon: <Clock size={24} /> },
]

const trendData = [
  { month: 'Jan', bookings: 64, testDrives: 24, revenue: 42 },
  { month: 'Feb', bookings: 78, testDrives: 32, revenue: 51 },
  { month: 'Mar', bookings: 92, testDrives: 28, revenue: 61 },
  { month: 'Apr', bookings: 88, testDrives: 41, revenue: 58 },
  { month: 'May', bookings: 112, testDrives: 52, revenue: 74 },
  { month: 'Jun', bookings: 128, testDrives: 48, revenue: 85 },
]

const carCategoryData = [
  { name: '911', value: 45 },
  { name: 'Cayenne', value: 32 },
  { name: 'Panamera', value: 28 },
  { name: 'Macan', value: 18 },
  { name: 'Boxster', value: 12 },
]

const recentBookings = [
  {
    id: 1,
    customer: 'John Smith',
    car: 'Porsche 911 Turbo',
    date: '2024-04-15',
    status: 'confirmed',
    amount: '$2,500',
  },
  {
    id: 2,
    customer: 'Sarah Johnson',
    car: 'Porsche Cayenne',
    date: '2024-04-14',
    status: 'pending',
    amount: '$1,800',
  },
  {
    id: 3,
    customer: 'Michael Chen',
    car: 'Porsche Panamera',
    date: '2024-04-13',
    status: 'completed',
    amount: '$3,200',
  },
  {
    id: 4,
    customer: 'Emma Brown',
    car: 'Porsche Macan',
    date: '2024-04-12',
    status: 'confirmed',
    amount: '$2,100',
  },
  {
    id: 5,
    customer: 'David Wilson',
    car: 'Porsche Boxster',
    date: '2024-04-11',
    status: 'cancelled',
    amount: '$1,500',
  },
]

const colors = ['#DA291C', '#4C98B9', '#03904A', '#F6E500', '#8F8F8F']

const statusVariants = {
  confirmed: 'success',
  pending: 'warning',
  completed: 'success',
  cancelled: 'danger',
} as const

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(1)

  useAdminPage({
    titleKey: 'dashboard_title',
    subtitleKey: 'dashboard_subtitle',
  })

  return (
    <>
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} variant="default" />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
            <h3 className="text-porsche-subheading mb-6 text-near-black dark:text-white">
              Bookings & Test Drives Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="#D2D2D2" strokeDasharray="0" />
                <XAxis stroke="#8F8F8F" style={{ fontSize: '12px' }} />
                <YAxis stroke="#8F8F8F" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#303030',
                    border: '1px solid #404040',
                    borderRadius: '2px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#DA291C"
                  dot={{ fill: '#DA291C', r: 4 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="testDrives"
                  stroke="#4C98B9"
                  dot={{ fill: '#4C98B9', r: 4 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
            <h3 className="text-porsche-subheading mb-6 text-near-black dark:text-white">
              Vehicle Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={carCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {carCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <h3 className="text-porsche-subheading mb-6 text-near-black dark:text-white">
            Recent Bookings
          </h3>
          <DataTable
            columns={[
              {
                key: 'customer',
                label: 'Customer',
                sortable: true,
              },
              {
                key: 'car',
                label: 'Vehicle',
                sortable: true,
              },
              {
                key: 'date',
                label: 'Date',
                sortable: true,
                align: 'center',
              },
              {
                key: 'status',
                label: 'Status',
                align: 'center',
                render: (value) => (
                  <Badge variant={statusVariants[value as keyof typeof statusVariants]}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Badge>
                ),
              },
              {
                key: 'amount',
                label: 'Amount',
                align: 'right',
              },
            ]}
            data={recentBookings}
            pagination={{
              pageSize: 5,
              currentPage,
              total: recentBookings.length,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>
    </>
  )
}
