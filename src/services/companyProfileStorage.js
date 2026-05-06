const companyProfileKey = (email) => `jobmatch_company_profile_${String(email || '').toLowerCase() || 'guest'}`;

export const getDefaultCompanyProfile = () => ({
  name: 'Tech Solutions Inc.',
  website: 'https://techsolutions.com',
  location: 'Mogadishu, Somalia',
  description: 'We build modern web applications.',
  email: 'contact@techsolutions.com',
  logoUrl: '',
});

export const getCompanyProfile = (email) => {
  if (!email) return getDefaultCompanyProfile();
  const raw = localStorage.getItem(companyProfileKey(email));
  if (!raw) return getDefaultCompanyProfile();
  try {
    return {
      ...getDefaultCompanyProfile(),
      ...JSON.parse(raw),
    };
  } catch {
    return getDefaultCompanyProfile();
  }
};

export const saveCompanyProfile = (email, profile) => {
  if (!email) return;
  localStorage.setItem(companyProfileKey(email), JSON.stringify(profile));
};
