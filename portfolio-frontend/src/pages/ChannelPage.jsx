import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { fetchPortfolio, fetchPageBySlug, fetchMenus, fetchNavbarTemplate } from '../api'
import echo from '../echo'
import SectionRenderer from '../components/SectionRenderer'
import Navbar from '../components/Navbar'
import PageModelCanvas from '../components/PageModelCanvas'

export default function ChannelPage() {
  const { channelId, pageSlug } = useParams()
  const queryClient = useQueryClient()
  const [pulseSectionIds, setPulseSectionIds] = useState(new Set())
  const channelRef = useRef(null)

  const { data: portfolio, isLoading: portLoading, error: portError } = useQuery({
    queryKey: ['portfolio', channelId],
    queryFn: () => fetchPortfolio(channelId),
  })

  const { data: menus } = useQuery({
    queryKey: ['menus', channelId],
    queryFn: () => fetchMenus(channelId),
    enabled: !!channelId,
  })

  const { data: navConfig } = useQuery({
    queryKey: ['navbar-template', channelId],
    queryFn: () => fetchNavbarTemplate(channelId),
    enabled: !!channelId,
  })

  const pages = portfolio?.pages || []
  const targetSlug = pageSlug || pages[0]?.slug

  const { data: page, isLoading: pageLoading, error: pageError } = useQuery({
    queryKey: ['page', channelId, targetSlug],
    queryFn: () => fetchPageBySlug(channelId, targetSlug),
    enabled: !!targetSlug,
  })

  useEffect(() => {
    if (!channelId) return

    const channel = echo.channel(`portfolio.${channelId}`)
    channelRef.current = channel

    channel.listen('.section.updated', (e) => {
      if (e.page_id === page?.id && e.sections) {
        queryClient.setQueryData(['page', channelId, targetSlug], (old) => ({
          ...old,
          sections: e.sections,
        }))
        if (e.section) {
          setPulseSectionIds((prev) => new Set([...prev, e.section.id]))
          setTimeout(() => {
            setPulseSectionIds((prev) => {
              const next = new Set(prev)
              next.delete(e.section.id)
              return next
            })
          }, 1200)
        }
      }
    })

    channel.listen('.page.updated', (e) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', channelId] })
      if (e.page) {
        queryClient.setQueryData(['page', channelId, e.page.slug], e.page)
      }
    })

    channel.listen('.portfolio.updated', () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', channelId] })
    })

    return () => {
      channel.stopListening('.section.updated')
      channel.stopListening('.page.updated')
      channel.stopListening('.portfolio.updated')
      echo.leave(`portfolio.${channelId}`)
    }
  }, [channelId, page?.id, targetSlug, queryClient])

  if (portLoading || pageLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#71717a' }}>
        Loading...
      </div>
    )
  }

  if (portError || !portfolio) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#ef4444' }}>
        Channel not found
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#71717a' }}>
        No published pages on this channel yet.
      </div>
    )
  }

  if (pageError || !page) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#ef4444' }}>
        Page not found
      </div>
    )
  }

  const sections = page.sections || []

  return (
    <div style={{ minHeight: '100vh' }}>
      {page.model_config?.glb_url && <PageModelCanvas modelConfig={page.model_config} sections={sections} />}
      {menus && menus.length > 0 && <Navbar portfolioId={channelId} menus={menus} config={navConfig} />}
      {sections.map((section) => (
        <div key={section.id} id={`section-${section.id}`}>
          <SectionRenderer section={section} pulse={pulseSectionIds.has(section.id)} />
        </div>
      ))}
    </div>
  )
}
