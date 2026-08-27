import Image from "next/image";

interface IllustrationProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Sizing/positioning classes for the wrapper (e.g. "w-full max-w-sm mx-auto"). */
  wrapperClassName?: string;
  /** Soft blurred color glow behind the image -- off for small inline icons. */
  glow?: boolean;
  priority?: boolean;
}

/**
 * Renders one of the app's mascot illustrations consistently: rounded
 * corners, a subtle card shadow, and (by default) a soft blurred glow
 * behind it in the accent color. Without this, the source images --
 * each generated with a solid rectangular background -- read as a
 * pasted-in photo rather than a designed page element.
 */
export function Illustration({
  src,
  alt,
  width,
  height,
  wrapperClassName = "",
  glow = true,
  priority,
}: IllustrationProps) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      {glow && <div aria-hidden="true" className="absolute inset-5 -z-10 rounded-full bg-accent/25 blur-3xl" />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-full rounded-2xl shadow-card"
      />
    </div>
  );
}
