import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StoreStats {
  cash_on_hand: number;
  daily_gross_income: number;
  daily_expenses: number;
  monthly_gross_income: number;
}

interface StoreOverviewProps {
  stats: StoreStats;
}

export default function StoreOverview({ stats }: StoreOverviewProps) {
  return (
    <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Cash on Hand"
        value={stats.cash_on_hand}
        icon={Wallet}
        description="Categorized Balance"
        trend="neutral"
      />
      <StatCard
        title="Daily Gross"
        value={stats.daily_gross_income}
        icon={TrendingUp}
        description="Today's Sales"
        trend="positive"
      />
      <StatCard
        title="Daily Expenses"
        value={stats.daily_expenses}
        icon={TrendingDown}
        description="Today's Costs"
        trend="negative"
      />
      <StatCard
        title="Monthly Gross"
        value={stats.monthly_gross_income}
        icon={Calendar}
        description="Current Month"
        trend="positive"
      />
    </div>
  );
}

// Sub-component for clean cards
function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  trend: "positive" | "negative" | "neutral";
}) {
  const formatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  });

  return (
    <div className="bg-card shadow-sm p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center space-y-0 pb-2">
        <p className="font-medium text-muted-foreground text-sm">{title}</p>
        <Icon
          className={cn(
            "w-4 h-4",
            trend === "positive"
              ? "text-green-500"
              : trend === "negative"
              ? "text-red-500"
              : "text-blue-500"
          )}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-2xl">{formatter.format(value)}</h3>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  );
}
