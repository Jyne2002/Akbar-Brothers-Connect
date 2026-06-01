import { getWhatsappUrl, normalizeLinkedinUrl } from '../utils/profileCard';
import { getBrandMaskedIconStyle } from '../utils/socialIcons';

const ProfileSocialButtons = ({ linkedinUrl, whatsappNumber }) => {
  const socialLinks = [
    {
      key: 'linkedin',
      alt: 'LinkedIn',
      href: normalizeLinkedinUrl(linkedinUrl),
      icon: '/linkedin.png',
    },
    {
      key: 'whatsapp',
      alt: 'WhatsApp',
      href: getWhatsappUrl(whatsappNumber),
      icon: '/whatsapp.png',
    },
  ];

  const imageClassName = 'h-12 w-12';

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {socialLinks.map((link) =>
        link.href ? (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.alt}
            className="inline-flex items-center justify-center transition hover:-translate-y-0.5"
          >
            <span
              aria-hidden="true"
              className={`${imageClassName} inline-block`}
              style={getBrandMaskedIconStyle(link.icon)}
            />
          </a>
        ) : (
          <button
            key={link.key}
            type="button"
            aria-label={`${link.alt} not available`}
            disabled
            className="inline-flex items-center justify-center opacity-45"
          >
            <span
              aria-hidden="true"
              className={`${imageClassName} inline-block`}
              style={getBrandMaskedIconStyle(link.icon)}
            />
          </button>
        ),
      )}
    </div>
  );
};

export default ProfileSocialButtons;
