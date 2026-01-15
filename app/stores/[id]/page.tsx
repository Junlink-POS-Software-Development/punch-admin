"use client";

import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import InventoryMonitor from "../components/inventory/InventoryMonitor";

import { useStore } from "../hooks/useStore";
import { useStoreStats } from "../hooks/useStoreStats";

export default function StoreDashboardPage() {
  const params = useParams();
  const storeId = params.id as string;

  const { data: store, isLoading: storeLoading } = useStore(storeId);
  const { data: stats, isLoading: statsLoading } = useStoreStats(storeId);

  const loading = storeLoading || statsLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (!store || !stats) {
    return <div className="p-8 text-center">Store not found</div>;
  }

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/stores"
          className="hover:bg-muted p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-foreground text-2xl">
            {store.store_name}
          </h1>
          <p className="text-muted-foreground text-sm">Dashboard Overview</p>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Inventory Section */}
      <InventoryMonitor storeId={storeId} />

      {/* Placeholder for future sections (Charts/Tables) */}
      <div className="bg-card p-8 border border-border rounded-xl text-muted-foreground text-center">
        <p>Transaction history and charts will appear here.</p>
      </div>
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
