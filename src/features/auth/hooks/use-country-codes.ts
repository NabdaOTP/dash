"use client";

import codesData from "@/data/country-codes.json";

export interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
}

export function useCountryCodes(locale: string = "en") {
  const countryCodes: CountryCode[] = codesData.map((c) => ({
    code: c.code,
    dialCode: c.dial_code, 
    name: c.name,
  }));

  return { countryCodes, loading: false, error: null };
}