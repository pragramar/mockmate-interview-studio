import type { TimelineSegment } from "@/types";
import { formatTimestamp } from "@/lib/format";

/**
 * Speech/silence timeline rendered as a clean horizontal bar.
 * Teal segments are candidate speech; grey segments are silence or the interviewer.
 */
export function SpeechTimeline({ timeline }: { timeline: TimelineSegment[] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-muted-foreground">No timeline data available.</p>;
  }

  const total = timeline[timeline.length - 1].endSec;

  return (
    <figure>
      <div
        role="img"
        aria-label="Timeline of speaking and silence across the interview"
        className="flex h-8 w-full overflow-hidden rounded-md border border-border bg-muted"
      >
        {timeline.map((segment, index) => {
          const width = ((segment.endSec - segment.startSec) / total) * 100;
          return (
            <div
              key={index}
              style={{ width: `${width}%` }}
              className={
                segment.kind === "speech" ? "h-full bg-primary/80" : "h-full bg-muted-foreground/25"
              }
            />
          );
        })}
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm bg-primary/80" />
          Speaking
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm bg-muted-foreground/25" />
          Silence / interviewer
        </span>
        <span>0:00 – {formatTimestamp(total)}</span>
      </figcaption>
    </figure>
  );
}
