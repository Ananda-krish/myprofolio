const BASE = '/api/v1/public'

export async function fetchPortfolio(channelId) {
  const res = await fetch(`${BASE}/portfolios/${channelId}`)
  if (!res.ok) throw new Error('Portfolio not found')
  return res.json()
}

export async function fetchPage(channelId, pageId) {
  const res = await fetch(`${BASE}/portfolios/${channelId}/pages/${pageId}`)
  if (!res.ok) throw new Error('Page not found')
  return res.json()
}

export async function fetchPageBySlug(channelId, slug) {
  const res = await fetch(`${BASE}/portfolios/${channelId}/pages/by-slug/${slug}`)
  if (!res.ok) throw new Error('Page not found')
  return res.json()
}

export async function fetchMenus(channelId) {
  const res = await fetch(`${BASE}/portfolios/${channelId}/menus`)
  if (!res.ok) throw new Error('Menus not found')
  return res.json()
}

export async function fetchNavbarTemplate(channelId) {
  const res = await fetch(`${BASE}/portfolios/${channelId}/navbar-template`)
  if (!res.ok) throw new Error('Navbar template not found')
  return res.json()
}
