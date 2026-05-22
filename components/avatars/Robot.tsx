interface Props {
  strokeColor: string;
  size: number;
}

export default function Robot({ strokeColor, size }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 40 52"
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Antenna */}
      <line x1="20" y1="5" x2="20" y2="10" />
      <circle cx="20" cy="4" r="2" />
      {/* Square head */}
      <rect x="9" y="10" width="22" height="17" rx="2" />
      {/* Eyes */}
      <rect x="12" y="14" width="6" height="5" rx="1" />
      <rect x="22" y="14" width="6" height="5" rx="1" />
      <rect x="13.5" y="15.5" width="3" height="2" rx="0.5" fill={strokeColor} fillOpacity="0.6" stroke="none" />
      <rect x="23.5" y="15.5" width="3" height="2" rx="0.5" fill={strokeColor} fillOpacity="0.6" stroke="none" />
      {/* Mouth grill */}
      <line x1="13" y1="23" x2="27" y2="23" />
      <line x1="16" y1="21" x2="16" y2="23" />
      <line x1="20" y1="21" x2="20" y2="23" />
      <line x1="24" y1="21" x2="24" y2="23" />
      {/* Neck */}
      <line x1="17" y1="27" x2="17" y2="30" />
      <line x1="23" y1="27" x2="23" y2="30" />
      {/* Body */}
      <rect x="8" y="30" width="24" height="17" rx="2" />
      {/* Chest panel */}
      <rect x="13" y="33" width="6" height="4" rx="1" />
      <rect x="21" y="33" width="6" height="4" rx="1" />
      <circle cx="20" cy="41" r="2.5" />
      {/* Arms */}
      <path d="M8 33 Q3 37 5 43" />
      <path d="M32 33 Q37 37 35 43" />
      {/* Legs */}
      <line x1="14" y1="47" x2="13" y2="52" />
      <line x1="26" y1="47" x2="27" y2="52" />
    </svg>
  );
}
