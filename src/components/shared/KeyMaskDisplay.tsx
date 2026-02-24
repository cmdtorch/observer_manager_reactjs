import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface KeyMaskDisplayProps {
  masked: string
  fullKey?: string | null
}

export function KeyMaskDisplay({ masked, fullKey }: KeyMaskDisplayProps) {
  const [copied, setCopied] = useState(false)
  const display = masked || (fullKey ? `********${fullKey.slice(-4)}` : '********')

  const handleCopy = async () => {
    if (!fullKey) return
    await navigator.clipboard.writeText(fullKey)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm text-slate-700">{display}</span>
      {fullKey ? (
        <button
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          onClick={handleCopy}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      ) : null}
    </div>
  )
}
