import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './apiConfig'

export function useNavbarTemplates() {
  return useQuery({
    queryKey: ['navbar-templates'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/navbar-templates')
      return data
    },
  })
}

export function useNavbarTemplate(id) {
  return useQuery({
    queryKey: ['navbar-templates', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/navbar-templates/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateNavbarTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/navbar-templates', payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['navbar-templates'] }),
  })
}

export function useUpdateNavbarTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`/api/v1/navbar-templates/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['navbar-templates'] }),
  })
}

export function useDeleteNavbarTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/v1/navbar-templates/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['navbar-templates'] }),
  })
}
