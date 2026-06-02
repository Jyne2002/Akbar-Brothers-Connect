const AKBAR_COMPANY_OVERVIEW =
  "Akbar Brothers (Pvt) Ltd is Sri Lanka's Largest Tea Exporter and one of the country's most respected diversified conglomerates. Established in 1969, the family-owned enterprise has grown from a tea trading business into a global organisation with interests spanning sustainable power generation, healthcare, packaging, property development, environmental services and international trade.";

const FALCON_COMPANY_OVERVIEW =
  "Falcon Trading (Pvt) Ltd is a leading Sri Lankan distributor serving the bakery and confectionery industry with an island-wide supply network. The company imports and distributes premium margarine, shortening, palm olein, yeast, bread improvers, flavours, colours, cocoa powder, canned fish, and other trusted ingredients sourced from globally recognized manufacturers and local partners.";

const QUICK_TEA_COMPANY_OVERVIEW =
  "Quick Tea (Pvt) Limited, incorporated in 1972 as a subsidiary of Akbar Brothers Limited, operates one of Sri Lanka's largest teabag manufacturing facilities with a capacity of more than 3 billion teabags per year. The company is also recognized for its sustainability leadership, including Carbon-Inset certification supported by renewable energy initiatives and greenhouse gas reduction efforts across its value chain.";

const SHARED_COMPANY_ADDRESS = 'No. 334, T.B. Jayah Mawatha, Colombo 10, Sri Lanka.';

const AKBAR_ACTION_LINKS = [
  {
    key: 'linkedin',
    alt: 'LinkedIn',
    href: 'https://lk.linkedin.com/company/akbar-brothers-pvt-ltd',
    icon: '/linkedin.png',
    iconType: 'image',
  },
  {
    key: 'facebook',
    alt: 'Facebook',
    href: 'https://www.facebook.com/AkbarBrothersPvtLtd',
    icon: '/facebook.png',
    iconType: 'image',
  },
  {
    key: 'instagram',
    alt: 'Instagram',
    href: 'https://www.instagram.com/akbar_brothers',
    icon: '/instagram.png',
    iconType: 'image',
  },
];

export const COMPANIES = [
  {
    code: 'A',
    id: 'Company A',
    slug: 'akbar-brothers',
    name: 'Akbar Brothers',
    description: 'Estate operations and premium tea production teams.',
    companyName: 'Akbar Brothers (Pvt) Ltd',
    companyOverview: AKBAR_COMPANY_OVERVIEW,
    address: SHARED_COMPANY_ADDRESS,
    emailAddress: 'contactus@akbar.com',
    phoneDisplay: '(+94)11 2697151',
    phoneUrl: 'tel:+94112697151',
    websiteLabel: 'www.akbargroup.lk',
    websiteUrl: 'https://www.akbargroup.lk',
    logo: '/akbar-corporate-logo.png',
    showcaseImage: '/quick-tea-company-photo.webp',
    showcaseImageAlt: 'Akbar Brothers product range',
    footerLogo: '/akbar-brand-logo.png',
    footerLogoAlt: 'Akbar Brothers brand logo',
    actionLinks: AKBAR_ACTION_LINKS,
    aliases: ['Company A', 'Akbar Brothers', 'Akbar Brothers (Pvt) Ltd'],
  },
  {
    code: 'B',
    id: 'Company B',
    slug: 'falcon-trading',
    name: 'Falcon Trading',
    description: 'Bakery and confectionery ingredient distribution teams across Sri Lanka.',
    companyName: 'Falcon Trading (Pvt) Ltd',
    companyOverview: FALCON_COMPANY_OVERVIEW,
    address: SHARED_COMPANY_ADDRESS,
    emailAddress: 'info@falconfoods.lk',
    phoneDisplay: '+94 11 269 7151',
    phoneUrl: 'tel:+94112697151',
    websiteLabel: 'falconfoods.lk',
    websiteUrl: 'https://falconfoods.lk/',
    logo: '/falconfoods.png',
    footerLogo: '/akbar-corporate-logo.png',
    footerLogoAlt: 'Akbar Brothers corporate logo',
    actionLinks: [],
    aliases: ['Company B', 'Company 2', 'Falcon Trading', 'Falcon Trading (Pvt) Ltd'],
  },
  {
    code: 'C',
    id: 'Company C',
    slug: 'quick-tea',
    name: 'Quick Tea',
    description: 'Teabag manufacturing and sustainability-focused tea operations.',
    companyName: 'Quick Tea (Pvt) Ltd',
    companyOverview: QUICK_TEA_COMPANY_OVERVIEW,
    address: SHARED_COMPANY_ADDRESS,
    emailAddress: 'contactus@akbar.com',
    phoneDisplay: '0112 933 326',
    phoneUrl: 'tel:+94112933326',
    websiteLabel: 'www.akbargroup.lk',
    websiteUrl: 'https://www.akbargroup.lk',
    logo: '/quick-tea-logo.png',
    footerLogo: '/akbar-brand-logo.png',
    footerLogoAlt: 'Akbar Brothers brand logo',
    actionLinks: AKBAR_ACTION_LINKS,
    aliases: ['Company C', 'Company 3', 'Quick Tea', 'Quick Tea (Pvt) Ltd', 'Quick Tea (Pvt) Limited'],
  },
];

const normalizeCompanyLookupValue = (company) =>
  typeof company === 'string' ? company.trim().toLowerCase() : '';

const normalizeCompanyPhoneNumber = (value) => {
  const digits = String(value || '').replace(/[^\d]/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('0094')) {
    return `0${digits.slice(4)}`;
  }

  if (digits.startsWith('94')) {
    return `0${digits.slice(2)}`;
  }

  return digits;
};

export const getCompanyByValue = (company) => {
  const normalizedCompany = normalizeCompanyLookupValue(company);

  if (!normalizedCompany) {
    return null;
  }

  return (
    COMPANIES.find((entry) =>
      [entry.code, entry.id, entry.slug, entry.name, ...(entry.aliases || [])]
        .filter(Boolean)
        .some((value) => normalizeCompanyLookupValue(value) === normalizedCompany),
    ) || null
  );
};

export const getCompanyCode = (company) => getCompanyByValue(company)?.code || '';

export const getCompanySlug = (company) => getCompanyByValue(company)?.slug || '';

export const getCompanyLabel = (company) => getCompanyByValue(company)?.name || company;

export const getCompanyLandlineNumber = (company) => {
  const companyRecord = getCompanyByValue(company);

  if (!companyRecord) {
    return '';
  }

  return normalizeCompanyPhoneNumber(companyRecord.phoneUrl || companyRecord.phoneDisplay);
};
