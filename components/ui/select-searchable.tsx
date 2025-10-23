// components/ui/select-searchable.tsx
"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectSearchableProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectSearchable({
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  options,
  emptyMessage = "No se encontraron resultados.",
  searchPlaceholder = "Buscar...",
  className,
  disabled = false,
}: SelectSearchableProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={"full"}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            "flex-1 w-full",
            "min-h-[40px]",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate flex-1">
            {selectedOption ? (
              <span className="truncate">{selectedOption.label}</span>
            ) : (
              <span className="text-muted-foreground truncate">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 opacity-50 transition-transform",
              open && "rotate-180",
              disabled && "opacity-30"
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]"
        align="start"
        sideOffset={4}
        style={
          {
            "--radix-popover-trigger-width": "100%",
          } as React.CSSProperties
        }
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-7"
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    setSearchValue("");
                  }}
                  className={cn(
                    "cursor-pointer transition-colors",
                    "text-black hover:bg-green_xxl/20 hover:text-green_b",
                    "data-[selected=true]:bg-green_xxl/30"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
