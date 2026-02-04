'use client'

import { Mail, Phone, MessageCircle } from 'lucide-react'

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Account Deactivated
          </h1>
          <p className="text-muted-foreground">
            Your admin account has been deactivated. If you believe this was a mistake or would like to restore your account, please contact our support team.
          </p>
        </div>

        {/* Contact Options */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Contact Us</h2>
          
          <div className="space-y-3 text-left">
            <a
              href="mailto:support@junlink.com"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email Support</p>
                <p className="text-sm text-muted-foreground">support@junlink.com</p>
              </div>
            </a>

            <a
              href="tel:+639123456789"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Phone Support</p>
                <p className="text-sm text-muted-foreground">+63 912 345 6789</p>
              </div>
            </a>

            <a
              href="https://m.me/junlink"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Messenger</p>
                <p className="text-sm text-muted-foreground">m.me/junlink</p>
              </div>
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-muted-foreground">
          Account recovery typically takes 1-3 business days after verification.
        </p>
      </div>
    </div>
  )
}
