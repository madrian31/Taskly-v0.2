export interface AvatarOptions {
  photoURL?: string | null;
  name?: string | null;
  size?: number;
  bgColor?: string;
}

export function getAvatarUrl({ photoURL, name, size = 80, bgColor = '#667eea' }: AvatarOptions = {}) {
  if (photoURL) return photoURL;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${bgColor.replace('#', '')}&color=fff&size=${size}`;
}
