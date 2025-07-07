import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ className, hover = false, children, ...props }: CardProps) {
  const Component = hover ? motion.div : 'div';
  
  return (
    <Component
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      {...(hover && {
        whileHover: { y: -2, shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' },
        transition: { duration: 0.2 }
      })}
      {...props}
    >
      {children}
    </Component>
  );
}