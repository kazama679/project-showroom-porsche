'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Calendar, User, Eye, Search, FileText, Tag, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { DataTable } from '@/components/base/admin/data-table'
import { Badge } from '@/components/base/ui/badge'
import { Button } from '@/components/base/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/base/ui/dialog'
import { Input } from '@/components/base/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/base/ui/select'
import { Textarea } from '@/components/base/ui/textarea'
import { Label } from '@/components/base/ui/label'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'

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

export default function BlogPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  
  const [posts, setPosts] = useState(mockPosts)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<(typeof mockPosts)[0] | null>(null)
  const [deletingPost, setDeletingPost] = useState<(typeof mockPosts)[0] | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    author: 'Admin',
    category: 'performance',
    content: '',
    status: 'draft' as 'published' | 'draft' | 'archived',
  })

  const filteredPosts = useMemo(() => 
    posts.filter(p => 
      p.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.category.toLowerCase().includes(searchKeyword.toLowerCase())
    ),
    [posts, searchKeyword]
  )

  const handleOpenModal = (post?: (typeof mockPosts)[0]) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        title: post.title,
        author: post.author,
        category: post.category.toLowerCase(),
        content: '',
        status: post.status as any,
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error(t('fill_required'))
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))

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
      toast.success(tCommon('update_success'))
    } else {
      const newPost = {
        id: Math.max(...posts.map((p) => p.id), 0) + 1,
        title: formData.title,
        author: formData.author,
        category: formData.category.charAt(0).toUpperCase() + formData.category.slice(1),
        publishDate: formData.status === 'published' ? new Date().toISOString().split('T')[0] : '—',
        views: 0,
        status: formData.status as any,
      }
      setPosts([newPost, ...posts])
      toast.success(tCommon('create_success'))
    }

    setLoading(false)
    setIsModalOpen(false)
  }

  const handleDelete = async () => {
    if (!deletingPost) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setPosts(posts.filter((post) => post.id !== deletingPost.id))
    toast.success(tCommon('delete_success'))
    setIsDeleteModalOpen(false)
    setDeletingPost(null)
    setLoading(false)
  }

  const columns = [
    {
      key: 'title',
      label: t('title') || 'Title',
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <FileText size={14} className="text-gray-400" />
          <span className="font-bold uppercase tracking-tight text-near-black dark:text-white line-clamp-1">{val}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: t('category') || 'Category',
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Tag size={12} className="text-brand-red" />
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{val}</span>
        </div>
      )
    },
    {
      key: 'author',
      label: t('author') || 'Author',
      align: 'center' as const,
      render: (val: string) => (
        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-gray-400">
          <User size={12} />
          {val}
        </div>
      ),
    },
    {
      key: 'publishDate',
      label: t('date') || 'Published',
      align: 'center' as const,
      render: (val: string) => (
        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-gray-400">
          <Calendar size={12} />
          {val}
        </div>
      ),
    },
    {
      key: 'views',
      label: t('views') || 'Views',
      align: 'center' as const,
      render: (val: number) => (
        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-gray-400">
          <Clock size={12} />
          {val.toLocaleString()}
        </div>
      )
    },
    {
      key: 'status',
      label: t('status') || 'Status',
      align: 'center' as const,
      render: (val: string) => (
        <Badge variant={val === 'published' ? 'success' : 'warning'} className="uppercase text-[9px] tracking-widest font-bold">
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('actions') || 'Actions',
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-near-black dark:hover:text-white"
            onClick={() => handleOpenModal(row)}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-brand-red"
            onClick={() => {
              setDeletingPost(row)
              setIsDeleteModalOpen(true)
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  useAdminPage({
    titleKey: 'blog_management',
    subtitleKey: 'blog_subtitle',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('search_posts') || 'Search posts...'}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button
          variant="brand"
          onClick={() => handleOpenModal()}
          className="uppercase tracking-widest text-xs font-bold w-full sm:w-auto h-10 px-6"
        >
          <Plus size={16} className="mr-2" />
          {t('new_post')}
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable 
          columns={columns} 
          data={filteredPosts} 
          pagination={{
              pageSize: 10,
              currentPage: 1,
              total: filteredPosts.length,
              onPageChange: () => {},
          }}
        />
      </div>

      {/* Create/Edit Post Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 rounded-none border-none overflow-hidden font-porsche">
          <DialogHeader className="p-8 border-b bg-gray-50/50 dark:bg-neutral-900/50">
            <DialogTitle className="uppercase tracking-tighter text-3xl font-black italic">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-[0.2em] text-gray-400">
              {editingPost ? 'Update existing content' : 'Write a new masterpiece for the community'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('title') || 'Post Title'} *</Label>
              <Input
                placeholder="The Evolution of Porsche Performance"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="font-bold uppercase h-12 text-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('category') || 'Category'}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance" className="uppercase text-[10px] font-bold">Performance</SelectItem>
                    <SelectItem value="features" className="uppercase text-[10px] font-bold">Features</SelectItem>
                    <SelectItem value="news" className="uppercase text-[10px] font-bold">News</SelectItem>
                    <SelectItem value="sustainability" className="uppercase text-[10px] font-bold">Sustainability</SelectItem>
                    <SelectItem value="lifestyle" className="uppercase text-[10px] font-bold">Lifestyle</SelectItem>
                    <SelectItem value="technology" className="uppercase text-[10px] font-bold">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('status') || 'Status'}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published" className="uppercase text-[10px] font-bold text-green-600">Published</SelectItem>
                    <SelectItem value="draft" className="uppercase text-[10px] font-bold text-amber-600">Draft</SelectItem>
                    <SelectItem value="archived" className="uppercase text-[10px] font-bold text-gray-600">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('content') || 'Content'}</Label>
              <Textarea
                placeholder="Write your article content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[250px] font-serif text-base resize-none rounded-none border-gray-200"
              />
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="uppercase text-xs font-bold tracking-widest h-12 flex-1">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={loading} className="uppercase text-xs font-bold tracking-[0.2em] h-12 px-12 italic italic font-black shadow-lg">
                {editingPost ? 'Update' : 'Publish'} Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('confirm_delete') || 'Confirm Delete'}
        description={t('are_you_sure') || 'Are you sure you want to delete this post?'}
        itemLabel={deletingPost?.title}
        confirmLabel={t('delete') || 'Delete'}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setDeletingPost(null)
        }}
        loading={loading}
      />
    </div>
  )
}
