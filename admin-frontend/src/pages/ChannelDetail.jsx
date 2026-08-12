import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, ExternalLink, Layers, GripVertical, Pencil, Trash2, Plus, AlertCircle, Menu, Palette } from 'lucide-react'
import { useChannel, useUpdateChannel } from '../api/channelHooks'
import { useNavbarTemplates } from '../api/navbarTemplateHooks'
import { usePagesForChannel, useCreatePage, useUpdatePage, useDeletePage, useReorderPages } from '../api/pageHooks'
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu, useReorderMenus } from '../api/menuHooks'
import PageForm from '../components/PageForm'
import MenuForm from '../components/MenuForm'
import MenuTree from '../components/MenuTree'

function SortablePageRow({ page, index, onEdit, onDelete, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  const isPublished = page.status === 'published'

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15, delay: index * 0.03 }}
        onClick={() => onClick(page.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-line)',
          cursor: 'pointer',
          backgroundColor: isDragging ? 'rgba(62,217,196,0.06)' : 'transparent',
          transition: 'background-color 0.1s',
        }}
        onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.04)' }}
        onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            {...attributes}
            {...listeners}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'grab', padding: 2, display: 'flex' }}
          >
            <GripVertical size={14} />
          </button>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text)' }}>{page.title}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>/{page.slug}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em',
            padding: '3px 8px', borderRadius: 4,
            backgroundColor: isPublished ? 'rgba(127,216,88,0.12)' : 'rgba(107,112,120,0.12)',
            color: isPublished ? 'var(--color-live)' : 'var(--color-text-muted)',
          }}>
            {isPublished ? 'PUBLISHED' : 'DRAFT'}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onEdit(page) }} title="Edit" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.5 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5' }}>
            <Pencil size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(page) }} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.5 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-denied)' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--color-text-muted)' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ChannelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pages')

  const { data: channel, isLoading: chLoading } = useChannel(id)
  const { data: templates } = useNavbarTemplates()
  const updateChannel = useUpdateChannel()
  const { data: pages, isLoading: pgLoading } = usePagesForChannel(id)
  const createPage = useCreatePage(id)
  const updatePage = useUpdatePage(id)
  const deletePage = useDeletePage(id)
  const reorderPages = useReorderPages(id)

  const { data: menus, isLoading: menusLoading } = useMenus(id)
  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  const deleteMenu = useDeleteMenu()
  const reorderMenus = useReorderMenus()

  const [showPageForm, setShowPageForm] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [deletingPage, setDeletingPage] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const [showMenuForm, setShowMenuForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [parentIdForNew, setParentIdForNew] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleCreatePage = () => { setEditingPage(null); setShowPageForm(true) }
  const handleEditPage = (page) => { setEditingPage(page); setShowPageForm(true) }
  const handleDeletePage = (page) => { setDeletingPage(page) }

  const confirmDeletePage = async () => {
    if (!deletingPage) return
    await deletePage.mutateAsync(deletingPage.id)
    setDeletingPage(null)
  }

  const handlePageSubmit = async (data) => {
    if (editingPage) {
      await updatePage.mutateAsync({ id: editingPage.id, ...data })
    } else {
      await createPage.mutateAsync(data)
    }
    setShowPageForm(false)
    setEditingPage(null)
  }

  const handlePageDragStart = (e) => setActiveId(e.active.id)
  const handlePageDragEnd = (e) => {
    const { active, over } = e
    setActiveId(null)
    if (!over || active.id === over.id) return
    const flat = Array.from(pages)
    const oldIdx = flat.findIndex((p) => p.id === active.id)
    const newIdx = flat.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(flat, oldIdx, newIdx)
    const moves = reordered.map((p, i) => ({ id: p.id, order: i }))
    reorderPages.mutate(moves)
  }

  const handleCreateMenu = (parentId) => {
    setEditingMenu(null)
    setParentIdForNew(parentId || null)
    setShowMenuForm(true)
  }

  const handleEditMenu = (node) => {
    setEditingMenu(node)
    setParentIdForNew(null)
    setShowMenuForm(true)
  }

  const handleDeleteMenu = async (menuId) => {
    if (!confirm('Delete this menu item and all its children?')) return
    await deleteMenu.mutateAsync(menuId)
  }

  const handleMenuSubmit = async (formData) => {
    const payload = { ...formData }
    if (!editingMenu && parentIdForNew) {
      payload.parent_id = parentIdForNew
    }
    if (editingMenu) {
      await updateMenu.mutateAsync({ id: editingMenu.id, ...payload })
    } else {
      await createMenu.mutateAsync(payload)
    }
    setShowMenuForm(false)
    setEditingMenu(null)
    setParentIdForNew(null)
  }

  const handleMenuReorder = (newTree, moves) => {
    reorderMenus.mutate(moves)
  }

  if (chLoading) return <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', padding: 20 }}>Loading channel...</div>
  if (!channel) return <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-denied)', padding: 20 }}>Channel not found.</div>

  const isLive = channel.status === 'live'
  const activePage = activeId ? pages?.find((p) => p.id === activeId) : null
  const publishedPages = pages?.filter((p) => p.status === 'published') || []

  return (
    <div>
      <button onClick={() => navigate('/dashboard/channels')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={14} />
        BACK TO CHANNELS
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        style={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: isLive ? 'var(--color-live)' : 'var(--color-text-muted)' }} />
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>{channel.name}</h1>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 4, backgroundColor: isLive ? 'rgba(127,216,88,0.12)' : 'rgba(107,112,120,0.12)', color: isLive ? 'var(--color-live)' : 'var(--color-text-muted)' }}>
            {isLive ? 'LIVE' : 'DRAFT'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>DOMAIN</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {channel.domain || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Not set</span>}
              {channel.domain && <ExternalLink size={12} style={{ color: 'var(--color-text-muted)' }} />}
            </div>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>CREATED</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text)', marginTop: 4 }}>
              {new Date(channel.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>NAVBAR TEMPLATE</span>
            <div style={{ marginTop: 6, position: 'relative' }}>
              <select
                value={channel.navbar_template_id || ''}
                onChange={(e) => updateChannel.mutate({ id, navbar_template_id: e.target.value ? parseInt(e.target.value) : null })}
                style={{
                  width: '100%', padding: '8px 10px', backgroundColor: 'var(--color-void)',
                  border: '1px solid var(--color-line)', borderRadius: 8,
                  color: 'var(--color-text)', fontSize: 12, fontFamily: 'var(--font-mono)',
                  outline: 'none', cursor: 'pointer', appearance: 'none',
                }}
              >
                <option value="">Default (no template)</option>
                {templates?.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <Palette size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          { key: 'pages', label: 'PAGES', icon: Layers, count: pages?.length },
          { key: 'navigation', label: 'NAVIGATION', icon: Menu, count: menus ? menus.reduce((acc, m) => acc + 1 + (m.children?.length || 0), 0) : 0 },
        ].map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
              border: `1px solid ${activeTab === key ? 'var(--color-signal)' : 'var(--color-line)'}`,
              backgroundColor: activeTab === key ? 'rgba(62,217,196,0.08)' : 'transparent',
              color: activeTab === key ? 'var(--color-signal)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer',
            }}>
            <Icon size={13} />
            {label}
            {count !== undefined && <span style={{ opacity: 0.5 }}>({count})</span>}
          </button>
        ))}
      </div>

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          style={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={16} style={{ color: 'var(--color-signal)' }} />
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text)' }}>
                PAGES {pages ? `(${pages.length})` : ''}
              </h2>
            </div>
            <button onClick={handleCreatePage} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: 'var(--color-signal)', color: 'var(--color-void)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>
              <Plus size={12} />
              NEW PAGE
            </button>
          </div>

          {pgLoading && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', padding: 16 }}>Loading pages...</div>}

          {pages && pages.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--color-line)', borderRadius: 8 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>No pages yet. Create one to get started.</p>
            </div>
          )}

          {pages && pages.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handlePageDragStart} onDragEnd={handlePageDragEnd}>
              <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div style={{ border: '1px solid var(--color-line)', borderRadius: 8, overflow: 'hidden' }}>
                  {pages.map((page, i) => (
                    <SortablePageRow key={page.id} page={page} index={i} onEdit={handleEditPage} onDelete={handleDeletePage} onClick={(pageId) => navigate(`/dashboard/channels/${id}/pages/${pageId}`)} />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activePage ? (
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-signal)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    <GripVertical size={14} style={{ color: 'var(--color-signal)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text)' }}>{activePage.title}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </motion.div>
      )}

      {/* Navigation Tab */}
      {activeTab === 'navigation' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          style={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Menu size={16} style={{ color: 'var(--color-signal)' }} />
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text)' }}>
                NAVBAR ITEMS {menus ? `(${menus.reduce((acc, m) => acc + 1 + (m.children?.length || 0), 0)})` : ''}
              </h2>
            </div>
            <button onClick={() => handleCreateMenu(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: 'var(--color-signal)', color: 'var(--color-void)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>
              <Plus size={12} />
              NEW ITEM
            </button>
          </div>

          {menusLoading && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', padding: 16 }}>Loading navigation...</div>}

          {menus && menus.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--color-line)', borderRadius: 8 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>No menu items yet. Add items to build the public navbar.</p>
            </div>
          )}

          {menus && menus.length > 0 && (
            <MenuTree
              menus={menus}
              onEdit={handleEditMenu}
              onDelete={handleDeleteMenu}
              onAddChild={(parentId) => handleCreateMenu(parentId)}
              onReorder={handleMenuReorder}
            />
          )}
        </motion.div>
      )}

      {showPageForm && <PageForm editing={editingPage} onSubmit={handlePageSubmit} onClose={() => { setShowPageForm(false); setEditingPage(null) }} />}

      {showMenuForm && (
        <MenuForm
          menus={menus || []}
          editing={editingMenu}
          onSubmit={handleMenuSubmit}
          onClose={() => { setShowMenuForm(false); setEditingMenu(null); setParentIdForNew(null) }}
          portfolioId={id}
          channelPages={publishedPages}
        />
      )}

      {deletingPage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,16,19,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 380, backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28, textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-denied)', marginBottom: 12 }}>DELETE PAGE</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24 }}>
              Remove <span style={{ color: 'var(--color-text)' }}>{deletingPage.title}</span>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeletingPage(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={confirmDeletePage} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--color-denied)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>DELETE</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
