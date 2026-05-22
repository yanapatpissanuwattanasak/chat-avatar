interface Props {
  strokeColor: string;
  size: number;
}

export default function Block({ strokeColor, size }: Props) {
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
      {/* Square head */}
      <rect x="13" y="3" width="14" height="13" rx="2" />
      {/* Neck */}
      <line x1="20" y1="16" x2="20" y2="20" />
      {/* Square body */}
      <rect x="10" y="20" width="20" height="18" rx="2" />
      {/* Arms */}
      <line x1="10" y1="25" x2="4" y2="31" />
      <line x1="30" y1="25" x2="36" y2="31" />
      {/* Legs */}
      <line x1="15" y1="38" x2="15" y2="50" />
      <line x1="25" y1="38" x2="25" y2="50" />
    </svg>
  );
}
