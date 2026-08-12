import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, AlertCircle } from 'lucide-react'
import MenuTree from '../components/MenuTree'
import MenuForm from '../components/MenuForm'
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu, useReorderMenus, flattenTree } from '../api/menuHooks'

export default function MenusPage() {
  const { data: menus, isLoading, error } = useMenus()
  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  const deleteMenu = useDeleteMenu()
  const reorderMenus = useReorderMenus()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [parentIdForNew, setParentIdForNew] = useState(null)

  const handleCreate = (parentId) => {
    setEditing(null)
    setParentIdForNew(parentId || null)
    setShowForm(true)
  }

  const handleEdit = (node) => {
    setEditing(node)
    setParentIdForNew(null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item and all its children?')) return
    await deleteMenu.mutateAsync(id)
  }

  const handleSubmit = async (formData) => {
    const payload = { ...formData }
    if (!editing && parentIdForNew) {
      payload.parent_id = parentIdForNew
    }
    if (editing) {
      await updateMenu.mutateAsync({ id: editing.id, ...payload })
    } else {
      await createMenu.mutateAsync(payload)
    }
    setShowForm(false)
    setEditing(null)
    setParentIdForNew(null)
  }

  const handleReorder = (newTree, moves) => {
    reorderMenus.mutate(moves)
  }

  const flat = menus ? flattenTree(menus) : []

  return (
    <div>
      <style>{`
        .menus-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .menus-title { font-family: var(--font-mono); font-size: 13px; font-weight: 600; letter-spacing: 0.14em; color: var(--color-text); }
        .menus-count { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
      `}</style>

      <div className="menus-header">
        <div>
          <h1 className="menus-title">MENU MANAGEMENT</h1>
          <p className="menus-count" style={{ marginTop: 4 }}>
            {flat.length} items · drag to reorder or reparent
          </p>
        </div>
        <button
          onClick={() => handleCreate(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'var(--color-signal)',
            color: 'var(--color-void)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          NEW ITEM
        </button>
      </div>

      {isLoading && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', padding: 20 }}>
          Loading menus...
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 16,
          borderRadius: 8,
          backgroundColor: 'rgba(232,84,84,0.1)',
          border: '1px solid var(--color-denied)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-denied)',
        }}>
          <AlertCircle size={14} />
          Failed to load menus.
        </div>
      )}

      {menus && (
        <MenuTree
          menus={menus}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddChild={(parentId) => handleCreate(parentId)}
          onReorder={handleReorder}
        />
      )}

      {showForm && (
        <MenuForm
          menus={menus || []}
          editing={editing}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null); setParentIdForNew(null) }}
        />
      )}
    </div>
  )
}
