'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, UserPlus, ArrowRightLeft, AlertTriangle } from 'lucide-react'
import { deleteAccountAction, DeletionType } from '../actions'

export default function AccountSettingsPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletionType, setDeletionType] = useState<DeletionType>('relinquish_ownership')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteAccount = () => {
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteAccountAction(deletionType)
      if (result.success) {
        router.push('/account-deleted')
      } else {
        setDeleteError(result.message)
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        {/* Invite New Admin */}
        <div className="flex items-start gap-4 pb-6 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Invite New Admin</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Invite another user to become an admin of your organization.
            </p>
            <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors">
              Send Invitation
            </button>
          </div>
        </div>

        {/* Transfer Ownership */}
        <div className="flex items-start gap-4 pb-6 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Transfer Ownership</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Transfer your admin ownership to another user. This action cannot be undone.
            </p>
            <button className="rounded-lg border border-amber-500 text-amber-500 px-4 py-2 text-sm font-medium hover:bg-amber-500/10 transition-colors">
              Transfer Ownership
            </button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Delete My Account</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently deactivate your admin account. Choose what happens to your stores.
            </p>
            
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-4 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Are you sure?</span>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deletionType"
                      value="relinquish_ownership"
                      checked={deletionType === 'relinquish_ownership'}
                      onChange={(e) => setDeletionType(e.target.value as DeletionType)}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium text-foreground">Keep stores active</span>
                      <p className="text-sm text-muted-foreground">
                        Your stores and members will remain operational, but without an owner.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deletionType"
                      value="terminate_stores"
                      checked={deletionType === 'terminate_stores'}
                      onChange={(e) => setDeletionType(e.target.value as DeletionType)}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium text-foreground">Close all stores</span>
                      <p className="text-sm text-muted-foreground">
                        All your stores will be deactivated. Members will see a &quot;Store Deactivated&quot; message.
                      </p>
                    </div>
                  </label>
                </div>

                {deleteError && (
                  <p className="text-sm text-red-500">{deleteError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isPending}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteError(null)
                    }}
                    disabled={isPending}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
