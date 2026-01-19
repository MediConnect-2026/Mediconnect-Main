import Avatar from "boring-avatars";

const AVATAR_COLORS = [
  "#A8C3A0",
  "#0B2C12",
  "#8BB1CA",
  "#FFFFFF",
  "#D7E3C9",
  "#EFF2D7",
  "#6FAF9A",
  "#3A6B4F",
  "#C1D8C3",
  "#F4F7EE",
  "#9BC4BC",
  "#5E8B7E",
  "#2F5D50",
  "#BFD3C1",
  "#E6EFE3",
  "#7FA8A0",
  "#4A7C6D",
  "#1E4035",
  "#A3C9B8",
  "#DCEBE2",
  "#8FBFAE",
  "#6B9E8E",
  "#355F55",
  "#9DB7D1",
  "#6F8FAF",
  "#4A6C8A",
  "#2E4F6B",
  "#C7D6E5",
  "#E3EAF1",
  "#B3C2D1",
  "#809BB5",
  "#5C768F",
  "#F1F3F5",
  "#DADFE4",
  "#B5BCC2",
  "#8F969C",
  "#6B7176",
  "#4A4F54",
  "#2E3236",
  "#1B1E21",
  "#0F1113",
];

type MCUserAvatarProps = {
  name: string;
  size?: number;
  square?: boolean;
  className?: string;
};

export function MCUserAvatar({
  name,
  size = 40,
  square = false,
  className,
}: MCUserAvatarProps) {
  return (
    <Avatar
      name={name}
      size={size}
      variant="beam"
      colors={AVATAR_COLORS}
      square={square}
      className={`rounded-full ${className}`}
    />
  );
}
