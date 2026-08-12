import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, ChevronRight, ChevronDown, Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { ICONS } from './IconPicker'

function flattenTree(nodes) {
  const result = []
  for (const node of nodes) {
    result.push(node)
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children))
    }
  }
  return result
}

function removeFromTree(nodes, id) {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({
      ...n,
      children: n.children ? removeFromTree(n.children, id) : [],
    }))
}

function insertIntoTree(nodes, item, parentId) {
  if (parentId === null) {
    return [...nodes, item]
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...(n.children || []), item] }
    }
    if (n.children && n.children.length > 0) {
      return { ...n, children: insertIntoTree(n.children, item, parentId) }
    }
    return n
  })
}

function reorderInTree(nodes, activeId, overId) {
  const flat = flattenTree(nodes)
  const activeIndex = flat.findIndex((n) => n.id === activeId)
  const overIndex = flat.findIndex((n) => n.id === overId)
  if (activeIndex === -1 || overIndex === -1) return nodes

  const activeNode = flat[activeIndex]
  const overNode = flat[overIndex]

  const newFlat = arrayMove(flat, activeIndex, overIndex)

  const item = newFlat.find((n) => n.id === activeId)
  let withoutItem = removeFromTree(nodes, activeId)

  if (activeNode.parent_id === overNode.parent_id) {
    const parent = withoutItem.find((n) => n.id === activeNode.parent_id)
    if (parent) {
      const siblings = parent.children || []
      const overIdx = siblings.findIndex((s) => s.id === overId)
      const newSiblings = [...siblings.filter((s) => s.id !== activeId)]
      newSiblings.splice(overIdx, 0, item)
      return withoutItem.map((n) =>
        n.id === parent.id ? { ...n, children: newSiblings } : n
      )
    }
  }

  return insertIntoTree(withoutItem, item, overNode.parent_id)
}

function findNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

function SortableMenuItem({ node, depth, expanded, onToggle, onEdit, onDelete, onAddChild }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const Icon = node.icon ? ICONS[node.icon] : null
  const hasChildren = node.children && node.children.length > 0

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 10px',
          marginLeft: depth * 28,
          borderRadius: 8,
          backgroundColor: isDragging ? 'rgba(62,217,196,0.08)' : 'transparent',
          border: isDragging ? '1px solid var(--color-signal)' : '1px solid transparent',
          transition: 'background-color 0.1s, border-color 0.1s',
        }}
        onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.04)' }}
        onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <button
          {...attributes}
          {...listeners}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'grab',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <GripVertical size={14} />
        </button>

        <button
          onClick={() => onToggle(node.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: hasChildren ? 'pointer' : 'default',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            opacity: hasChildren ? 1 : 0.3,
          }}
        >
          {hasChildren ? (
            expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span style={{ width: 14 }} />
          )}
        </button>

        {Icon && <Icon size={14} style={{ color: 'var(--color-signal)', flexShrink: 0 }} />}

        <span style={{
          flex: 1,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: node.is_active ? 'var(--color-text)' : 'var(--color-text-muted)',
          opacity: node.is_active ? 1 : 0.5,
          textDecoration: node.is_active ? 'none' : 'line-through',
        }}>
          {node.label}
        </span>

        {node.route_path && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-muted)',
            opacity: 0.5,
          }}>
            {node.route_path}
          </span>
        )}

        <button
          onClick={() => onAddChild(node.id)}
          title="Add child"
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.5 }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-signal)' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <Plus size={12} />
        </button>
        <button
          onClick={() => onEdit(node)}
          title="Edit"
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.5 }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-signal)' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={() => onDelete(node.id)}
          title="Delete"
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.5 }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-denied)' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <Trash2 size={12} />
        </button>
      </motion.div>
    </div>
  )
}

export default function MenuTree({ menus, onEdit, onDelete, onAddChild, onReorder }) {
  const [expandedIds, setExpandedIds] = useState(() => {
    const all = flattenTree(menus).filter((n) => n.children && n.children.length > 0).map((n) => n.id)
    return new Set(all)
  })
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const visibleIds = useMemo(() => {
    const ids = []
    const walk = (nodes) => {
      for (const node of nodes) {
        ids.push(node.id)
        if (node.children && node.children.length > 0 && expandedIds.has(node.id)) {
          walk(node.children)
        }
      }
    }
    walk(menus)
    return ids
  }, [menus, expandedIds])

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderItems = (nodes, depth = 0) => {
    const items = []
    for (const node of nodes) {
      items.push(
        <SortableMenuItem
          key={node.id}
          node={node}
          depth={depth}
          expanded={expandedIds.has(node.id)}
          onToggle={toggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      )
      if (node.children && node.children.length > 0 && expandedIds.has(node.id)) {
        items.push(...renderItems(node.children, depth + 1))
      }
    }
    return items
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const newTree = reorderInTree(menus, active.id, over.id)
    const flat = flattenTree(newTree)
    const moves = flat.map((item, idx) => ({
      id: item.id,
      parent_id: item.parent_id ?? null,
      order: idx,
    }))
    onReorder(newTree, moves)
  }

  const activeNode = activeId ? findNode(menus, activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
        <div style={{
          border: '1px solid var(--color-line)',
          borderRadius: 10,
          padding: 8,
          backgroundColor: 'var(--color-panel)',
        }}>
          {renderItems(menus)}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeNode ? (
          <div style={{
            padding: '6px 10px',
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--color-signal)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: 0.9,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            <GripVertical size={14} style={{ color: 'var(--color-signal)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text)' }}>
              {activeNode.label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
