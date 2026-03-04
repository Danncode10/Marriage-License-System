import worldCountries from "world-countries";

type WorldCountry = {
    name?: { common?: string };
};

export const COUNTRY_OPTIONS: string[] = Array.from(
    new Set(
        (worldCountries as WorldCountry[])
            .map((c) => (c?.name?.common || "").trim())
            .filter(Boolean)
    )
).sort((a, b) => a.localeCompare(b));

