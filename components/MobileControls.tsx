"use client";

interface Props {
  setMobileDir: (dir: Partial<{ up: boolean; down: boolean; left: boolean; right: boolean }>) => void;
}

type Dir = "up" | "down" | "left" | "right";

const BUTTONS: { dir: Dir; label: string; cls: string }[] = [
  { dir: "up",    label: "▲", cls: "dpad-up"    },
  { dir: "left",  label: "◀", cls: "dpad-left"  },
  { dir: "down",  label: "▼", cls: "dpad-down"  },
  { dir: "right", label: "▶", cls: "dpad-right" },
];

export default function MobileControls({ setMobileDir }: Props) {
  function press(dir: Dir) { setMobileDir({ [dir]: true }); }
  function release(dir: Dir) { setMobileDir({ [dir]: false }); }

  return (
    <div data-ui className="dpad">
      {BUTTONS.map(({ dir, label, cls }) => (
        <button
          key={dir}
          className={`dpad-btn ${cls}`}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); press(dir); }}
          onPointerUp={() => release(dir)}
          onPointerCancel={() => release(dir)}
          aria-label={dir}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
