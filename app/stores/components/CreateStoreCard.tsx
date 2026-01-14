'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createStore, uploadStoreImage } from '../services/storeService'
import { Plus, Store as StoreIcon, Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function CreateStoreCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    store_name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Philippines',
    enrollment_id: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let store_img = undefined
      if (image) {
        store_img = await uploadStoreImage(supabase, image)
      }

      await createStore(supabase, {
        store_name: formData.store_name,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        enrollment_id: formData.enrollment_id,
        store_img,
      })

      // Reset form and close
      setFormData({
        store_name: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Philippines',
        enrollment_id: '',
      })
      setImage(null)
      setImagePreview(null)
      setIsOpen(false)
      
      // Refresh page to show new store
      window.location.reload()
    } catch (error) {
      console.error('Failed to create store:', error)
      alert('Failed to create store. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/50 transition-all hover:border-primary hover:bg-muted"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Add New Store</p>
          <p className="text-sm text-muted-foreground">Expand your network</p>
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in duration-200">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">New Store</h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-1 hover:bg-muted"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div className="flex justify-center">
          <div className="relative h-24 w-24">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setImagePreview(null)
                  }}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="mt-1 text-[10px] text-muted-foreground">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <input
            required
            placeholder="Store Name"
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            placeholder="Enrollment ID (Optional)"
            value={formData.enrollment_id}
            onChange={(e) => setFormData({ ...formData, enrollment_id: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              placeholder="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Create Store'
          )}
        </button>
      </form>
    </div>
  )
}
