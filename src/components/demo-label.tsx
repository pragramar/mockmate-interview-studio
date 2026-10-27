import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Small, consistent label for clearly marking demonstration data. */
export function DemoLabel({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-border bg-secondary text-secondary-foreground", className)}
    >
      Demo data
    </Badge>
  );
}
