import { cn } from "@/lib/utils";

import logoMark from "@/assets/mockmate_logo_mark.png";
import logoLockupLight from "@/assets/mockmate_logo_light.png";
import logoLockupDark from "@/assets/mockmate_logo_dark.png";

/**
 * MockMate brand assets, generated as the app logo.
 *
 * The emblem artwork itself is navy-on-transparent, so it always sits on the
 * fixed light `--logo-tile` colour (defined in styles.css) to stay readable in
 * both themes. The lockup ships in a light and a dark lettering variant.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-logo-tile",
        className,
      )}
    >
      <img src={logoMark} alt="" aria-hidden className="h-[86%] w-[86%] object-contain" />
    </span>
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <img
        src={logoLockupLight}
        alt=""
        aria-hidden
        className="h-full w-auto object-contain dark:hidden"
      />
      <img
        src={logoLockupDark}
        alt=""
        aria-hidden
        className="hidden h-full w-auto object-contain dark:block"
      />
    </span>
  );
}
