"use client";

import { useState, useEffect } from "react";

export interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
}

interface RestCountry {
  cca2: string;
  name: { common: string };
  idd?: { root?: string; suffixes?: string[] };
  translations: { ara?: { common: string } };
}


const codesCache: Record<string, CountryCode[]> = {};

async function fetchCountryCodes(locale: string): Promise<CountryCode[]> {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=cca2,name,idd,translations"
  );
  if (!response.ok) throw new Error("Failed to fetch country codes");
  const data: RestCountry[] = await response.json();

  return data
    .filter((country) => country.idd?.root)
    .map((country) => {
      const suffix = country.idd?.suffixes?.[0] || "";
      const dialCode = (country.idd?.root || "") + suffix;
      return {
        code: country.cca2,
        dialCode,
        name:
          locale === "ar" && country.translations.ara
            ? country.translations.ara.common
            : country.name.common,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

export function useCountryCodes(locale: string = "en") {
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>(
    () => codesCache[locale] ?? []
  );
  const [loading, setLoading] = useState(() => !codesCache[locale]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (codesCache[locale]) return; // ✅ skip لو محملين قبل كده

    setLoading(true);
    fetchCountryCodes(locale)
      .then((data) => {
        codesCache[locale] = data;
        setCountryCodes(data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load country codes")
      )
      .finally(() => setLoading(false));
  }, [locale]);

  return { countryCodes, loading, error };
}