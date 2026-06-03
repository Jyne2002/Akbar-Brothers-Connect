import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PublicProfileCardLayout from '../components/PublicProfileCardLayout';
import ThemedLogo from '../components/ThemedLogo';
import { getCompanyByValue } from '../constants/companies';
import api from '../utils/api';
import { getStoredTheme, subscribeToTheme, toggleTheme } from '../utils/theme';
import {
  buildPublicCompanyInfoUrl,
  buildPublicIdentitySegment,
  buildPublicProfilePath,
  buildPublicProfileUrl,
  downloadProfileAsJpg,
  downloadProfileAsPdf,
  downloadProfileAsVcf,
  getPhoneWithExtensionParts,
  getWhatsappUrl,
  normalizeLinkedinUrl,
} from '../utils/profileCard';

const PublicProfileCard = () => {
  const { shareSlug, identitySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const publicLookupKey = shareSlug || identitySlug || '';
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice('');
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        if (!publicLookupKey) {
          setError('We could not load this visiting card.');
          return;
        }

        const { data } = await api.get(`/api/auth/public-profile/${publicLookupKey}`);
        setProfile(data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'We could not load this visiting card.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [publicLookupKey]);

  useEffect(() => subscribeToTheme(setTheme), []);

  const company = useMemo(() => getCompanyByValue(profile?.company || ''), [profile?.company]);
  const canonicalIdentitySlug = useMemo(
    () => buildPublicIdentitySegment(profile?.fullName, profile?.employeeNumber),
    [profile?.employeeNumber, profile?.fullName],
  );
  const canonicalProfilePath = useMemo(
    () => buildPublicProfilePath(profile?.shareSlug, profile?.fullName, profile?.employeeNumber),
    [profile?.employeeNumber, profile?.fullName, profile?.shareSlug],
  );
  const openedFromApp = location.state?.fromApp === true;
  const entryReferrer = useMemo(
    () => location.state?.entryReferrer || document.referrer || '',
    [location.state?.entryReferrer],
  );
  const publicCompanyInfoPath = buildPublicCompanyInfoUrl(
    shareSlug,
    company?.code,
    profile?.fullName,
    profile?.employeeNumber,
    identitySlug || canonicalIdentitySlug,
  );
  const publicCompanyInfoState = useMemo(
    () => ({ fromApp: openedFromApp, fromPublicCard: true, entryReferrer }),
    [entryReferrer, openedFromApp],
  );
  const companyLogoSrc = company?.logo || '/akbar-corporate-logo.png';
  const companyLogoAlt = company?.companyName
    ? `${company.companyName} corporate logo`
    : 'Akbar Brothers corporate logo';
  const themeToggleLabel =
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  useEffect(() => {
    if (!canonicalProfilePath || location.pathname === canonicalProfilePath) {
      return;
    }

    navigate(canonicalProfilePath, { replace: true, state: location.state });
  }, [canonicalProfilePath, location.pathname, location.state, navigate]);

  const socialLinks = useMemo(
    () =>
      [
        {
          key: 'linkedin',
          alt: 'LinkedIn',
          href: normalizeLinkedinUrl(profile?.linkedinUrl),
          icon: '/linkedin.png',
        },
        {
          key: 'whatsapp',
          alt: 'WhatsApp',
          href: getWhatsappUrl(profile?.whatsappNumber),
          icon: '/whatsapp.png',
        },
      ].filter((link) => link.href),
    [profile?.linkedinUrl, profile?.whatsappNumber],
  );

  const profileRows = useMemo(
    () => {
      const phoneParts = getPhoneWithExtensionParts(profile?.phoneNumber, profile?.extensionNumber);

      return [
        {
          label: 'Phone',
          value: phoneParts.mainText || phoneParts.combinedText || 'Not shared yet',
          extensionTone: phoneParts.extensionText,
          copyValue: phoneParts.combinedText,
          icon: 'phone',
        },
        {
          label: 'Mobile',
          value: profile?.mobileNumber || 'Not shared yet',
          copyValue: profile?.mobileNumber || '',
          icon: 'mobile',
        },
        {
          label: 'Email',
          value: profile?.email || 'Not shared yet',
          copyValue: profile?.email || '',
          icon: 'email',
        },
      ];
    },
    [profile?.email, profile?.extensionNumber, profile?.mobileNumber, profile?.phoneNumber],
  );

  const initials = useMemo(
    () =>
      (profile?.fullName || 'AB')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    [profile?.fullName],
  );

  const handleShare = async () => {
    const shareUrl = buildPublicProfileUrl(
      shareSlug,
      profile?.fullName,
      profile?.employeeNumber,
      identitySlug || canonicalIdentitySlug,
    );

    if (!shareUrl || !profile) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.fullName} | Employee Card`,
          text: `View ${profile.fullName}'s employee visiting card.`,
          url: shareUrl,
        });
        setNotice('Card link shared successfully.');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setNotice('Card link copied to your clipboard.');
        return;
      }

      window.prompt('Copy this visiting card link:', shareUrl);
      setNotice('Copy the link from the dialog to share it.');
    } catch (shareError) {
      setNotice(shareError?.message || 'We could not share this card right now.');
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = buildPublicProfileUrl(
      shareSlug,
      profile?.fullName,
      profile?.employeeNumber,
      identitySlug || canonicalIdentitySlug,
    );

    if (!shareUrl) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setNotice('Card link copied to your clipboard.');
        return;
      }

      window.prompt('Copy this visiting card link:', shareUrl);
      setNotice('Copy the link from the dialog.');
    } catch (copyError) {
      setNotice(copyError?.message || 'We could not copy the card link right now.');
    }
  };

  const handleCopyField = async (label, value) => {
    const copyValue = String(value || '').trim();

    if (!copyValue) {
      setNotice(`${label} is not available to copy yet.`);
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyValue);
        setNotice(`${label} copied to your clipboard.`);
        return;
      }

      window.prompt(`Copy this ${label.toLowerCase()}:`, copyValue);
      setNotice(`${label} is ready to copy.`);
    } catch (copyError) {
      setNotice(copyError?.message || `We could not copy the ${label.toLowerCase()} right now.`);
    }
  };

  const handleDownload = async (format) => {
    if (!profile) {
      return;
    }

    try {
      setDownloading(true);
      setNotice('');

      if (format === 'jpg') {
        await downloadProfileAsJpg(profile, company);
        setNotice('JPG download started.');
      } else if (format === 'pdf') {
        await downloadProfileAsPdf(profile, company);
        setNotice('PDF download started.');
      } else {
        downloadProfileAsVcf(profile, company);
        setNotice('Contact card download started.');
      }
    } catch (downloadError) {
      setNotice(downloadError?.message || 'We could not create that download.');
    } finally {
      setDownloading(false);
      setDownloadMenuOpen(false);
    }
  };

  const handleBackHome = () => {
    if (openedFromApp) {
      navigate('/');
      return;
    }

    if (entryReferrer) {
      window.location.replace(entryReferrer);
      return;
    }

    window.close();
    window.open('', '_self');
    window.close();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,245,245,0.9)_0%,_rgba(255,255,255,0.98)_42%,_#f7f7f7_100%)]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-brand-red-dark)]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,245,245,0.9)_0%,_rgba(255,255,255,0.98)_42%,_#f7f7f7_100%)] px-4 py-10">
        <div className="mx-auto max-w-sm rounded-[2.2rem] border border-black/10 bg-white p-7 text-center shadow-[0_24px_54px_rgba(0,0,0,0.08)]">
          <ThemedLogo
            src="/akbar-corporate-logo.png"
            alt="Akbar Brothers corporate logo"
            className="mx-auto h-12 w-auto object-contain"
          />
          <h1 className="mt-6 text-2xl font-black text-black">Card unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-black/70">
            {error || 'This visiting card is not available right now.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_top,_rgba(245,245,245,0.9)_0%,_rgba(255,255,255,0.98)_42%,_#f7f7f7_100%)] px-3 py-1 md:flex md:min-h-[100dvh] md:items-center md:px-4 md:py-2">
      <div className="mx-auto w-full max-w-[22.5rem]">
        <PublicProfileCardLayout
          profile={profile}
          companyName={company?.companyName || ''}
          companyLogoSrc={companyLogoSrc}
          companyLogoAlt={companyLogoAlt}
          profileRows={profileRows}
          initials={initials}
          publicCompanyInfoPath={publicCompanyInfoPath}
          publicCompanyInfoState={publicCompanyInfoState}
          socialLinks={socialLinks}
          downloadMenuOpen={downloadMenuOpen}
          downloading={downloading}
          notice={notice}
          backButtonLabel="Go to homepage"
          onBack={openedFromApp ? handleBackHome : undefined}
          onToggleTheme={toggleTheme}
          themeToggleLabel={themeToggleLabel}
          onShare={handleShare}
          onCopy={handleCopyLink}
          onCopyField={handleCopyField}
          onToggleDownloadMenu={() => setDownloadMenuOpen((currentState) => !currentState)}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default PublicProfileCard;
