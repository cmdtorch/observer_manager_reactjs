import type { AxiosError } from 'axios'
import type { HTTPValidationError } from '@/types/api'

export function getValidationErrorMessage(error: AxiosError<HTTPValidationError>) {
  const detail = error.response?.data?.detail
  if (!detail || detail.length === 0) {
    return 'Validation failed. Please check your input.'
  }
  return detail.map((item) => item.msg).join(' ')
}
