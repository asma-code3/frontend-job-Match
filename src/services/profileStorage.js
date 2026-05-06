const profileKey = (email) => `jobmatch_profile_${String(email || '').toLowerCase() || 'guest'}`;

export const getDefaultProfile = (user) => ({
  form: {
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    title: '',
    bio: '',
    skills: '',
  },
  avatarUrl: '',
  cvPreview: null,
  certificates: [],
});

export const getProfile = (email, user) => {
  if (!email) return getDefaultProfile(user);
  const raw = localStorage.getItem(profileKey(email));
  if (!raw) return getDefaultProfile(user);
  try {
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultProfile(user),
      ...parsed,
      form: {
        ...getDefaultProfile(user).form,
        ...(parsed?.form || {}),
        email: parsed?.form?.email || user?.email || '',
      },
      certificates: Array.isArray(parsed?.certificates) ? parsed.certificates : [],
    };
  } catch {
    return getDefaultProfile(user);
  }
};

export const saveProfile = (email, profile) => {
  if (!email) return;
  localStorage.setItem(profileKey(email), JSON.stringify(profile));
};
