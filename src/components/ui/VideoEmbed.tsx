type Props = {
  src: string;
  title: string;
};

const audioExt = /\.(?:mp3|wav|m4a|aac|ogg|oga)(?:\?.*)?$/i;

export function VideoEmbed({ src, title }: Props) {
  const isAudio = audioExt.test(src);

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-black/40 ring-glow shadow-[0_0_40px_rgba(245,158,11,0.08)]">
      {isAudio ? (
        <div className="w-full px-4 py-5">
          <audio controls preload="metadata" className="w-full" title={title}>
            <source src={src} />
          </audio>
        </div>
      ) : (
        <div className="relative aspect-video w-full">
          <video
            controls
            preload="metadata"
            className="absolute inset-0 h-full w-full"
            title={title}
          >
            <source src={`${src}.mp4`} type="video/mp4" />
            <source src={`${src}.webm`} type="video/webm" />
            <source src={`${src}.mov`} type="video/quicktime" />
            <source src={src} />
          </video>
        </div>
      )}
    </div>
  );
}
