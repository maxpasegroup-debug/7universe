const chips = ["Orientation Video", "Training Materials", "Expert Support"] as const;

export function LandingFeatureChips() {
  return (
    <div className="landing-animate-in landing-delay-4 mt-6 grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-3">
      {chips.map((chip, i) => (
        <div
          key={chip}
          className="rounded-full border border-amber-400/20 bg-slate-900/55 px-3 py-2 text-center text-xs font-medium text-slate-200 backdrop-blur-sm transition hover:border-amber-300/40 hover:bg-slate-900/75"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {chip}
        </div>
      ))}
    </div>
  );
}
