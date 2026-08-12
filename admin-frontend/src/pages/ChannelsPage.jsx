import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, AlertCircle, ExternalLink } from 'lucide-react'
import ChannelForm from '../components/ChannelForm'
import { useChannels, useCreateChannel, useUpdateChannel, useDeleteChannel } from '../api/channelHooks'

export default function ChannelsPage() {
  const navigate = useNavigate()
  const { data: channels, isLoading, error } = useChannels()
  const createChannel = useCreateChannel()
  const updateChannel = useUpdateChannel()
  const deleteChannel = useDeleteChannel()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const handleCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  const handleEdit = (ch, e) => {
    e.stopPropagation()
    setEditing(ch)
    setShowForm(true)
  }

  const handleDelete = (ch, e) => {
    e.stopPropagation()
    setDeleting(ch)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    await deleteChannel.mutateAsync(deleting.id)
    setDeleting(null)
  }

  const handleSubmit = async (formData) => {
    if (editing) {
      await updateChannel.mutateAsync({ id: editing.id, ...formData })
    } else {
      await createChannel.mutateAsync(formData)
    }
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--color-text)' }}>
            CHANNELS
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {channels ? `${channels.length} channels` : 'Loading...'} · click a row to view details
          </p>
        </div>
        <button
          onClick={handleCreate}
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
          NEW CHANNEL
        </button>
      </div>

      {isLoading && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', padding: 20 }}>
          Loading channels...
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
          Failed to load channels.
        </div>
      )}

      {channels && (
        <div style={{
          border: '1px solid var(--color-line)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {channels.map((ch, i) => {
            const isLive = ch.status === 'live'
            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
                onClick={() => navigate(`/dashboard/channels/${ch.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: i < channels.length - 1 ? '1px solid var(--color-line)' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.04)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: isLive ? 'var(--color-live)' : 'var(--color-text-muted)',
                  }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text)' }}>
                      {ch.name}
                    </div>
                    {ch.domain && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {ch.domain}
                        <ExternalLink size={10} style={{ opacity: 0.4 }} />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    padding: '3px 8px',
                    borderRadius: 4,
                    backgroundColor: isLive ? 'rgba(127,216,88,0.12)' : 'rgba(107,112,120,0.12)',
                    color: isLive ? 'var(--color-live)' : 'var(--color-text-muted)',
                  }}>
                    {isLive ? 'LIVE' : 'DRAFT'}
                  </span>

                  <button
                    onClick={(e) => handleEdit(ch, e)}
                    title="Edit"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      opacity: 0.5,
                      transition: 'opacity 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(ch, e)}
                    title="Delete"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      opacity: 0.5,
                      transition: 'opacity 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-denied)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {showForm && (
        <ChannelForm
          editing={editing}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {deleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(14,16,19,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%',
              maxWidth: 380,
              backgroundColor: 'var(--color-panel)',
              border: '1px solid var(--color-line)',
              borderRadius: 12,
              padding: 28,
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-denied)', marginBottom: 12 }}>
              DELETE CHANNEL
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24 }}>
              Remove <span style={{ color: 'var(--color-text)' }}>{deleting.name}</span> and all its data? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleting(null)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: '1px solid var(--color-line)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'var(--color-denied)',
                  color: 'white',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                DELETE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
