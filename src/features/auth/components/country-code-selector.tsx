"use client";

import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CountryCode } from "@/features/auth/hooks/use-country-codes";

interface CountryCodeSelectorProps {
  value: string;
  onChange: (dialCode: string) => void;
  countryCodes: CountryCode[];
  loading?: boolean;
  disabled?: boolean;
}

function CountryFlag({ code }: { code: string }) {
  return (
    <Image
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={code}
      width={24}
      height={16}
      className="rounded-sm"
    />
  );
}

export function CountryCodeSelector({
  value,
  onChange,
  countryCodes,
  loading = false,
  disabled = false,
}: CountryCodeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const selectedCountry = countryCodes.find((c) => c.dialCode === value);
  const filteredCountries = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dialCode.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-11 w-full justify-between bg-background text-foreground hover:bg-muted hover:text-foreground"
          disabled={disabled || loading}
        >
          <span className="flex items-center gap-2">
            {selectedCountry && (
              <>
                <CountryFlag code={selectedCountry.code} />
                <span>{selectedCountry.dialCode}</span>
              </>
            )}
            {!selectedCountry && !loading && (
              <span className="text-muted-foreground">Select code</span>
            )}
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5">
          <Input
            placeholder="Search by name, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 text-sm"
            dir="ltr"
          />
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {filteredCountries.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              No countries found
            </div>
          ) : (
            filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  onChange(country.dialCode);
                  setOpen(false);
                  setSearchTerm("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors text-foreground cursor-pointer"
              >
                <CountryFlag code={country.code} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{country.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {country.dialCode}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
