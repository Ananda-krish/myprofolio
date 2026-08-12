import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/apiConfig'

export function useMenus(portfolioId) {
  return useQuery({
    queryKey: ['menus', portfolioId ?? 'admin'],
    queryFn: async () => {
      const params = portfolioId ? { portfolio_id: portfolioId } : {}
      const { data } = await api.get('/api/v1/menus', { params })
      return data
    },
  })
}

export function useCreateMenu() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/menus', payload)
      return data
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

export function useUpdateMenu() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`/api/v1/menus/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  })
}

export function useDeleteMenu() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/menus/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  })
}

export function useReorderMenus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (moves) => {
      const { data } = await api.patch('/api/v1/menus/reorder', { moves })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  })
}

export function flattenTree(nodes, depth = 0) {
  const result = []
  for (const node of nodes) {
    result.push({ ...node, depth })
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

export function buildMovesFromFlat(flat) {
  return flat.map((item, idx) => ({
    id: item.id,
    parent_id: item.parent_id ?? null,
    order: idx,
  }))
}
