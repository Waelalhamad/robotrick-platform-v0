import { useState } from 'react';
import type { ReactNode } from 'react';
import { Tab } from '@headlessui/react';
import { cn } from '../../lib/utils';

export interface TabItem {
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

export default function Tabs({
  items,
  defaultIndex = 0,
  onChange,
  variant = 'default',
  fullWidth = false,
  className,
}: TabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const handleChange = (index: number) => {
    setSelectedIndex(index);
    onChange?.(index);
  };

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={handleChange}>
      <Tab.List
        className={cn(
          'flex gap-1',
          variant === 'underline'
            ? 'border-b border-border'
            : 'bg-surface/50 p-1 rounded-lg',
          fullWidth && 'w-full',
          className
        )}
      >
        {items.map((item, index) => (
          <Tab
            key={index}
            disabled={item.disabled}
            className={({ selected }) =>
              cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium',
                'transition-all duration-200 focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                fullWidth && 'flex-1',
                variant === 'pills' && 'rounded-lg',
                variant === 'underline' && 'border-b-2',
                // Selected states
                selected
                  ? variant === 'pills'
                    ? 'bg-primary text-gray-900'
                    : variant === 'underline'
                    ? 'border-primary text-primary'
                    : 'bg-surface text-white shadow-sm'
                  : variant === 'underline'
                  ? 'border-transparent text-gray-400 hover:text-gray-200'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface/50'
              )
            }
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {items.map((item, index) => (
          <Tab.Panel
            key={index}
            className={cn(
              'rounded-lg focus:outline-none',
              'animate-fade-in'
            )}
          >
            {item.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}

// Vertical Tabs variant
export interface VerticalTabsProps extends Omit<TabsProps, 'fullWidth'> {
  width?: string;
}

export function VerticalTabs({
  items,
  defaultIndex = 0,
  onChange,
  variant = 'default',
  width = '200px',
  className,
}: VerticalTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const handleChange = (index: number) => {
    setSelectedIndex(index);
    onChange?.(index);
  };

  return (
    <Tab.Group
      selectedIndex={selectedIndex}
      onChange={handleChange}
      vertical
    >
      <div className={cn('flex gap-6', className)}>
        <Tab.List
          className="flex flex-col gap-1"
          style={{ width }}
        >
          {items.map((item, index) => (
            <Tab
              key={index}
              disabled={item.disabled}
              className={({ selected }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-left',
                  'transition-all duration-200 rounded-lg focus:outline-none',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  selected
                    ? variant === 'pills'
                      ? 'bg-primary text-gray-900'
                      : 'bg-surface text-white border-l-2 border-primary'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface/50'
                )
              }
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="flex-1">
          {items.map((item, index) => (
            <Tab.Panel
              key={index}
              className={cn(
                'rounded-lg focus:outline-none',
                'animate-fade-in'
              )}
            >
              {item.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </div>
    </Tab.Group>
  );
}
