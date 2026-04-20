/** Locales with full in-app copy (UI strings). Other language codes fall back to English copy via {@link getCopy}. */
export type LanguageCode = "en" | "ml" | "ta";

/** Placeholder YouTube IDs — swap per language when you have real links. */
const MEDIA = {
  en: {
    orientationVideoId: "jfKfPfyJRdk",
    businessVideoId: "2vjPBrBU-TM",
    earningPdfUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  ml: {
    orientationVideoId: "jfKfPfyJRdk",
    businessVideoId: "2vjPBrBU-TM",
    earningPdfUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  ta: {
    orientationVideoId: "jfKfPfyJRdk",
    businessVideoId: "2vjPBrBU-TM",
    earningPdfUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
} as const;

export type Copy = {
  splash: { welcome: string; enter: string };
  language: { title: string; subtitle: string; continue: string };
  userForm: {
    title: string;
    nameLabel: string;
    mobileLabel: string;
    continue: string;
    namePlaceholder: string;
    mobilePlaceholder: string;
    errorName: string;
    errorMobile: string;
    errorInvalidNumber: string;
    alreadyRegistered: string;
    errorServer: string;
    submitError: string;
  };
  dashboard: {
    heroTitle: string;
    heroSubtitle: string;
    activateCta: string;
    progressTitle: string;
    progressSteps: [string, string, string, string];
    step1Title: string;
    step1Action: string;
    step2Title: string;
    step2ViewPdf: string;
    step2Download: string;
    step2Action: string;
    step3Title: string;
    step3Action: string;
    step4Title: string;
    step4Locked: string;
    joinCta: string;
    saving: string;
    errorLoad: string;
    errorSave: string;
    completePrevious: string;
    closeModal: string;
    stepDone: string;
    chatTitle: string;
    chatHint: string;
    whatsAppBar: string;
    referralTitle: string;
    referralHint: string;
    copyLink: string;
    copied: string;
    referralCountLabel: string;
    leadScoreLabel: string;
    shareLink: string;
    markStepComplete: string;
    openLink: string;
    logout: string;
    logoutConfirm: string;
  };
  faq: { q: string; a: string }[];
};

const copy: Record<LanguageCode, Copy> = {
  en: {
    splash: {
      welcome: "Welcome to 7Universe",
      enter: "Enter",
    },
    language: {
      title: "Choose your language",
      subtitle: "You can change this anytime in settings later.",
      continue: "Continue",
    },
    userForm: {
      title: "Tell us about you",
      nameLabel: "Name",
      mobileLabel: "Mobile number",
      continue: "Continue",
      namePlaceholder: "Your full name",
      mobilePlaceholder: "Phone number",
      errorName: "Please enter your name.",
      errorMobile: "Enter a valid phone number with country code.",
      errorInvalidNumber: "Invalid number",
      alreadyRegistered: "Already registered. Continuing…",
      errorServer: "Server error",
      submitError: "Could not save your details. Please try again.",
    },
    dashboard: {
      heroTitle: "Your 7Universe journey starts here",
      heroSubtitle:
        "Complete each step to unlock the final join link. Your progress syncs securely to your profile.",
      activateCta: "Activate Your Journey",
      progressTitle: "Your progress",
      progressSteps: ["Orientation", "Earning plan", "Next steps", "Join"],
      step1Title: "Step 1 — Orientation video",
      step1Action: "Mark as Watched",
      step2Title: "Step 2 — Earning plan (PDF)",
      step2ViewPdf: "View PDF",
      step2Download: "Download PDF",
      step2Action: "Mark as Understood",
      step3Title: "Step 3 — Start business video",
      step3Action: "I'm Ready",
      step4Title: "Step 4 — Join 7Universe",
      step4Locked: "Complete steps 1–3 to unlock",
      joinCta: "JOIN 7UNIVERSE NOW",
      saving: "Saving…",
      errorLoad: "Could not load your progress. Pull to refresh or try again.",
      errorSave: "Could not save. Check your connection and try again.",
      completePrevious: "Finish the previous steps first.",
      closeModal: "Close",
      stepDone: "Done",
      chatTitle: "Quick help",
      chatHint: "Tap a question to expand",
      whatsAppBar: "Chat on WhatsApp",
      referralTitle: "Your referral link",
      referralHint: "Share this link. When someone registers through it, it counts as your referral.",
      copyLink: "Copy link",
      copied: "Copied!",
      referralCountLabel: "Successful referrals",
      leadScoreLabel: "Lead score",
      shareLink: "Share",
      markStepComplete: "Mark as complete",
      openLink: "Open link",
      logout: "Log out",
      logoutConfirm: "Are you sure you want to log out?",
    },
    faq: [
      {
        q: "What is 7Universe?",
        a: "7Universe is your launchpad to learn the model, review the earning plan, and join when you are ready.",
      },
      {
        q: "How do I get support?",
        a: "Use the WhatsApp button for direct help, or browse quick answers in this panel.",
      },
      {
        q: "Where is my data stored?",
        a: "Your name, mobile, language, and step progress are stored in our secure database (Supabase) when you continue from the form.",
      },
    ],
  },
  ml: {
    splash: {
      welcome: "7Universe-ലേക്ക് സ്വാഗതം",
      enter: "പ്രവേശിക്കുക",
    },
    language: {
      title: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
      subtitle: "പിന്നീട് ക്രമീകരണങ്ങളിൽ നിന്ന് ഇത് മാറ്റാം.",
      continue: "തുടരുക",
    },
    userForm: {
      title: "നിങ്ങളെക്കുറിച്ച് പറയുക",
      nameLabel: "പേര്",
      mobileLabel: "മൊബൈൽ നമ്പർ",
      continue: "തുടരുക",
      namePlaceholder: "പൂർണ്ണ പേര്",
      mobilePlaceholder: "ഫോൺ നമ്പർ",
      errorName: "പേര് നൽകുക.",
      errorMobile: "രാജ്യ കോഡ് സഹിതം സാധുവായ ഫോൺ നമ്പർ നൽകുക.",
      errorInvalidNumber: "അസാധുവായ നമ്പർ",
      alreadyRegistered: "ഇതിനകം രജിസ്റ്റർ ചെയ്തിരിക്കുന്നു. തുടരുന്നു…",
      errorServer: "സെർവർ പിശക്",
      submitError: "വിവരങ്ങൾ സേവ് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
    },
    dashboard: {
      heroTitle: "നിങ്ങളുടെ 7Universe യാത്ര ഇവിടെ തുടങ്ങുന്നു",
      heroSubtitle:
        "അവസാന ജോയിൻ ലിങ്ക് അൺലോക്ക് ചെയ്യാൻ ഓരോ ഘട്ടവും പൂർത്തിയാക്കുക. നിങ്ങളുടെ പുരോഗതി പ്രൊഫൈലിലേക്ക് സുരക്ഷിതമായി സമന്വയിപ്പിക്കുന്നു.",
      activateCta: "നിങ്ങളുടെ യാത്ര സജീവമാക്കുക",
      progressTitle: "നിങ്ങളുടെ പുരോഗതി",
      progressSteps: ["ഓറിയന്റേഷൻ", "വരുമാന പ്ലാൻ", "അടുത്ത ഘട്ടങ്ങൾ", "ചേരുക"],
      step1Title: "ഘട്ടം 1 — ഓറിയന്റേഷൻ വീഡിയോ",
      step1Action: "കണ്ടതായി അടയാളപ്പെടുത്തുക",
      step2Title: "ഘട്ടം 2 — വരുമാന പ്ലാൻ (PDF)",
      step2ViewPdf: "PDF കാണുക",
      step2Download: "ഡൗൺലോഡ്",
      step2Action: "മനസ്സിലാക്കിയതായി അടയാളപ്പെടുത്തുക",
      step3Title: "ഘട്ടം 3 — ബിസിനസ് വീഡിയോ",
      step3Action: "ഞാൻ തയ്യാറാണ്",
      step4Title: "ഘട്ടം 4 — 7Universe-ൽ ചേരുക",
      step4Locked: "അൺലോക്ക് ചെയ്യാൻ 1–3 ഘട്ടങ്ങൾ പൂർത്തിയാക്കുക",
      joinCta: "ഇപ്പോൾ 7UNIVERSE-ൽ ചേരുക",
      saving: "സേവ് ചെയ്യുന്നു…",
      errorLoad: "പുരോഗതി ലോഡ് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
      errorSave: "സേവ് പരാജയപ്പെട്ടു. കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
      completePrevious: "മുമ്പത്തെ ഘട്ടങ്ങൾ ആദ്യം പൂർത്തിയാക്കുക.",
      closeModal: "അടയ്ക്കുക",
      stepDone: "പൂർത്തിയായി",
      chatTitle: "സഹായം",
      chatHint: "ചോദ്യം തുറക്കാൻ ടാപ്പ് ചെയ്യുക",
      whatsAppBar: "WhatsApp-ൽ ചാറ്റ് ചെയ്യുക",
      referralTitle: "നിങ്ങളുടെ റഫറൽ ലിങ്ക്",
      referralHint: "ഈ ലിങ്ക് പങ്കിടുക. ഈ വഴി ആരെങ്കിലും രജിസ്റ്റർ ചെയ്താൽ അത് നിങ്ങളുടെ റഫറലായി കണക്കാക്കും.",
      copyLink: "ലിങ്ക് പകർത്തുക",
      copied: "പകർത്തി!",
      referralCountLabel: "വിജയകരമായ റഫറലുകൾ",
      leadScoreLabel: "ലീഡ് സ്കോർ",
      shareLink: "പങ്കിടുക",
      markStepComplete: "പൂർത്തിയാക്കിയതായി അടയാളപ്പെടുത്തുക",
      openLink: "ലിങ്ക് തുറക്കുക",
      logout: "ലോഗ് ഔട്ട്",
      logoutConfirm: "ലോഗ് ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?",
    },
    faq: [
      {
        q: "7Universe എന്താണ്?",
        a: "മോഡൽ മനസ്സിലാക്കാനും വരുമാന പ്ലാൻ പരിശോധിക്കാനും തയ്യാറാകുമ്പോൾ ചേരാനും 7Universe നിങ്ങളെ സഹായിക്കുന്നു.",
      },
      {
        q: "പിന്തുണ എങ്ങനെ?",
        a: "നേരിട്ടുള്ള സഹായത്തിന് WhatsApp ഉപയോഗിക്കുക, അല്ലെങ്കിൽ ഈ പാനലിൽ നിന്ന് ഉത്തരങ്ങൾ കാണുക.",
      },
      {
        q: "ഡാറ്റ എവിടെ സംരക്ഷിക്കുന്നു?",
        a: "ഫോം തുടരുമ്പോൾ പേര്, മൊബൈൽ, ഭാഷ, ഘട്ട പുരോഗതി എന്നിവ സുരക്ഷിത ഡാറ്റാബേസിൽ (Supabase) സംരക്ഷിക്കുന്നു.",
      },
    ],
  },
  ta: {
    splash: {
      welcome: "7Universe க்கு வரவேற்கிறோம்",
      enter: "உள்ளே செல்",
    },
    language: {
      title: "மொழியைத் தேர்ந்தெடுக்கவும்",
      subtitle: "பின்னர் அமைப்புகளில் இதை மாற்றலாம்.",
      continue: "தொடரவும்",
    },
    userForm: {
      title: "உங்களைப் பற்றி சொல்லுங்கள்",
      nameLabel: "பெயர்",
      mobileLabel: "மொபைல் எண்",
      continue: "தொடரவும்",
      namePlaceholder: "முழு பெயர்",
      mobilePlaceholder: "தொலைபேசி எண்",
      errorName: "பெயரை உள்ளிடவும்.",
      errorMobile: "நாட்டுக் குறியீட்டுடன் செல்லுபடியாகும் எண்ணை உள்ளிடவும்.",
      errorInvalidNumber: "தவறான எண்",
      alreadyRegistered: "ஏற்கனவே பதிவு செய்யப்பட்டது. தொடருகிறது…",
      errorServer: "சர்வர் பிழை",
      submitError: "விவரங்களை சேமிக்க முடியவில்லை. மீண்டும் முயலவும்.",
    },
    dashboard: {
      heroTitle: "உங்கள் 7Universe பயணம் இங்கே தொடங்குகிறது",
      heroSubtitle:
        "இறுதி சேரும் இணைப்பைத் திறக்க ஒவ்வொரு படியையும் முடிக்கவும். உங்கள் முன்னேற்றம் சுயவிவரத்துடன் பாதுகாப்பாக ஒத்திசைகிறது.",
      activateCta: "உங்கள் பயணத்தை செயல்படுத்து",
      progressTitle: "உங்கள் முன்னேற்றம்",
      progressSteps: ["நோக்குநிலை", "வருமான திட்டம்", "அடுத்த படிகள்", "சேர்"],
      step1Title: "படி 1 — நோக்குநிலை வீடியோ",
      step1Action: "பார்த்ததாகக் குறி",
      step2Title: "படி 2 — வருமான திட்டம் (PDF)",
      step2ViewPdf: "PDF பார்",
      step2Download: "பதிவிறக்கு",
      step2Action: "புரிந்ததாகக் குறி",
      step3Title: "படி 3 — வணிக வீடியோ",
      step3Action: "நான் தயார்",
      step4Title: "படி 4 — 7Universe இல் சேர்",
      step4Locked: "திறக்க படிகள் 1–3 ஐ முடிக்கவும்",
      joinCta: "இப்போது 7UNIVERSE இல் சேர்",
      saving: "சேமிக்கிறது…",
      errorLoad: "முன்னேற்றத்தை ஏற்ற முடியவில்லை. மீண்டும் முயலவும்.",
      errorSave: "சேமிப்பு தோல்வி. இணைப்பைச் சரிபார்த்து மீண்டும் முயலவும்.",
      completePrevious: "முந்தைய படிகளை முதலில் முடிக்கவும்.",
      closeModal: "மூடு",
      stepDone: "முடிந்தது",
      chatTitle: "உதவி",
      chatHint: "கேள்வியைத் திறக்க தட்டவும்",
      whatsAppBar: "WhatsApp இல் அரட்டை",
      referralTitle: "உங்கள் பரிந்துரை இணைப்பு",
      referralHint: "இந்த இணைப்பைப் பகிரவும். பதிவு செய்யும் ஒவ்வொருவரும் உங்கள் பரிந்துரையாக எண்ணப்படுவர்கள்.",
      copyLink: "இணைப்பை நகலெடு",
      copied: "நகலெடுக்கப்பட்டது!",
      referralCountLabel: "வெற்றிகரமான பரிந்துரைகள்",
      leadScoreLabel: "முன்னணி மதிப்பெண்",
      shareLink: "பகிர்",
      markStepComplete: "முடித்ததாகக் குறி",
      openLink: "இணைப்பைத் திற",
      logout: "வெளியேறு",
      logoutConfirm: "நீங்கள் நிச்சயமாக வெளியேற விரும்புகிறீர்களா?",
    },
    faq: [
      {
        q: "7Universe என்றால் என்ன?",
        a: "மாதிரியைப் புரிந்துகொள்ள, வருமான திட்டத்தைப் பார்வையிட்டு, தயாராகும்போது சேர 7Universe உதவுகிறது.",
      },
      {
        q: "ஆதரவு எப்படி?",
        a: "நேரடி உதவிக்கு WhatsApp பயன்படுத்தவும், அல்லது இந்த பலகத்தில் பதில்களைப் பார்க்கவும்.",
      },
      {
        q: "தரவு எங்கே சேமிக்கப்படுகிறது?",
        a: "படிவத்திலிருந்து தொடரும்போது பெயர், மொபைல், மொழி, படி முன்னேற்றம் பாதுகாப்பான தரவுத்தளத்தில் (Supabase) சேமிக்கப்படுகிறது.",
      },
    ],
  },
};

export function getCopy(lang: string): Copy {
  if (lang === "ml") return copy.ml;
  if (lang === "ta") return copy.ta;
  return copy.en;
}

export function getMediaForLanguage(lang: LanguageCode) {
  return MEDIA[lang];
}

export function resolveLanguage(stored: string | null): string {
  const code = stored?.trim().toLowerCase() ?? "";
  return code.length > 0 ? code : "en";
}
