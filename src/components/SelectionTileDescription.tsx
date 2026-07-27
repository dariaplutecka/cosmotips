"use client";

import { useEffect, useRef, useState } from "react";

export function SelectionTileDescription(props: {
  text: string;
  readMoreLabel: string;
  readLessLabel: string;
  id: string;
}) {
  const { text, readMoreLabel, readLessLabel, id } = props;
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  useEffect(() => {
    const el = descRef.current;
    if (!el || expanded) {
      setClamped(false);
      return;
    }

    const check = () => {
      setClamped(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, expanded]);

  const showToggle = clamped || expanded;

  return (
    <div className="mt-1 min-w-0 flex-1">
      <p
        ref={descRef}
        id={`${id}-desc`}
        className={[
          "cosmotips-tile-body text-sm leading-6 text-white/75",
          expanded ? "" : "line-clamp-5 sm:line-clamp-none",
        ].join(" ")}
      >
        {text}
      </p>
      {showToggle ? (
        <button
          type="button"
          className="cosmotips-tile-body mt-1.5 text-xs font-semibold text-violet-200/90 underline decoration-violet-300/40 underline-offset-2 sm:hidden"
          aria-expanded={expanded}
          aria-controls={`${id}-desc`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? readLessLabel : readMoreLabel}
        </button>
      ) : null}
    </div>
  );
}
