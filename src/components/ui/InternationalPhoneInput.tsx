"use client";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type Props = {
  value: string;
  onChange: (digitsIncludingCountryCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

/**
 * Country flag + dial code + national number. `value` / onChange use digits only (includes country code, no +).
 * Default country: India (in).
 */
export function InternationalPhoneInput({ value, onChange, disabled, placeholder }: Props) {
  return (
    <PhoneInput
      country="in"
      preferredCountries={["in", "us", "gb", "ae", "sa", "sg"]}
      enableSearch
      countryCodeEditable={false}
      value={value}
      onChange={(phone) => onChange(phone)}
      disabled={disabled}
      placeholder={placeholder}
      inputProps={{
        name: "mobile",
        id: "mobile",
        required: false,
        "aria-label": "Mobile number",
      }}
      containerClass="phone-input-cosmic w-full !mb-0"
      inputClass="!w-full !rounded-xl !border !border-slate-700/90 !bg-slate-950/50 !py-3 !pl-[52px] !pr-4 !text-base !text-slate-100 !h-[50px] placeholder:!text-slate-500 focus:!border-amber-500/50 focus:!ring-2 focus:!ring-amber-500/30 !outline-none disabled:!opacity-60"
      buttonClass="!border !border-slate-700/90 !border-r-0 !rounded-l-xl !bg-slate-900/90 !pl-3 !pr-1"
      dropdownClass="!bg-slate-900 !text-slate-100 !rounded-lg !border !border-slate-700 !shadow-xl"
      searchClass="!bg-slate-950 !text-slate-100 !border-slate-700 !rounded-lg !mb-2"
      searchPlaceholder="Search country"
      searchNotFound="No matches"
    />
  );
}
