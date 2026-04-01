const COUNTRY_BY_DIAL_PREFIX: Array<{ prefix: string; country: string }> = [
  { prefix: "91", country: "India" },
  { prefix: "1", country: "United States/Canada" },
  { prefix: "44", country: "United Kingdom" },
  { prefix: "971", country: "UAE" },
  { prefix: "966", country: "Saudi Arabia" },
  { prefix: "65", country: "Singapore" },
  { prefix: "61", country: "Australia" },
  { prefix: "81", country: "Japan" },
];

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function toWhatsAppDigits(mobile: string): string {
  const digits = digitsOnly(mobile);
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function inferCountryFromMobile(mobile: string): string {
  const digits = digitsOnly(mobile);
  for (const item of COUNTRY_BY_DIAL_PREFIX) {
    if (digits.startsWith(item.prefix)) return item.country;
  }
  if (digits.length === 10) return "India";
  return "Unknown";
}
