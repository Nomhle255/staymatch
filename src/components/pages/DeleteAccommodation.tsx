'use client'

import { useState } from 'react'
import { Trash2, X } from 'lucide-react'

type DeleteAccommodationProps = {
  accommodationId: string
  onDeleted: () => void
}

export default function DeleteAccommodation({
  accommodationId,
  onDeleted,
}: DeleteAccommodationProps) {
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleDelete = async () => {
    try {
      setDeleting(true)
      setError('')
      setSuccessMessage('')

      const response = await fetch(
        `/api/accommodationlistings/${accommodationId}`,
        {
          method: 'DELETE',
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete accommodation.')
      }

      setShowModal(false)
      onDeleted()

      setSuccessMessage('Listing deleted successfully.')

      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Delete accommodation error:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Delete button */}
      <button
        type="button"
        onClick={() => {
          setError('')
          setShowModal(true)
        }}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-300 hover:text-rose-500"
        aria-label="Delete accommodation"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* Success message */}
      {successMessage && (
        <div className="fixed right-6 top-6 z-[60] flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg">
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-600 hover:text-emerald-800"
            aria-label="Dismiss success message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Delete Listing
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to delete this accommodation listing?
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => !deleting && setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close delete dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!deleting) {
                    setShowModal(false)
                    setError('')
                  }
                }}
                disabled={deleting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}