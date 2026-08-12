import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, Layers, GripVertical, Pencil, Trash2, Plus, LayoutTemplate, Type, Images } from 'lucide-react'
import { useChannel } from '../api/channelHooks'
import { usePage } from '../api/pageHooks'
import {
  useSectionsForPage, useCreateSection, useUpdateSection, useDeleteSection, useReorderSections,
} from '../api/sectionHooks'
import SectionTypePicker from '../components/SectionTypePicker'
import HeroSectionForm from '../components/HeroSectionForm'
import TextSectionForm from '../components/TextSectionForm'
import GallerySectionForm from '../components/GallerySectionForm'
import ModelPanel from '../components/ModelPanel'

const TYPE_CONFIG = {
  hero: { label: 'HERO', icon: LayoutTemplate, color: 'var(--color-signal)' },
  text: { label: 'TEXT', icon: Type, color: '#8B5CF6' },
  gallery: { label: 'GALLERY', icon: Images, color: '#F59E0B' },
}

function getPreview(section) {
  const c = section.content
  if (!c) return ''
  switch (section.type) {
    case 'hero': return (typeof c.heading === 'object' ? c.heading?.text : c.heading) || ''
    case 'text': {
      if (c.heading?.text) return c.heading.text
      if (c.paragraphs?.length && c.paragraphs[0].text) {
        const t = c.paragraphs[0].text
        return t.length > 60 ? t.substring(0, 60) + '...' : t
      }
      return ''
    }
    case 'gallery': return c.images ? `${c.images.length} image${c.images.length !== 1 ? 's' : ''}` : ''
    default: return ''
  }
}

function SortableSectionRow({ section, index, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  const cfg = TYPE_CONFIG[section.type]
  const Icon = cfg.icon

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15, delay: index * 0.03 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--color-line)',
          backgroundColor: isDragging ? 'rgba(62,217,196,0.06)' : 'transparent',
          transition: 'background-color 0.1s',
        }}
        onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.04)' }}
        onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button
            {...attributes} {...listeners}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'grab', padding: 2, display: 'flex' }}
          >
            <GripVertical size={14} />
          </button>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            backgroundColor: `${cfg.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={13} style={{ color: cfg.color }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                color: cfg.color,
              }}>
                {cfg.label}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
              {getPreview(section)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={() => onEdit(section)} title="Edit" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.5 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5' }}>
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(section)} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 3, display: 'flex', opacity: 0.5 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-denied)' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--color-text-muted)' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function PageDetail() {
  const { id: channelId, pageId } = useParams()
  const navigate = useNavigate()
  const { data: channel } = useChannel(channelId)
  const { data: page, isLoading: pgLoading, error: pgError } = usePage(channelId, pageId)
  const { data: sections, isLoading: secLoading } = useSectionsForPage(channelId, pageId)
  const createSection = useCreateSection(channelId, pageId)
  const updateSection = useUpdateSection(channelId, pageId)
  const deleteSection = useDeleteSection(channelId, pageId)
  const reorderSections = useReorderSections(channelId, pageId)

  const [showTypePicker, setShowTypePicker] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleAddSection = (type) => {
    setFormType(type)
    setEditing(null)
    setShowTypePicker(false)
    setShowForm(true)
  }

  const handleEditSection = (section) => {
    setFormType(section.type)
    setEditing(section)
    setShowForm(true)
  }

  const handleDeleteSection = (section) => setDeleting(section)

  const confirmDelete = async () => {
    if (!deleting) return
    await deleteSection.mutateAsync(deleting.id)
    setDeleting(null)
  }

  const handleSubmit = async (data) => {
    if (editing) {
      await updateSection.mutateAsync({ id: editing.id, ...data })
    } else {
      await createSection.mutateAsync(data)
    }
    setShowForm(false)
    setEditing(null)
    setFormType(null)
  }

  const handleDragStart = (e) => setActiveId(e.active.id)
  const handleDragEnd = (e) => {
    const { active, over } = e
    setActiveId(null)
    if (!over || active.id === over.id) return
    const flat = Array.from(sections)
    const oldIdx = flat.findIndex((s) => s.id === active.id)
    const newIdx = flat.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(flat, oldIdx, newIdx)
    const moves = reordered.map((s, i) => ({ id: s.id, order: i }))
    reorderSections.mutate(moves)
  }

  if (pgLoading) return <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', padding: 20 }}>Loading page...</div>
  if (pgError || !page) return <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-denied)', padding: 20 }}>Page not found.</div>

  const isPublished = page.status === 'published'
  const activeSection = activeId ? sections?.find((s) => s.id === activeId) : null

  const FormComponent = formType === 'hero' ? HeroSectionForm : formType === 'text' ? TextSectionForm : GallerySectionForm

  return (
    <div>
      <button
        onClick={() => navigate(`/dashboard/channels/${channelId}`)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', marginBottom: 20, padding: 0 }}
      >
        <ArrowLeft size={14} />
        BACK TO {channel?.name?.toUpperCase() || 'CHANNEL'}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28, marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>{page.title}</h1>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 4,
            backgroundColor: isPublished ? 'rgba(127,216,88,0.12)' : 'rgba(107,112,120,0.12)',
            color: isPublished ? 'var(--color-live)' : 'var(--color-text-muted)',
          }}>
            {isPublished ? 'PUBLISHED' : 'DRAFT'}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
          Slug: <span style={{ color: 'var(--color-text)' }}>/{page.slug}</span>
        </div>
      </motion.div>

      <ModelPanel channelId={channelId} pageId={pageId} modelConfig={page.model_config} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        style={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={16} style={{ color: 'var(--color-signal)' }} />
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text)' }}>
              SECTIONS {sections ? `(${sections.length})` : ''}
            </h2>
          </div>
          <button onClick={() => setShowTypePicker(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: 'var(--color-signal)', color: 'var(--color-void)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>
            <Plus size={12} />
            ADD SECTION
          </button>
        </div>

        {secLoading && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', padding: 16 }}>Loading sections...</div>}

        {sections && sections.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--color-line)', borderRadius: 8 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>No sections yet. Add one to start building this page.</p>
          </div>
        )}

        {sections && sections.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div style={{ border: '1px solid var(--color-line)', borderRadius: 8, overflow: 'hidden' }}>
                {sections.map((section, i) => (
                  <SortableSectionRow key={section.id} section={section} index={i} onEdit={handleEditSection} onDelete={handleDeleteSection} />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeSection ? (
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-panel)', border: `1px solid ${TYPE_CONFIG[activeSection.type].color}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                  <GripVertical size={14} style={{ color: TYPE_CONFIG[activeSection.type].color }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text)' }}>{getPreview(activeSection)}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </motion.div>

      <AnimatePresence>
        {showTypePicker && <SectionTypePicker onSelect={handleAddSection} onClose={() => setShowTypePicker(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && formType && (
          <FormComponent editing={editing} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditing(null); setFormType(null) }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,16,19,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              style={{ width: '100%', maxWidth: 380, backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28, textAlign: 'center' }}
            >
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-denied)', marginBottom: 12 }}>DELETE SECTION</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24 }}>
                Remove <span style={{ color: 'var(--color-text)' }}>{TYPE_CONFIG[deleting.type]?.label} section</span>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={confirmDelete} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--color-denied)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>DELETE</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
