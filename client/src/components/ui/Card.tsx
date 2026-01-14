import type { ReactNode, HTMLAttributes } from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface CardProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'premium';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  hover?: boolean; // Alias for hoverable
  animated?: boolean;
  className?: string;
}

/**
 * Premium Card Component with Glassmorphism and Animations
 * Enhanced for world-class UI/UX
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  hover = false,
  animated = true,
  className,
  ...props
}: CardProps) {
  const isHoverable = hoverable || hover;

  const variants = {
    default: 'bg-white border border-primary/20',
    elevated: 'bg-white border border-primary/20 shadow-lg',
    outlined: 'bg-transparent border-2 border-primary/30',
    glass: 'backdrop-blur-xl bg-white/90 border border-primary/20 shadow-[0_8px_32px_rgba(0,51,0,0.1)]',
    premium: 'backdrop-blur-xl bg-white/95 border border-primary/20 shadow-[0_8px_32px_rgba(0,51,0,0.15),0_1px_0_rgba(0,51,0,0.05)_inset]',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = isHoverable
    ? 'cursor-pointer hover:shadow-[0_8px_32px_rgba(0,51,0,0.2)] hover:border-primary/50 hover:-translate-y-1'
    : '';

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={
          isHoverable
            ? {
                scale: 1.02,
                transition: { type: 'spring', stiffness: 400, damping: 30 },
              }
            : undefined
        }
        className={cn(
          'rounded-xl transition-all duration-300',
          variants[variant],
          paddings[padding],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300',
        variants[variant],
        paddings[padding],
        hoverStyles,
        className
      )}
      {...(props as HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </div>
  );
}

// Card Header
export interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-[#003300]">{title}</h3>
        {description && (
          <p className="text-sm text-[#003300]/60 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

// Card Body
export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('text-[#003300]', className)}>{children}</div>;
}

// Card Footer
export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  divided?: boolean;
}

export function CardFooter({
  children,
  className,
  divided = false,
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'mt-4',
        divided && 'pt-4 border-t border-primary/10',
        className
      )}
    >
      {children}
    </div>
  );
}

// Stats Card variant with Premium Animations
export interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card
      variant="glass"
      hover
      className={cn('relative overflow-hidden group', className)}
    >
      {/* Gradient Glow Effect on Hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0
                   group-hover:from-primary/10 group-hover:to-secondary/10
                   transition-all duration-500 -z-10"
        initial={false}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#003300]/70 mb-2 font-medium">{label}</p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-3xl font-bold text-[#003300]"
          >
            {value}
          </motion.p>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                'inline-flex items-center gap-1 mt-2 text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              <motion.svg
                animate={{
                  y: trend.isPositive ? [0, -3, 0] : [0, 3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={cn('w-4 h-4', !trend.isPositive && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </motion.svg>
              {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>
        {icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20
                       border border-primary/20 text-primary
                       shadow-[0_0_20px_rgba(48,197,155,0.3)]"
          >
            {icon}
          </motion.div>
        )}
      </div>
    </Card>
  );
}

// Image Card variant
export interface ImageCardProps {
  image: string;
  imageAlt: string;
  title: string;
  description?: string;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ImageCard({
  image,
  imageAlt,
  title,
  description,
  footer,
  onClick,
  className,
}: ImageCardProps) {
  return (
    <Card
      padding="none"
      hoverable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="aspect-video w-full overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#003300] mb-1">{title}</h3>
        {description && <p className="text-sm text-[#003300]/60">{description}</p>}
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </Card>
  );
}

// Legacy compatibility export
export { Card as LegacyCard };
