import { ShieldX } from "lucide-react";

export function AccessDeniedBanner() {
  return (
    <div className="bg-amber-500/10 mb-6 px-4 py-4 border border-amber-500/30 rounded-lg animate-slide-in-up">
      <div className="flex items-start gap-3">
        <ShieldX className="mt-0.5 w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <h3 className="mb-1 font-semibold text-amber-600 dark:text-amber-400">
            Access Denied
          </h3>
          <p className="text-muted-foreground text-sm">
            Member accounts cannot access the Admin Dashboard. Please
            sign in with an Admin account or contact your store
            administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}
