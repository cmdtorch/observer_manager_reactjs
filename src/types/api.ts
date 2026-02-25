export interface ApiKeyDetail {
  id: string
  key_masked: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface ApiKeyListItem {
  id: string
  key_masked: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface ApplicationDetail {
  id: string
  name: string
  platform: string | null
  glitchtip_dsn: string | null
  created_at: string
}

export interface ApplicationListItem {
  id: string
  name: string
  platform: string | null
  glitchtip_dsn: string | null
  created_at: string
}

export interface CreateApiKeyRequest {
  description?: string | null
}

export interface CreateApiKeyResponse {
  id: string
  key: string
  description: string | null
  organization: string
  created_at: string
}

export interface CreateApplicationRequest {
  name: string
  platform?: string | null
}

export interface CreateApplicationResponse {
  id: string
  name: string
  platform: string | null
  glitchtip_dsn: string | null
  otlp_endpoint: string
  resource_attributes: Record<string, unknown>
  instructions: string
}

export interface CreateOrganizationRequest {
  name: string
  telegram_group_id?: string | null
  users?: string[] | null
}

export interface CreateOrganizationResponse {
  id: string
  name: string
  slug: string
  scope_org_id: string
  grafana_org_id: number | null
  grafana_url: string
  glitchtip_org_id: number | null
  glitchtip_slug: string | null
  glitchtip_url: string
  api_key: string
  otlp_endpoint: string
  otlp_headers: Record<string, unknown>
  invited_users: string[]
  telegram_configured: boolean
}

export interface DeleteApiKeyResponse {
  message: string
  key_id: string
}

export interface DeleteApplicationResponse {
  message: string
  app_id: string
}

export interface DeleteOrganizationResponse {
  message: string
  organization_id: string
  name: string
}

export interface DeleteUserResponse {
  user_id: string
  grafana_deleted: boolean
  glitchtip_deleted: boolean
}

export interface HTTPValidationError {
  detail?: ValidationError[]
}

export interface HealthResponse {
  status: string
  version: string
}

export interface InviteUsersRequest {
  emails: string[]
  grafana_role?: string
  glitchtip_role?: string
}

export interface InviteUsersResponse {
  results: Record<string, unknown>[]
}

export interface OrgUserAddRequest {
  user_id?: string | null
  email?: string | null
}

export interface OrganizationDetail {
  id: string
  name: string
  slug: string
  grafana_org_id: number | null
  glitchtip_org_id: number | null
  glitchtip_slug: string | null
  telegram_group: TelegramGroupRead | null
  telegram_group_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  api_keys: ApiKeyDetail[]
  applications: ApplicationDetail[]
  users: UserRead[]
}

export interface OrganizationListItem {
  id: string
  name: string
  slug: string
  grafana_org_id: number | null
  glitchtip_org_id: number | null
  glitchtip_slug: string | null
  telegram_group_id: string | null
  telegram_group_name: string | null
  is_active: boolean
  created_at: string
}

export interface ResendInviteRequest {
  email: string
}

export interface ResendInviteResponse {
  email: string
  grafana_invited: boolean
  grafana_invite_link: string | null
  glitchtip_invited: boolean
  glitchtip_invite_link: string | null
}

export interface SetupTelegramRequest {
  telegram_group_id: string
}

export interface SetupTelegramResponse {
  org_id: string
  telegram_group_id: string
  telegram_group_name: string
  message: string
}

export interface SyncOrganizationResponse {
  id: string
  name: string
  slug: string
  grafana_org_id: number | null
  glitchtip_org_id: number | null
  glitchtip_slug: string | null
  users_synced: number
  message: string
}

export interface TelegramWebhookResponse {
  ok: boolean
  message: string
}

export interface TelegramGroupCreate {
  name: string
  chat_id: string
  org_id?: string | null
}

export interface TelegramGroupUpdate {
  name?: string | null
  org_id?: string | null
}

export interface TelegramGroupRead {
  id: string
  name: string
  chat_id: string
  org_id: string | null
  org_name: string | null
  created_at: string
  updated_at: string
}

export interface UserRead {
  id: string
  email: string
  grafana_id: number | null
  grafana_invite_url: string | null
  glitchtip_id: number | null
  glitchtip_invite_url: string | null
  needs_grafana_sync: boolean
  needs_glitchtip_sync: boolean
  created_at: string
  updated_at: string
}

export interface ValidationError {
  loc: Array<string | number>
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}
