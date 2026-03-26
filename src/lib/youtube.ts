/** Accepts a bare 11-char YouTube id or common watch/embed/shorts URLs. */
export function youtubeEmbedId(urlOrId: string): string {
  const s = urlOrId.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.replace(/^www\./, "").includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id && /^[\w-]{11}$/.test(id)) return id;
    }
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const embed = u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
    if (embed?.[1]) return embed[1];
  } catch {
    /* ignore */
  }
  return s;
}
