import { useEffect, useState } from 'react';
import { getStoredTheme, subscribeToTheme } from '../utils/theme';

const AKBAR_CORPORATE_LOGO = '/akbar-corporate-logo.png';
const AKBAR_CORPORATE_LOGO_DARK = '/akbar-corporate-logo-dark.png';

const isAkbarCorporateLogo = (src) => String(src || '').includes(AKBAR_CORPORATE_LOGO);

const ThemedLogo = ({ src, alt, className = '', ...props }) => {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => subscribeToTheme(setTheme), []);

  const akbarCorporateLogo = isAkbarCorporateLogo(src);
  const resolvedSrc =
    theme === 'dark' && akbarCorporateLogo ? AKBAR_CORPORATE_LOGO_DARK : src;
  const resolvedClassName = `${className}${akbarCorporateLogo ? ' theme-logo-image--akbar' : ''}`;

  return <img src={resolvedSrc} alt={alt} className={resolvedClassName.trim()} {...props} />;
};

export default ThemedLogo;
