export const getAvatarUrl = (user) => {
  return user?.avatarUrl || user?.avatar_url || null;
};

export const applyUpdatedAvatar = (updatedUser, setUser) => {
  const user = updatedUser?.user || updatedUser?.data || updatedUser;

  if (!user || typeof user !== 'object') {
    throw new Error('The server did not return the updated user.');
  }

  setUser((previousUser) => ({
    ...previousUser,
    ...user,
    avatarUrl: getAvatarUrl(user),
  }));
};