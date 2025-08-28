import { cn } from '@/lib/utils';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';

interface TogglePasswordProps {
  showPassword: boolean;
  setShowPassword: (arg: boolean) => void;
  className?: string;
}

export default function TogglePassword({
  showPassword = false,
  setShowPassword,
  className,
}: TogglePasswordProps) {
  return (
    <span
      className={cn('absolute right-4 top-10 cursor-pointer', className)}
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        <EyeOpenIcon className="w-4 h-4" />
      ) : (
        <EyeClosedIcon className="w-4 h-4" />
      )}
    </span>
  );
}
