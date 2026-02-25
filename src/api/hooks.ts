import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import type {
  ApiKeyListItem,
  ApplicationListItem,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  CreateApplicationRequest,
  CreateApplicationResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  DeleteApiKeyResponse,
  DeleteApplicationResponse,
  DeleteOrganizationResponse,
  DeleteUserResponse,
  HealthResponse,
  InviteUsersRequest,
  InviteUsersResponse,
  OrganizationDetail,
  OrganizationListItem,
  ResendInviteRequest,
  ResendInviteResponse,
  SetupTelegramRequest,
  SetupTelegramResponse,
  SyncOrganizationResponse,
  TelegramGroupRead,
  TelegramGroupUpdate,
  UserRead,
  OrgUserAddRequest,
} from '@/types/api'

export const queryKeys = {
  health: ['health'] as const,
  organizations: ['organizations'] as const,
  organization: (orgId: string) => ['organizations', orgId] as const,
  orgUsers: (orgId: string) => ['organizations', orgId, 'users'] as const,
  orgKeys: (orgId: string) => ['organizations', orgId, 'keys'] as const,
  orgApps: (orgId: string) => ['organizations', orgId, 'apps'] as const,
  users: ['users'] as const,
  user: (userId: string) => ['users', userId] as const,
  apiKeys: ['api-keys'] as const,
  applications: ['applications'] as const,
  telegramGroups: ['telegram-groups'] as const,
}

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>('/api/health')
      return data
    },
    staleTime: 30000,
  })
}

export function useOrganizations(withoutTelegram?: boolean, enabled = true) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: ['organizations', { withoutTelegram }],
    queryFn: async () => {
      const { data } = await api.get<OrganizationListItem[]>('/api/organizations', {
        params: withoutTelegram ? { without_telegram: true } : undefined,
      })
      return data
    },
    staleTime: 30000,
    enabled: isAuthenticated && enabled,
  })
}

export function useOrganization(orgId: string) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: queryKeys.organization(orgId),
    queryFn: async () => {
      const { data } = await api.get<OrganizationDetail>(`/api/organizations/${orgId}`)
      return data
    },
    enabled: Boolean(orgId) && isAuthenticated,
    staleTime: 0,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateOrganizationRequest) => {
      const { data } = await api.post<CreateOrganizationResponse>('/api/organizations', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations })
    },
  })
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orgId: string) => {
      const { data } = await api.delete<DeleteOrganizationResponse>(
        `/api/organizations/${orgId}`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations })
    },
  })
}

export function useSyncOrganization(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<SyncOrganizationResponse>(
        `/api/organizations/${orgId}/sync`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers(orgId) })
    },
  })
}

export function useListApplications(orgId: string) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: queryKeys.orgApps(orgId),
    queryFn: async () => {
      const { data } = await api.get<ApplicationListItem[]>(
        `/api/organizations/${orgId}/apps`,
      )
      return data
    },
    enabled: Boolean(orgId) && isAuthenticated,
    staleTime: 30000,
  })
}

export function useCreateApplication(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateApplicationRequest) => {
      const { data } = await api.post<CreateApplicationResponse>(
        `/api/organizations/${orgId}/apps`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgApps(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
    },
  })
}

export function useDeleteApplication(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (appId: string) => {
      const { data } = await api.delete<DeleteApplicationResponse>(`/api/apps/${appId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgApps(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
    },
  })
}

export function useListApiKeys(orgId: string) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: queryKeys.orgKeys(orgId),
    queryFn: async () => {
      const { data } = await api.get<ApiKeyListItem[]>(
        `/api/organizations/${orgId}/keys`,
      )
      return data
    },
    enabled: Boolean(orgId) && isAuthenticated,
    staleTime: 30000,
  })
}

export function useCreateApiKey(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateApiKeyRequest) => {
      const { data } = await api.post<CreateApiKeyResponse>(
        `/api/organizations/${orgId}/keys`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgKeys(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
    },
  })
}

export function useDeleteApiKey(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (keyId: string) => {
      const { data } = await api.delete<DeleteApiKeyResponse>(`/api/keys/${keyId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgKeys(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
    },
  })
}

export function useInviteUsers(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: InviteUsersRequest) => {
      const { data } = await api.post<InviteUsersResponse>(
        `/api/organizations/${orgId}/invite`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers(orgId) })
    },
  })
}

export function useResendInvite(orgId: string) {
  return useMutation({
    mutationFn: async (payload: ResendInviteRequest) => {
      const { data } = await api.post<ResendInviteResponse>(
        `/api/organizations/${orgId}/invite/resend`,
        payload,
      )
      return data
    },
  })
}

export function useListUsers(orgId: string) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: queryKeys.orgUsers(orgId),
    queryFn: async () => {
      const { data } = await api.get<UserRead[]>(`/api/organizations/${orgId}/users`)
      return data
    },
    enabled: Boolean(orgId) && isAuthenticated,
    staleTime: 30000,
  })
}

export function useAddUserToOrg(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: OrgUserAddRequest) => {
      const { data } = await api.post<UserRead>(`/api/organizations/${orgId}/users`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers(orgId) })
    },
  })
}

export function useRemoveUserFromOrg(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete<DeleteUserResponse>(
        `/api/organizations/${orgId}/users/${userId}`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers(orgId) })
    },
  })
}

export function useSetupTelegram(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: SetupTelegramRequest) => {
      const { data } = await api.post<SetupTelegramResponse>(
        `/api/organizations/${orgId}/telegram`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(orgId) })
    },
  })
}

export function useCreateDefaultAlerts(orgId: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<Record<string, never>>(
        `/api/organizations/${orgId}/alerts/create-default`,
      )
      return data
    },
  })
}

export function useUsers() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const { data } = await api.get<UserRead[]>('/api/users')
      return data
    },
    staleTime: 30000,
    enabled: isAuthenticated,
  })
}

export function useUsersSearch(searchTerm: string) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: async () => {
      const { data } = await api.get<UserRead[]>('/api/users')
      return data
    },
    staleTime: 30000,
    enabled: isAuthenticated && searchTerm.length > 2,
  })
}

export function useUser(userId: string) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: async () => {
      const { data } = await api.get<UserRead>(`/api/users/${userId}`)
      return data
    },
    enabled: Boolean(userId) && isAuthenticated,
    staleTime: 0,
  })
}

export function useSyncUser(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<UserRead>(`/api/users/${userId}/sync`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })
}

export function useDeleteUserGlobal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete<DeleteUserResponse>(`/api/users/${userId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })
}

export function useAllApplications() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: queryKeys.applications,
    queryFn: async () => {
      const { data: orgs } = await api.get<OrganizationListItem[]>('/api/organizations')
      const entries = await Promise.all(
        orgs.map(async (org) => {
          const { data } = await api.get<ApplicationListItem[]>(
            `/api/organizations/${org.id}/apps`,
          )
          return data.map((app) => ({ app, organization: org }))
        }),
      )
      return entries.flat()
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  })
}

export function useAllApiKeys() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: queryKeys.apiKeys,
    queryFn: async () => {
      const { data: orgs } = await api.get<OrganizationListItem[]>('/api/organizations')
      const entries = await Promise.all(
        orgs.map(async (org) => {
          const { data } = await api.get<ApiKeyListItem[]>(
            `/api/organizations/${org.id}/keys`,
          )
          return data.map((key) => ({ key, organization: org }))
        }),
      )
      return entries.flat()
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  })
}

export function useTelegramGroups(unlinkedOnly?: boolean, enabled = true) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.encoded))
  return useQuery({
    queryKey: ['telegram-groups', { unlinkedOnly }],
    queryFn: async () => {
      const { data } = await api.get<TelegramGroupRead[]>('/api/telegram/groups', {
        params: unlinkedOnly ? { unlinked_only: true } : undefined,
      })
      return data
    },
    enabled: isAuthenticated && enabled,
    staleTime: 30000,
  })
}

export function useUpdateTelegramGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { groupId: string; payload: TelegramGroupUpdate }) => {
      const { data } = await api.patch<TelegramGroupRead>(
        `/api/telegram/groups/${params.groupId}`,
        params.payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telegramGroups })
    },
  })
}
