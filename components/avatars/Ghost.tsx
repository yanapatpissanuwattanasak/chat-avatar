interface Props {
  strokeColor: string;
  size: number;
}

export default function Ghost({ strokeColor, size }: Props) {
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
      {/* Ghost body: dome top, wavy bottom hem */}
      <path d="M8 30 Q7 10 20 7 Q33 10 32 30 Q32 37 28 37 Q25 43 22 37 Q20 43 18 37 Q15 43 12 37 Q8 37 8 30Z" />
      {/* Eyes — filled dots for readability */}
      <circle cx="15" cy="22" r="2" fill={strokeColor} stroke="none" />
      <circle cx="25" cy="22" r="2" fill={strokeColor} stroke="none" />
    </svg>
  );
}
