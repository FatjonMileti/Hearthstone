export const avatars: { image: string }[] = [];

export const getAvatarFormIndex = (avatar?: string) => {
  if (!avatar) return '';
  return avatars[parseInt(avatar) || 0]?.image || '';
};
