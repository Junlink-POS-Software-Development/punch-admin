"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  getPendingInvitations, 
  acceptInvitation, 
  declineInvitation, 
  type Invitation 
} from "@/app/stores/services/storeService";
import { Check, X, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminInvites() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const invites = await getPendingInvitations(supabase, user.email);
      setInvitations(invites);
    }
    setLoading(false);
  };

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    const res = await acceptInvitation(supabase, id);
    if (res.success) {
      setInvitations(prev => prev.filter(i => i.id !== id));
      router.refresh();
    } else {
      alert(res.message);
    }
    setProcessingId(null);
  };

  const handleDecline = async (id: string) => {
    setProcessingId(id);
    const res = await declineInvitation(supabase, id);
    if (res.success) {
      setInvitations(prev => prev.filter(i => i.id !== id));
      router.refresh();
    } else {
      alert(res.message);
    }
    setProcessingId(null);
  };

  if (loading) return <div className="p-4 text-center text-sm text-muted-foreground">Loading invitations...</div>;

  if (invitations.length === 0) {
    return (
      <div className="bg-card border-border border rounded-xl p-6 text-center">
        <div className="bg-muted inline-flex justify-center items-center rounded-full w-12 h-12">
          <Mail className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-medium text-foreground">No Pending Invitations</h3>
        <p className="mt-2 text-muted-foreground text-sm">
          You don't have any pending invites to become a co-admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Pending Invitations</h3>
      <div className="grid gap-4">
        {invitations.map((invite) => (
          <div 
            key={invite.id} 
            className="flex sm:flex-row flex-col sm:items-center justify-between gap-4 bg-card border-border p-4 border rounded-xl"
          >
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Invitation to manage {invite.store_ids.length} store(s)
              </p>
              <p className="text-xs text-muted-foreground">
                Invited on {new Date(invite.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(invite.id)}
                disabled={!!processingId}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-lg text-primary-foreground text-sm font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                {processingId === invite.id ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => handleDecline(invite.id)}
                disabled={!!processingId}
                className="flex items-center gap-2 border-border hover:bg-accent disabled:opacity-50 border px-4 py-2 rounded-lg text-foreground text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
