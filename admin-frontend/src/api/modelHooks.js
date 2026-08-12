import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/apiConfig'

export function useUploadModel(channelId, pageId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('model', file)
      const { data } = await api.post(
        `/api/v1/portfolios/${channelId}/pages/${pageId}/model`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages', channelId, pageId] }),
  })
}

export function useUpdateModelConfig(channelId, pageId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.patch(
        `/api/v1/portfolios/${channelId}/pages/${pageId}/model`,
        payload
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages', channelId, pageId] }),
  })
}

export function useDeleteModel(channelId, pageId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(
        `/api/v1/portfolios/${channelId}/pages/${pageId}/model`
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages', channelId, pageId] }),
  })
}
