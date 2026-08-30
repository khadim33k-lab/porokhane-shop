import React from 'react'

function Icon({ children, size = 20, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const DashboardIcon = props => <Icon {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></Icon>
export const OrdersIcon = props => <Icon {...props}><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /></Icon>
export const ProductsIcon = props => <Icon {...props}><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM4.5 7.7 12 12l7.5-4.3M12 12v9" /></Icon>
export const StockIcon = props => <Icon {...props}><path d="M4 5h16v5H4zM5 10h14v10H5zM9 14h6" /></Icon>
export const StatsIcon = props => <Icon {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2 20h21" /></Icon>
export const SettingsIcon = props => <Icon {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></Icon>
export const LogoutIcon = props => <Icon {...props}><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></Icon>
export const MenuIcon = props => <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
export const ChevronLeftIcon = props => <Icon {...props}><path d="m14.5 6-6 6 6 6" /></Icon>
export const ChevronRightIcon = props => <Icon {...props}><path d="m9.5 6 6 6-6 6" /></Icon>
export const RevenueIcon = props => <Icon {...props}><path d="M4 18h16M6 15V9M12 15V5M18 15v-3" /><path d="m5 7 5-3 4 2 5-3" /></Icon>
export const AlertIcon = props => <Icon {...props}><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5M12 17.5v.1" /></Icon>
export const RefreshIcon = props => <Icon {...props}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M18.5 11A7 7 0 0 0 6 7.5L4 12M5.5 13A7 7 0 0 0 18 16.5l2-4.5" /></Icon>
