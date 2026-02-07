const EURO_COUNTRIES = [
  "PT", "ES", "FR", "DE", "IT", "NL", "BE", "IE", "AT", "FI", "SE", "NO"
];


export default function resolveCurrency(country: string | null) {
  if (country === "BR") return "BRL";
  if (country === "US") return "USD";
  if (country && EURO_COUNTRIES.includes(country)) return "EUR";
  return "EUR";
}