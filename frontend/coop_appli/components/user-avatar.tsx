interface UserAvatarProps {
  nom: string;
  prenom: string;
  size?: number;
}

export function UserAvatar({ nom, prenom, size = 40 }: UserAvatarProps) {
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  return (
    <div
      className="rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`Avatar de ${prenom} ${nom}`}
    >
      {initiales}
    </div>
  );
}