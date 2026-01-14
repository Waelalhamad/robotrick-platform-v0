import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownItem {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownProps) {
  const alignmentClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
  };

  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <Menu.Button className="w-full">{trigger}</Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            'absolute z-dropdown mt-2 w-56 rounded-lg',
            'bg-surface border border-border shadow-xl',
            'focus:outline-none overflow-hidden',
            alignmentClasses[align]
          )}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Fragment key={index}>
                {item.divider ? (
                  <div className="my-1 h-px bg-border" />
                ) : (
                  <Menu.Item disabled={item.disabled}>
                    {({ active }) => (
                      <button
                        onClick={item.onClick}
                        disabled={item.disabled}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          active && !item.disabled && 'bg-surface-hover',
                          item.danger
                            ? 'text-error hover:bg-error/10'
                            : 'text-gray-200'
                        )}
                      >
                        {item.icon && (
                          <span className="flex-shrink-0">{item.icon}</span>
                        )}
                        <span>{item.label}</span>
                      </button>
                    )}
                  </Menu.Item>
                )}
              </Fragment>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// Simple Dropdown Button variant
export interface DropdownButtonProps extends DropdownProps {
  buttonText: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function DropdownButton({
  buttonText,
  variant = 'outline',
  items,
  align,
  className,
}: DropdownButtonProps) {
  const variants = {
    primary: 'bg-primary text-gray-900 hover:bg-primary-600',
    secondary: 'bg-secondary text-white hover:bg-secondary-600',
    outline: 'border border-border hover:bg-surface text-gray-200',
  };

  return (
    <Dropdown
      trigger={
        <button
          className={cn(
            'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
            variants[variant]
          )}
        >
          {buttonText}
          <ChevronDown className="w-4 h-4" />
        </button>
      }
      items={items}
      align={align}
      className={className}
    />
  );
}
