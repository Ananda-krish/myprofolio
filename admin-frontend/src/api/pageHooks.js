import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/apiConfig'

export function usePagesForChannel(channelId) {
  return useQuery({
    queryKey: ['pages', channelId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/portfolios/${channelId}/pages`)
      return data
    },
    enabled: !!channelId,
  })
}

export function usePage(channelId, pageId) {
  return useQuery({
    queryKey: ['pages', channelId, pageId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/portfolios/${channelId}/pages/${pageId}`)
      return data
    },
    enabled: !!channelId && !!pageId,
  })
}

export function useCreatePage(channelId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/api/v1/portfolios/${channelId}/pages`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages', channelId] }),
  })
}

export function useUpdatePage(channelId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`/api/v1/portfolios/${channelId}/pages/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages', channelId] }),
  })
}

export function useDeletePage(channelId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/portfolios/${channelId}/pages/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages', channelId] }),
  })
}

export function useReorderPages(channelId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (moves) => {
      const { data } = await api.patch(`/api/v1/portfolios/${channelId}/pages/reorder`, { moves })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages', channelId] }),
  })
}
