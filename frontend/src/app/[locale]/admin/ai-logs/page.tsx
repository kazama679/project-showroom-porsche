'use client'

import { useState, useEffect } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/features/admin/data-table'
import { Badge } from '@/components/features/admin/badge'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { Alert } from '@/components/features/admin/alert'
import { apiClient } from '@/lib/api'

const statusVariants = {
  ACTIVE: 'success',
  CLOSED: 'warning',
} as const

export default function AILogsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [sessionDetail, setSessionDetail] = useState<any[]>([])

  const fetchSessions = async (page: number) => {
    setLoading(true)
    try {
      const res = await apiClient.get<any>(`/admin/ai-chat/sessions?page=${page - 1}&size=10`)
      const data = res.data
      setSessions(data.data || [])
      setTotalItems(data.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions(currentPage)
  }, [currentPage])

  const handleViewLog = async (id: number) => {
    setSelectedSessionId(id)
    try {
      const res = await apiClient.get<any>(`/admin/ai-chat/sessions/${id}`)
      setSessionDetail(res.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  useAdminPage({
    titleKey: 'ai_logs',
    subtitleKey: 'ai_logs',
  })

  return (
    <>
      <div className="space-y-6">
        {showAlert && (
          <Alert
            type="success"
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}

        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <DataTable
            columns={[
              {
                key: 'id',
                label: 'Session ID',
              },
              {
                key: 'username',
                label: 'Username',
              },
              {
                key: 'createdAt',
                label: 'Created At',
                render: (val) => new Date(val).toLocaleString()
              },
              {
                key: 'status',
                label: 'Status',
                render: (val) => (
                  <Badge variant={statusVariants[val as keyof typeof statusVariants] || 'success'}>
                    {val}
                  </Badge>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                align: 'center',
                render: (value, row) => (
                  <button
                    onClick={() => handleViewLog(row.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                  >
                    <Eye size={16} className="text-brand-red" />
                  </button>
                ),
              },
            ]}
            data={sessions}
            loading={loading}
            pagination={{
              pageSize: 10,
              currentPage,
              total: totalItems,
              onPageChange: setCurrentPage,
            }}
          />
        </div>

        {/* Modal for viewing chat history */}
        {selectedSessionId && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
             <div className="bg-white w-full max-w-2xl h-[80vh] flex flex-col shadow-xl">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                   <h3 className="font-bold">Chat History #{selectedSessionId}</h3>
                   <button onClick={() => setSelectedSessionId(null)} className="text-xl">&times;</button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 bg-gray-100">
                    {sessionDetail.map((msg: any) => (
                       <div key={msg.id} className={`flex flex-col mb-4 max-w-[80%] ${msg.sender === 'USER' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                          <div className={`p-3 rounded-lg text-sm ${msg.sender === 'USER' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                            {msg.content}
                          </div>
                          {msg.recommendedCars && msg.recommendedCars.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1 bg-white border p-2 rounded">
                                Recommended Models: {msg.recommendedCars.map((c:any) => c.name).join(', ')}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
                       </div>
                    ))}
                    {sessionDetail.length === 0 && <div className="text-center text-gray-500">No messages found.</div>}
                </div>
             </div>
           </div>
        )}
      </div>
    </>
  )
}
