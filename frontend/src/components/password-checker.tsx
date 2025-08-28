import { CheckIcon } from '@radix-ui/react-icons';
import { cn } from '../lib/utils';

interface PasswordCheckerProps {
  title: string;
  isValid: boolean;
}

export default function PasswordChecker({
  title,
  isValid = false,
}: PasswordCheckerProps) {
  return (
    <span
      className={cn(
        'flex gap-3 text-[#9AA6AC] text-xs items-center',
        isValid && 'text-[#119C2B]'
      )}
    >
      <CheckIcon fontSize={8} /> {title}
    </span>
  );
}
