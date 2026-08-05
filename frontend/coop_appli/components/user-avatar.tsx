import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface UserAvatarProps {
  nom: string;
  prenom: string;
  photoUrl?: string | null;
  size?: number;
}

export function UserAvatar({ nom, prenom, photoUrl, size = 40 }: UserAvatarProps) {
  if (photoUrl) {
    return (
      <div
        className="relative rounded-full overflow-hidden shrink-0 border border-stone-200"
        style={{ width: size, height: size }}
      >
        <Image
          src={`${API_URL}${photoUrl}`}
          alt={`Photo de ${prenom} ${nom}`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>
    );
  }

  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  return (
    <div
      className="rounded-full bg-emerald-800 text-white flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`Avatar de ${prenom} ${nom}`}
    >
      {initiales}
    </div>
  );
}