"use client";

import countriesData from "@/data/countries.json";

export interface Country {
  code: string;
  name: string;
}

export function useCountries(locale: string = "en") {
  const countries: Country[] = countriesData.map((c) => ({
    code: c.code,
    name: c.name, 
  }));

  return { countries, loading: false, error: null };
}