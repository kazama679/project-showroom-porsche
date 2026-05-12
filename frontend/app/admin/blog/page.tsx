'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar, User } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/admin/badge'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { FormInput } from '@/components/admin/form-input'
import { Select } from '@/components/admin/select'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'

const mockPosts = [
  {
    id: 1,
    title: 'The Evolution of Porsche Performance',
    author: 'Admin',
    category: 'Performance',
    publishDate: '2024-06-10',
    views: 1250,
    status: 'published',
  },
  {
    id: 2,
    title: 'Luxury Features in the New 911 Turbo',
    author: 'Admin',
    category: 'Features',
    publishDate: '2024-06-08',
    views: 980,
    status: 'published',
  },
  {
    id: 3,
    title: 'Sustainable Driving with Porsche',
    author: 'Admin',
    category: 'Sustainability',
    publishDate: '2024-06-05',
    views: 750,
    status: 'published',
  },
  {
    id: 4,
    title: 'Behind the Scenes at Porsche HQ',
    author: 'Admin',
    category: 'News',
    publishDate: '2024-06-02',
    views: 0,
    status: 'draft',
  },
]

const statusOptions = [
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

const categoryOptions = [
  { label: 'Performance', value: 'performance' },
  { label: 'Features', value: 'features' },
  { label: 'News', value: 'news' },
  { label: 'Sustainability', value: 'sustainability' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Technology', value: 'technology' },
]

export default function BlogPage() {
  const [posts, setPosts] = useState(mockPosts)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<(typeof mockPosts)[0] | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    author: 'Admin',
    category: 'performance',
    content: '',
    status: 'draft',
  })

  const handleOpenModal = (post?: (typeof mockPosts)[0]) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        title: post.title,
        author: post.author,
        category: post.category.toLowerCase(),
        content: '',
        status: post.status,
      })
    } else {
      setEditingPost(null)
      setFormData({
        title: '',
        author: 'Admin',
        category: 'performance',
        content: '',
        status: 'draft',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      setAlertMessage('Please fill in all required fields')
      setShowAlert(true)
      return
    }

    if (editingPost) {
      setPosts(
        posts.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                title: formData.title,
                author: formData.author,
                category: formData.category.charAt(0).toUpperCase() + formData.category.slice(1),
                status: formData.status as any,
              }
            : post
        )
      )
      setAlertMessage('Post updated successfully')
    } else {
      const newPost = {
        id: Math.max(...posts.map((p) => p.id)) + 1,
        title: formData.title,
        author: formData.author,
        category: formData.category.charAt(0).toUpperCase() + formData.category.slice(1),
        publishDate: formData.status === 'published' ? new Date().toISOString().split('T')[0] : '',
        views: 0,
        status: formData.status as any,
      }
      setPosts([newPost, ...posts])
      setAlertMessage('Post created successfully')
    }

    setIsModalOpen(false)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const handleDelete = (id: number) => {
    setPosts(posts.filter((post) => post.id !== id))
    setAlertMessage('Post deleted successfully')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  return (
    <PageLayout
      title="Blog Management"
      subtitle="Create and manage blog posts"
      actions={
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => handleOpenModal()}
        >
          New Post
        </Button>
      }
    >
      <div className="space-y-6">
        {showAlert && (
          <Alert
            type="success"
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}

        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6">
          <DataTable
            columns={[
              {
                key: 'title',
                label: 'Title',
                sortable: true,
              },
              {
                key: 'category',
                label: 'Category',
                sortable: true,
              },
              {
                key: 'author',
                label: 'Author',
                align: 'center',
                render: (value) => (
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <User size={14} />
                    {value}
                  </div>
                ),
              },
              {
                key: 'publishDate',
                label: 'Published',
                align: 'center',
                render: (value) => (
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Calendar size={14} />
                    {value}
                  </div>
                ),
              },
              {
                key: 'views',
                label: 'Views',
                align: 'center',
              },
              {
                key: 'status',
                label: 'Status',
                align: 'center',
                render: (value) => (
                  <Badge variant={value === 'published' ? 'success' : 'warning'}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Badge>
                ),
              },
              {
                key: 'id',
                label: 'Actions',
                align: 'center',
                render: (value) => (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleOpenModal(posts.find((p) => p.id === value))}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-[#8F8F8F]" />
                    </button>
                    <button
                      onClick={() => handleDelete(value)}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-[#DA291C]" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={posts}
            pagination={{
              pageSize: 10,
              currentPage,
              total: posts.length,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>

      {/* Create/Edit Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPost ? 'Edit Post' : 'Create New Post'}
        subtitle={editingPost ? 'Update blog post' : 'Write a new blog article'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingPost ? 'Update' : 'Publish'} Post
            </Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <FormInput
            label="Post Title"
            placeholder="e.g., The Evolution of Porsche Performance"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Select
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <div>
            <label className="text-ferrari-label text-[#181818] dark:text-white block mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your blog post content here..."
              className="w-full px-3 py-2 border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] bg-white dark:bg-[#404040] text-black dark:text-white h-48 resize-none"
            />
          </div>

          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
        </div>
      </Modal>
    </PageLayout>
  )
}
