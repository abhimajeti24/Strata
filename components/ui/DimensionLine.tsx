type Props = {
  label: string;
  className?: string;
};

/** 1px dimension line with perpendicular end ticks, label centered. */
export function DimensionLine({ label, className = "" }: Props) {
  return (
    <div className={`flex items-center ${className}`} aria-hidden="true">
      <span className="h-2 w-px bg-rebar" />
      <span className="h-px flex-1 bg-rebar" />
      <span className="type-mono px-3 text-[10px] text-rebar">{label}</span>
      <span className="h-px flex-1 bg-rebar" />
      <span className="h-2 w-px bg-rebar" />
    </div>
  );
}
