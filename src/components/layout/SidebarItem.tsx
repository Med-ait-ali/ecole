import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
}

export function SidebarItem({ icon: Icon, label, to }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={twMerge(
        clsx(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
          isActive
            ? 'bg-green-600 text-white shadow-md'
            : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
        )
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
