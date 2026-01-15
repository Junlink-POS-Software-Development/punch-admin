"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Package, Receipt, History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import InventoryMonitor from "../components/inventory/InventoryMonitor";
import StoreOverview from "../components/StoreOverview";
import StoreExpenses from "../components/StoreExpenses";
import StoreTransactions from "../components/StoreTransactions";

import { useStore } from "../hooks/useStore";
import { useStoreStats } from "../hooks/useStoreStats";

type Tab = "overview" | "inventory" | "expenses" | "transactions";

export default function StoreDashboardPage() {
  const params = useParams();
  const storeId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: History,
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: Receipt,
    },
  ] as const;

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

      {/* Custom Tabs Navigation */}
      <div className="border-b">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex items-center gap-2 pb-3 text-sm font-medium transition-all relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && <StoreOverview stats={stats} />}
        {activeTab === "inventory" && <InventoryMonitor storeId={storeId} />}
        {activeTab === "transactions" && <StoreTransactions storeId={storeId} />}
        {activeTab === "expenses" && <StoreExpenses />}
      </div>
    </div>
  );
}
