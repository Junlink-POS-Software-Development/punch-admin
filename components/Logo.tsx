import { cn } from '@/lib/utils/cn'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-10 h-10', className)}
      aria-label="JunLink Logo"
    >
      {/* Background shape - Hexagon-ish */}
      <path
        d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 L50 5Z"
        className="fill-primary"
        stroke="currentColor"
        strokeWidth="0"
      />
      
      {/* Abstract 'J' / Link shape */}
      <path
        d="M35 35 H65 V45 H45 V65 C45 70.5 49.5 75 55 75 C60.5 75 65 70.5 65 65 V55 H75 V65 C75 76 66 85 55 85 C44 85 35 76 35 65 V35Z"
        fill="white"
      />
      
      {/* Dot accent */}
      <circle cx="65" cy="35" r="5" fill="white" />
    </svg>
  )
}
