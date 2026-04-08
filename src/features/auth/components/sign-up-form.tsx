"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/features/layout/components/language-switcher";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCountries } from "@/features/auth/hooks/use-countries";
import { useCountryCodes } from "@/features/auth/hooks/use-country-codes";
import { ApiError } from "@/lib/api-client";
import { CountryCodeSelector } from "./country-code-selector";
const _cache = {
  countries: null as any,
  codes: null as any,
};
export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const router = useRouter();
  const t = useTranslations("auth");
  const locale = useLocale();
  const { register, login } = useAuth();

  const { countries, loading: countriesLoading } = useCountries(locale);
  const { countryCodes, loading: codesLoading } = useCountryCodes(locale);

  const handleCountryChange = (selectedCode: string) => {
    setCountry(selectedCode);
    setCountryOpen(false);
    if (selectedCode) {
      const match = countryCodes.find((c) => c.code === selectedCode);
      if (match) setCountryCode(match.dialCode);
    }
  };
  const selectedCountryName = countries.find((c) => c.code === country)?.name;
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fullPhone = countryCode + phoneNumber;
      await register({ name, email, phone: fullPhone, password });
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        let errorMessage = err.message || t("errors.generic");

        if (errorMessage.toLowerCase().includes("must be a valid phone number")) {
          errorMessage = t("errors.validPhoneNumber") || "Must be a valid phone number";
        }

        setError(errorMessage);

      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <a href="https://www.nabdaotp.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
          <div className="h-14 w-14 flex items-center justify-center">
            <Image src="/logo.png" alt="Nabda OTP Logo" width={50} height={50} />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">Nabda OTP</span>
        </a>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-foreground">{t("signup.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("signup.subtitle")}</p>
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("signup.name")}</Label>
              <Input
                id="name" type="text" placeholder={t("signup.namePlaceholder")}
                value={name} onChange={(e) => setName(e.target.value)}
                className="h-11 bg-background" required disabled={loading}
              />
            </div>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("signup.email")}</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background" required disabled={loading}
              />
            </div>
            {/* Country — Combobox */}
            <div className="space-y-2">
              <Label>{t("signup.country")}</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    disabled={loading || countriesLoading}
                    className="w-full h-11 justify-between font-normal"
                  >
                    {countriesLoading ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </span>
                    ) : selectedCountryName ? (
                      <span>{selectedCountryName}</span>
                    ) : (
                      <span className="text-muted-foreground">{t("signup.selectCountry")}</span>
                    )}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((c) => (
                          <CommandItem
                            key={c.code}
                            value={c.name}
                            onSelect={() => handleCountryChange(c.code)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                country === c.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {/* Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="countryCode">{t("signup.countryCode")}</Label>
                <CountryCodeSelector
                  value={countryCode}
                  onChange={setCountryCode}
                  countryCodes={countryCodes}
                  loading={codesLoading}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("signup.phone")}</Label>
                <Input
                  id="phone" type="tel" placeholder={t("signup.phonePlaceholder")}
                  value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-11 bg-background" required disabled={loading} dir="ltr"
                />
              </div>
            </div>
            {/* Full number preview */}
            {countryCode && phoneNumber && (
              <p className="text-xs text-muted-foreground -mt-2">
                Full number:{" "}
                <span className="font-mono text-foreground">{countryCode}{phoneNumber}</span>
              </p>
            )}
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("signup.password")}</Label>
              <div className="relative">
                <Input
                  id="password" type={showPassword ? "text" : "password"}
                  placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-background pe-10"
                  required minLength={8} disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{t("signup.passwordHint")}</p>
            </div>
            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms" type="checkbox"
                checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={loading} required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-snug">
                {t("signup.termsAgree")}{" "}
                <a
                  href="https://www.nabdaotp.com/terms-of-service.html"
                  target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("signup.termsLink")}
                </a>
              </label>
            </div>
            <Button
              type="submit" disabled={loading || !agreedToTerms}
              className="w-full h-11 gradient-primary text-primary-foreground font-medium"
            >
              {loading ? t("signup.submitting") : t("signup.submit")}
            </Button>
          </form>
          <p className="text-center text-lg text-muted-foreground">
            <span className="text-muted-foreground">
              {t("signup.haveAccount")}{" "}
            </span>
            <Link href="/login" className="text-primary font-bold underline underline-offset-4 transition-all duration-200
               hover:text-primary/90 
               [text-shadow:0_1px_3px_rgb(168_85_247_/_0.3)] 
               hover:[text-shadow:0_2px_6px_rgb(168_85_247_/_0.5)]">
              {t("signup.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}