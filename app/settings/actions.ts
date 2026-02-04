'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type DeletionType = 'relinquish_ownership' | 'terminate_stores'

export interface DeleteAccountResult {
  success: boolean
  message: string
}

/**
 * Server action to soft-delete the admin account.
 * @param deletionType - 'relinquish_ownership' or 'terminate_stores'
 */
export async function deleteAccountAction(
  deletionType: DeletionType
): Promise<DeleteAccountResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('soft_delete_admin_account', {
    deletion_type: deletionType,
  })

  if (error) {
    console.error('Error deleting account:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while deleting your account.',
    }
  }

  // The RPC returns a jsonb object with success and message
  const result = data as { success: boolean; message: string }

  if (result.success) {
    revalidatePath('/settings')
  }

  return result
}
