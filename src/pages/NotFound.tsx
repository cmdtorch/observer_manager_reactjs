import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFound() {
  const { setHeader } = usePageHeader()
  useDocumentTitle('Observer Manager | Not Found')

  useEffect(() => {
    setHeader({
      title: 'Page not found',
      subtitle: 'The page you requested does not exist.',
    })
  }, [setHeader])

  return (
    <Card className="text-center">
      <div className="text-3xl font-semibold text-slate-900">Page not found</div>
      <div className="mt-2 text-sm text-slate-500">The page you requested does not exist.</div>
      <Button asChild className="mt-6">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </Card>
  )
}