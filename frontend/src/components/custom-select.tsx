import { CheckIcon, ChevronDown, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type CustomSelectType = {
  loading?: boolean;
  mainClass?: string;
  options: Record<string, string>[];
  id?: string | number;
  selected: string;
  selectTwo?: string;
  label?: string;
  labelClass?: string;
  className?: string;
  disabled?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  canSearch?: boolean;
  emptyStateText?: string;
  setSelected: (event: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  touched?: boolean;
  error?: boolean;
};

export default function CustomSelect({
  options,
  selected,
  disabled,
  label,
  labelClass,
  setSelected,
  onBlur,
  canSearch = true,
  className,
  touched,
  error,
  isRequired,
  placeholder,
  mainClass,
  emptyStateText,
  selectTwo,
  loading,
}: CustomSelectType) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <div className={`mt-1 ${mainClass} `}>
      {label && (
        <label
          htmlFor={label}
          className={cn('block font-normal text-sm pb-1  relative', labelClass)}
        >
          {label}
          {isRequired && (
            <span className="inline-block text-red-400 text-lg pl-1 absolute bottom-1">
              *
            </span>
          )}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between bg-white relative',
              className,
              selected ? 'text-[#162238]' : '!text-[#9AA6AC] !font-light ',
              error && touched && 'border-red-500'
            )}
            ref={buttonRef}
            disabled={disabled}
            onBlur={onBlur}
          >
            {options && options[0]?.label === options[0]?.value
              ? selectTwo
                ? selectTwo
                : selected
                  ? options?.filter(
                      (option) =>
                        option?.value?.toString().toLowerCase() ===
                        selected?.toString().toLowerCase()
                    )[0]?.label
                  : placeholder
                    ? placeholder
                    : 'Select...'
              : selected
                ? options?.filter(
                    (option) =>
                      option?.value?.toString().toLowerCase() ===
                      selected?.toString().toLowerCase()
                  )[0]?.label
                : placeholder
                  ? placeholder
                  : 'Select...'}
            {/* {
                            selected ? options?.filter((option) => (option?.value?.toString().toLowerCase() || option?.label?.toString().toLowerCase()) === selected?.toString().toLowerCase())[0]?.label : "Select..."
                        } */}
            <ChevronDown className="absolute right-2 ml-2 h-6 w-6 text-[#8F8F8F] shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: `${buttonRef?.current?.offsetWidth}px` }}
        >
          <Command className="">
            {canSearch && (
              <CommandInput placeholder={`Search`} className="h-9" />
            )}
            {!loading ? (
              <CommandEmpty>
                {emptyStateText ? emptyStateText : 'No Record Found.'}
              </CommandEmpty>
            ) : null}
            <CommandGroup
              className="h-56  scroll-hidden"
              //   style={{ overflowY: "auto" }}
            >
              {loading ? (
                <div className="flex flex-col mt-5 justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin mr-1" />
                </div>
              ) : (
                <CommandList>
                  {options?.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setSelected(currentValue);
                        setOpen(false);
                      }}
                    >
                      {option.label}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          selected === option.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandList>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <span className={cn('text-xs text-red-500 hidden', error && 'block')}>
        {error && touched && error}
      </span>
    </div>
  );
}
