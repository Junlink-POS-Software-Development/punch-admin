"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
// Button and Input imports removed
import { 
  sendCoAdminInvite, 
  getStorePendingInvitations, 
  syncCoAdminAccess,
  type Invitation 
} from "../services/storeService";
import { UserPlus, X, Clock, Trash2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface ManageAdminsProps {
  storeId: string;
  currentCoAdmins: string[]; // List of co-admin IDs
  ownerId: string;
}

export default function ManageAdmins({ storeId, currentCoAdmins, ownerId }: ManageAdminsProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Fetch pending invitations on mount
  useEffect(() => {
    fetchInvitations();
  }, [storeId]);

  const fetchInvitations = async () => {
    const invites = await getStorePendingInvitations(supabase, storeId);
    setInvitations(invites);
  };

  const handleInvite = async () => {
    if (!email) return;

    // UI-level limit: only allow invite if current co-admins < 3
    if (currentCoAdmins.length >= 3) {
      setMessage({ text: "Max limit of 3 co-admins reached.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await sendCoAdminInvite(supabase, [storeId], email);
      if (res.success) {
        setMessage({ text: res.message, type: "success" });
        setEmail("");
        fetchInvitations(); // Refresh list
      } else {
        setMessage({ text: res.message, type: "error" });
      }
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to send invite", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to remove this co-admin?")) return;

    setLoading(true);
    try {
      // Logic: syncCoAdminAccess expects the NEW list of stores for a user.
      // But here we are looking at a STORE and removing a USER.
      // The RPC 'sync_co_admin_access' takes (target_admin_id, target_store_ids).
      // So effectively we need to know what OTHER stores this admin has access to, 
      // minus this one.
      // Wait, if I am defining the access from the Store perspective, it's tricky.
      // The prompt said: "sync_co_admin_access: When you want to give/remove access to specific stores later."
      // If I'm in Store A settings, and I want to kick Admin X.
      // I need to fetch Admin X's current store list, remove Store A, and call sync.
      
      // 1. Fetch current stores for this admin (Wait, I can't easily fetch access FOR another user via client without admin check potentially)
      // Actually, store.co_admins is an array on the Store.
      // The RPC `sync_co_admin_access` updates the user's access across stores? 
      // "Action on co_admins Array: Overwrites the presence of that user in the arrays based on a new list."
      // This implies the RPC iterates over the `target_store_ids` provided and ensures the user is in them?
      // And for stores NOT in the list? Does it remove them?
      // "Overwrites the presence of that user in the arrays based on a new list." -> 
      // This sounds like: For the provided stores, ensure user is there. 
      // It doesn't explicitly say it removes them from stores NOT in the list.
      // However, usually 'sync' implies making state match.
      // If the RPC is "update these specific stores to include the user", that's `add`.
      // If the RPC is "set the user's access to EXACTLY these stores", then omitting one removes it.
      
      // Let's re-read: "When you want to give/remove access to specific stores later. Overwrites the presence of that user in the arrays based on a new list."
      // It sounds like I give a list of stores the user SHOULD have.
      // If I want to remove them from Store A, I need to know they have A, B, C. And send [B, C].
      
      // BUT, from the Store Dashboard, I might only know about Store A.
      // If I don't know they have B and C, and I send [], I might wipe their access to B and C?
      // That would be dangerous.
      // ALTERNATIVE: Use a simpler approach for now or clarify.
      // Or, maybe I just manually update the store array locally and save?
      // But I recall the prompt appearing to prefer RPCs for valid actions.
      
      // Let's assume for `ManageAdmins` (Single Store View), "Removing" a co-admin might be best handled by an RPC that removes a specific user from specific store.
      // But I don't have that RPC. I have `sync_co_admin_access`.
      
      // If I am uncertain, I should probably disable "Remove" from this view IF I can't do it safely, OR
      // I can implement a loop:
      // 1. We know the user ID.
      // 2. We can't easily see their other stores if RLS hides them. (As an owner of Store A, do I have right to know if Co-Admin is also on Store B?)
      // Probably not.
      
      // Wait, if `co_admins` is just an array on `public.stores`.
      // I can simply update the specific store record to remove the UUID from the array!
      // I have `useStore` hook which allows updating store? existing services?
      // `createStore`, `archiveStore`... I don't see a generic `updateStore`.
      
      // If I can't use `sync_co_admin_access` safely without knowing global state, 
      // AND I'm in a specific store context,
      // I should write a quick specialized client-side update (using supabase .update()) to just pop the ID from the array.
      // RLS Policy for `stores`: "Owners can update their own stores".
      // So specific array manipulation is standard.
      
      // I'll implement "Remove" by directly updating the `stores` table `co_admins` array for THIS store.
      
      const newCoAdmins = currentCoAdmins.filter(id => id !== adminId);
      
      const { error } = await supabase
        .from('stores')
        .update({ co_admins: newCoAdmins })
        .eq('store_id', storeId);

      if (error) throw error;
      
      setMessage({ text: "Co-admin removed.", type: "success" });
      router.refresh();

    } catch (error: any) {
      console.error(error);
      setMessage({ text: "Failed to remove co-admin", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border-border border rounded-xl p-6">
        <h2 className="mb-4 font-semibold text-lg">Manage Co-Admins</h2>
        <p className="mb-6 text-muted-foreground text-sm">
          Invite users to help manage this store. You can have up to 3 co-admins.
        </p>

        {/* Invite Form */}
        <div className="flex gap-3 mb-6">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-background border-input px-3 py-2 border rounded-md text-sm"
          />
          <button
            onClick={handleInvite}
            disabled={loading || currentCoAdmins.length >= 3}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-md font-medium text-primary-foreground text-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "Sending..." : "Invite"}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
            {message.text}
          </div>
        )}

        {/* Co-Admins List */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Active Co-Admins ({currentCoAdmins.length}/3)</h3>
          
          {currentCoAdmins.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No co-admins yet.</p>
          ) : (
            <div className="space-y-2">
              {currentCoAdmins.map((adminId) => (
                <div key={adminId} className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 flex justify-center items-center rounded-full w-8 h-8 text-primary text-xs">
                      ID
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground truncate w-48 sm:w-auto">
                        {adminId}
                        {/* Ideally we would resolve this ID to a name/email, but that requires fetching user profiles. 
                            For now, displaying ID or we could fetch profiles in parent component. 
                            Given constraint, I'll show ID. */}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCoAdmin(adminId)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
                    title="Remove Access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="flex items-center gap-2 font-medium text-sm">
              <Clock className="w-4 h-4" />
              Pending Invitations
            </h3>
            <div className="space-y-2">
              {invitations.map((invite) => (
                <div key={invite.id} className="flex justify-between items-center bg-yellow-500/5 border-yellow-500/20 border p-3 rounded-md">
                  <span className="text-sm">{invite.invitee_email}</span>
                  <span className="bg-yellow-500/20 text-yellow-600 text-xs px-2 py-0.5 rounded-full">Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
