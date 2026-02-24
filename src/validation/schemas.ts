import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const organizationCreateSchema = z.object({
  name: z.string().min(2).max(100),
  telegram_chat_id: z.string().optional(),
  users: z.array(z.string().email()).optional(),
})
export type OrganizationCreateValues = z.infer<typeof organizationCreateSchema>

export const addOrgUserSchema = z.object({
  email: z
    .string()
    .email()
    .refine((val) => val.endsWith('@sabahhub.com'), {
      message: 'Email must be @sabahhub.com domain',
    }),
})
export type AddOrgUserValues = z.infer<typeof addOrgUserSchema>

export const createApiKeySchema = z.object({
  description: z.string().max(200).optional(),
})
export type CreateApiKeyValues = z.infer<typeof createApiKeySchema>

export const createApplicationSchema = z.object({
  name: z.string().min(1).max(100),
  platform: z.enum(['django', 'reactjs', 'react_native', 'fastapi', 'nodejs', 'other']),
})
export type CreateApplicationValues = z.infer<typeof createApplicationSchema>
