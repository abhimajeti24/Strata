type Props = {
  children: React.ReactNode;
  tone?: "rebar" | "graphite" | "limewash";
  className?: string;
};

const tones = {
  rebar: "text-rebar",
  graphite: "text-graphite",
  limewash: "text-limewash/60",
};

/** Drawing-sheet annotation - IBM Plex Mono, uppercase, tracked out. */
export function AnnotationLabel({ children, tone = "rebar", className = "" }: Props) {
  return <p className={`type-mono ${tones[tone]} ${className}`}>{children}</p>;
}
