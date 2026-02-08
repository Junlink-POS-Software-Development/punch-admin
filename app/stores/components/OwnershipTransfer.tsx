"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bulkTransferOwnership } from "../services/storeService";
import { AlertTriangle, ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface OwnershipTransferProps {
  currentCoAdmins: string[];
}

export default function OwnershipTransfer({ currentCoAdmins }: OwnershipTransferProps) {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleTransfer = async () => {
    if (!selectedAdmin) return;
    
    setLoading(true);
    try {
      const res = await bulkTransferOwnership(supabase, selectedAdmin);
      if (res.success) {
        alert("Ownership successfully transferred.");
        setIsOpen(false);
        router.refresh();
        // Force redirect maybe? user is no longer owner.
        // But let's assume router.refresh handles RLS updates eventually.
      } else {
        alert("Transfer failed: " + res.message);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border-border border rounded-xl p-6">
        <h2 className="mb-4 font-semibold text-lg">Transfer Ownership</h2>
        <p className="mb-6 text-muted-foreground text-sm">
          Transfer ownership of <strong>ALL</strong> your stores to a co-admin. 
          <br />
          <span className="text-destructive font-medium">Warning: This action is irreversible. You will lose owner privileges immediately.</span>
        </p>
        
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            disabled={currentCoAdmins.length === 0}
            className="flex items-center gap-2 border-amber-500 hover:bg-amber-500/10 disabled:opacity-50 border px-4 py-2 rounded-lg font-medium text-amber-500 text-sm transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer Ownership
          </button>
        ) : (
          <div className="bg-amber-500/5 border-amber-500/20 border p-4 rounded-lg">
            <h3 className="flex items-center gap-2 mb-4 font-bold text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Confirm Transfer
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 font-medium text-sm">Select New Owner</label>
                <select 
                  className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedAdmin}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                >
                  <option value="" disabled>Select a co-admin...</option>
                  {currentCoAdmins.map(id => (
                     <option key={id} value={id}>User ID: {id}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleTransfer}
                  disabled={loading || !selectedAdmin}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  {loading ? "Transferring..." : "Confirm & Transfer All Stores"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="border-border hover:bg-accent disabled:opacity-50 border px-4 py-2 rounded-lg text-foreground text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
