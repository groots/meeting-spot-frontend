import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export default function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizes[size],
          className
        )}
      />
    </div>
  );
}
