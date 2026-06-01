import { Globe, Mail, Phone } from 'lucide-react';

const CompanyContactButtons = ({ company, centered = false, size = 'default', tone = 'dark' }) => {
  const contactLinks = [
    {
      key: 'website',
      alt: 'Website',
      href: company?.websiteUrl,
      title: company?.websiteLabel || company?.websiteUrl || 'Company website',
      icon: Globe,
    },
    {
      key: 'email',
      alt: 'Email',
      href: company?.emailAddress ? `mailto:${company.emailAddress}` : '',
      title: company?.emailAddress || 'Company email',
      icon: Mail,
    },
    {
      key: 'phone',
      alt: 'Phone',
      href: company?.phoneUrl,
      title: company?.phoneDisplay || 'Company phone number',
      icon: Phone,
    },
  ].filter((link) => link.href);

  if (contactLinks.length === 0) {
    return null;
  }

  const buttonSizeClassName = size === 'compact' ? 'h-8 w-8' : 'h-9 w-9';
  const iconSizeClassName = size === 'compact' ? 'h-4.5 w-4.5' : 'h-5 w-5';
  const toneClassName = tone === 'light' ? 'text-white/95 hover:text-white' : 'text-black';

  return (
    <div className={`mt-3 flex flex-wrap items-center gap-2.5 ${centered ? 'justify-center' : ''}`}>
      {contactLinks.map((link) => {
        const Icon = link.icon;
        const isWebLink = /^https?:/i.test(link.href);

        return (
          <a
            key={link.key}
            href={link.href}
            target={isWebLink ? '_blank' : undefined}
            rel={isWebLink ? 'noreferrer' : undefined}
            aria-label={`${company?.companyName || company?.name || 'Company'} ${link.alt}`}
            title={link.title}
            className={`inline-flex items-center justify-center transition hover:-translate-y-0.5 ${buttonSizeClassName} ${toneClassName}`}
          >
            <Icon className={iconSizeClassName} />
          </a>
        );
      })}
    </div>
  );
};

export default CompanyContactButtons;
