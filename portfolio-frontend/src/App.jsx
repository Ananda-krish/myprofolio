import { Routes, Route, Navigate } from 'react-router-dom'
import ChannelPage from './pages/ChannelPage'

export default function App() {
  return (
    <Routes>
      <Route path="/preview/:channelId" element={<ChannelPage />} />
      <Route path="/preview/:channelId/:pageSlug" element={<ChannelPage />} />
      <Route path="*" element={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', color: '#71717a' }}>404 — Page not found</div>} />
    </Routes>
  )
}
