import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/apiConfig'

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/portfolios')
      return data
    },
  })
}

export function useChannel(id) {
  return useQuery({
    queryKey: ['channels', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/portfolios/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/portfolios', payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  })
}

export function useUpdateChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`/api/v1/portfolios/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  })
}

export function useDeleteChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/portfolios/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channels'] }),
  })
}
