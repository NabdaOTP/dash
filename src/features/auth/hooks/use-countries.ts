"use client";

import { useState, useEffect } from "react";

export interface Country {
  code: string;
  name: string;
  flag: string;
}

interface RestCountry {
  cca2: string;
  name: { common: string };
  translations: { ara?: { common: string } };
  flag: string;
}


const countriesCache: Record<string, Country[]> = {};

async function fetchCountries(locale: string): Promise<Country[]> {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=cca2,name,flag,translations"
  );
  if (!response.ok) throw new Error("Failed to fetch countries");
  const data: RestCountry[] = await response.json();

  return data
    .map((country) => ({
      code: country.cca2,
      name:
        locale === "ar" && country.translations.ara
          ? country.translations.ara.common
          : country.name.common,
      flag: country.flag,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

export function useCountries(locale: string = "en") {
  const [countries, setCountries] = useState<Country[]>(
    () => countriesCache[locale] ?? []
  );
  const [loading, setLoading] = useState(() => !countriesCache[locale]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countriesCache[locale]) return; // ✅ skip لو محملين قبل كده

    setLoading(true);
    fetchCountries(locale)
      .then((data) => {
        countriesCache[locale] = data;
        setCountries(data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load countries")
      )
      .finally(() => setLoading(false));
  }, [locale]);

  return { countries, loading, error };
}