"use client"

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

interface AdminDeleteButtonProps {
  itemType: string
  itemName: string
  onDelete: () => Promise<any>
}

export default function AdminDeleteButton({
  itemType,
  itemName,
  onDelete
}: AdminDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete this ${itemType} "${itemName}"? This action cannot be undone.`
    )
    if (!confirmed) return

    startTransition(async () => {
      try {
        await onDelete()
      } catch (err: any) {
        alert(err.message || `Failed to delete ${itemType}`)
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="outline"
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-[10px] font-bold h-6 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-900"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
