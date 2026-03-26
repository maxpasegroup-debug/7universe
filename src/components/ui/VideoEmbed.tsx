type Props = {
  videoId: string;
  title: string;
};

export function VideoEmbed({ videoId, title }: Props) {
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-black/40 ring-glow shadow-[0_0_40px_rgba(245,158,11,0.08)]">
      <div className="relative aspect-video w-full">
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
