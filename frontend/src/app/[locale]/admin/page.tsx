'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import { TrendingUp, Users, Car, Calendar, Clock, DollarSign, Activity, PieChart as PieIcon } from 'lucide-react'

import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { DataTable } from '@/components/base/admin/data-table'
import { Badge } from '@/components/base/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/ui/card'

// Mock data
const kpiData = [
  { label: 'Total Users', value: '2,847', unit: 'accounts', trend: 12, icon: <Users size={20} /> },
  { label: 'Active Bookings', value: '156', unit: 'bookings', trend: 28, icon: <Calendar size={20} /> },
  { label: 'Inventory', value: '186', unit: 'vehicles', trend: 5, icon: <Car size={20} /> },
  { label: 'Pending Reviews', value: '24', unit: 'pending', trend: -8, icon: <Clock size={20} /> },
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

export default function DashboardPage() {
  const t = useTranslations('admin')
  const [currentPage, setCurrentPage] = useState(1)

  useAdminPage({
    titleKey: 'dashboard_title',
    subtitleKey: 'dashboard_subtitle',
  })

  return (
    <div className="space-y-8 font-porsche">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label} className="rounded-none border-light-gray-surface dark:border-neutral-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-red opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 dark:bg-neutral-900 border rounded-sm text-brand-red">
                  {kpi.icon}
                </div>
                {kpi.trend > 0 ? (
                  <Badge variant="success" className="text-eyebrow py-0 px-1.5 h-5">+ {kpi.trend}%</Badge>
                ) : (
                  <Badge variant="destructive" className="text-eyebrow py-0 px-1.5 h-5">{kpi.trend}%</Badge>
                )}
              </div>
              <p className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400 mb-1">{kpi.label}</p>
              <div className="flex flex-col">
                <span className="text-3xl font-black italic tracking-tighter text-near-black dark:text-white leading-none">
                  {kpi.value}
                </span>
                <span className="text-eyebrow uppercase font-bold text-gray-500 mt-2 tracking-widest">{kpi.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 rounded-none border-light-gray-surface dark:border-neutral-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-gray-50/30">
            <CardTitle className="uppercase tracking-tighter text-xl font-black italic flex items-center gap-2">
              <Activity size={18} className="text-brand-red" />
              Bookings & Test Drives Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-feature-card">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#8F8F8F" 
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} 
                  />
                  <YAxis 
                    stroke="#8F8F8F" 
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: '10px', fontWeight: 'bold' }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '0',
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Legend iconType="rect" formatter={(val) => <span className="text-eyebrow uppercase font-bold tracking-widest text-gray-500">{val}</span>} />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#DA291C"
                    dot={{ fill: '#DA291C', r: 4, strokeWidth: 0 }}
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="testDrives"
                    stroke="#000"
                    dot={{ fill: '#000', r: 4, strokeWidth: 0 }}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="rounded-none border-light-gray-surface dark:border-neutral-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-gray-50/30">
            <CardTitle className="uppercase tracking-tighter text-xl font-black italic flex items-center gap-2">
              <PieIcon size={18} className="text-brand-red" />
              Vehicle Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-feature-card">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {carCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="outline-none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {carCategoryData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: colors[i % colors.length] }} />
                    <span className="text-micro uppercase font-bold tracking-widest text-gray-500">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card className="rounded-none border-light-gray-surface dark:border-neutral-800 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-gray-50/30 flex flex-row items-center justify-between">
          <CardTitle className="uppercase tracking-tighter text-xl font-black italic flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-red" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={[
              {
                key: 'customer',
                label: 'Customer',
                render: (val: string) => <span className="font-bold uppercase text-near-black dark:text-white break-all">{val}</span>
              },
              {
                key: 'car',
                label: 'Vehicle',
                render: (val: string) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-near-black dark:text-white italic tracking-tighter">{val}</span>
                  </div>
                )
              },
              {
                key: 'date',
                label: 'Date',
                render: (v: string) => <span className="font-mono text-eyebrow text-gray-400 font-bold uppercase">{v}</span>
              },
              {
                key: 'status',
                label: 'Status',
                align: 'center',
                render: (val: string) => {
                  const variants: Record<string, any> = {
                    confirmed: 'success',
                    pending: 'warning',
                    completed: 'success',
                    cancelled: 'destructive',
                  }
                  return (
                    <Badge variant={variants[val] || 'default'} className="uppercase text-micro tracking-widest font-bold">
                      {val}
                    </Badge>
                  )
                },
              },
              {
                key: 'amount',
                label: 'Amount',
                align: 'right',
                render: (v: string) => <span className="font-black text-near-black dark:text-white">{v}</span>
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
        </CardContent>
      </Card>
    </div>
  )
}
