import { Logo } from "@/components/Logo";

export function BrandingPanel() {
  return (
    <div className="hidden relative lg:flex flex-col justify-between bg-linear-to-br from-primary via-primary/90 to-primary/70 p-12 lg:w-1/2 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="top-0 left-0 absolute bg-white blur-3xl rounded-full w-72 h-72 -translate-x-1/2 -translate-y-1/2" />
        <div className="right-0 bottom-0 absolute bg-white blur-3xl rounded-full w-96 h-96 translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Desktop Logo */}
      <div className="z-10 relative">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center w-12 h-12">
            <Logo className="w-12 h-12 text-white" />
          </div>
          <span className="font-bold text-white text-2xl">JunLink Admin</span>
        </div>
      </div>

      <div className="z-10 relative">
        <h1 className="mb-4 font-bold text-white text-4xl leading-tight">
          Manage Your POS System
          <br />
          <span className="text-white/80">All in One Place</span>
        </h1>
        <p className="max-w-md text-white/70 text-lg">
          Track sales, manage members, monitor store performance, and gain
          insights with powerful analytics.
        </p>
      </div>

      <div className="z-10 relative text-white/50 text-sm">
        © 2026 JunLink. All rights reserved.
      </div>
    </div>
  );
}
