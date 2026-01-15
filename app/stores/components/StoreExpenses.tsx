import { Receipt } from "lucide-react";

export default function StoreExpenses() {
  return (
    <div className="flex flex-col justify-center items-center bg-card p-12 border border-border rounded-xl text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-muted/50 mb-4 p-4 rounded-full">
        <Receipt className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">Expenses Tracking</h3>
      <p className="max-w-sm text-muted-foreground text-sm mt-2">
        This feature is coming soon. You&apos;ll be able to track and categorize all
        store expenses here.
      </p>
    </div>
  );
}
