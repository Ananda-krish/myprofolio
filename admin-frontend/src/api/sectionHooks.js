import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/apiConfig'

export function useSectionsForPage(portfolioId, pageId) {
  return useQuery({
    queryKey: ['sections', portfolioId, pageId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/portfolios/${portfolioId}/pages/${pageId}/sections`)
      return data
    },
    enabled: !!portfolioId && !!pageId,
  })
}

export function useSection(portfolioId, pageId, sectionId) {
  return useQuery({
    queryKey: ['sections', portfolioId, pageId, sectionId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/portfolios/${portfolioId}/pages/${pageId}/sections/${sectionId}`)
      return data
    },
    enabled: !!portfolioId && !!pageId && !!sectionId,
  })
}

export function useCreateSection(portfolioId, pageId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/api/v1/portfolios/${portfolioId}/pages/${pageId}/sections`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sections', portfolioId, pageId] }),
  })
}

export function useUpdateSection(portfolioId, pageId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`/api/v1/portfolios/${portfolioId}/pages/${pageId}/sections/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sections', portfolioId, pageId] }),
  })
}

export function useDeleteSection(portfolioId, pageId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/portfolios/${portfolioId}/pages/${pageId}/sections/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sections', portfolioId, pageId] }),
  })
}

export function useReorderSections(portfolioId, pageId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (moves) => {
      const { data } = await api.patch(`/api/v1/portfolios/${portfolioId}/pages/${pageId}/sections/reorder`, { moves })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sections', portfolioId, pageId] }),
  })
}
