import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import CompanyActionButtons from '../components/CompanyActionButtons';
import CompanyContactButtons from '../components/CompanyContactButtons';
import { getCompanyByValue } from '../constants/companies';
import { buildPublicProfilePath } from '../utils/profileCard';

const PublicCompanyInfo = () => {
  const { shareSlug, companyId, identitySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const company = getCompanyByValue(decodeURIComponent(companyId || ''));
  const [logoErrorCompanyCode, setLogoErrorCompanyCode] = useState('');
  const showLogo = Boolean(company?.logo) && logoErrorCompanyCode !== company?.code;
  const publicProfilePath = buildPublicProfilePath(shareSlug, '', '', identitySlug);
  const backTarget = publicProfilePath || '/';
  const cameFromPublicCard = location.state?.fromPublicCard === true;
  const publicProfileState = {
    fromApp: location.state?.fromApp === true,
    entryReferrer: location.state?.entryReferrer || '',
  };
  const handleBackToCard = () => {
    if (cameFromPublicCard) {
      navigate(-1);
      return;
    }

    navigate(backTarget, { replace: true, state: publicProfileState });
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#fdfaf8_0%,_#f6ece5_100%)] px-4 py-10">
        <div className="mx-auto max-w-sm rounded-[2.2rem] border border-[var(--color-brand-red)]/10 bg-white p-7 text-center shadow-[0_24px_54px_rgba(89,10,22,0.08)]">
          <h1 className="text-2xl font-black text-black">Company not found</h1>
          <p className="mt-3 text-sm leading-6 text-black/70">
            We could not match this company to a saved public company page.
          </p>
          <Link
            to={publicProfilePath}
            replace
            state={publicProfileState}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-red)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to card
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[linear-gradient(180deg,_#fdfaf8_0%,_#f6ece5_100%)] px-3 py-4 md:min-h-[100dvh] md:px-4 md:py-6">
      <section className="relative mx-auto w-full max-w-sm rounded-[2.15rem] border border-[var(--color-brand-red)]/10 bg-white px-4 pb-4 pt-3 shadow-[0_22px_44px_rgba(89,10,22,0.08)] sm:max-w-[26.25rem] sm:px-5 sm:pb-5 sm:pt-3.5">
        <button
          type="button"
          onClick={handleBackToCard}
          aria-label="Back to card"
          title="Back to card"
          className="absolute left-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center text-black transition hover:-translate-x-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex h-[8rem] items-end justify-center overflow-hidden px-2 pt-1 sm:h-[9rem] sm:px-3 sm:pt-1">
          {showLogo ? (
            <img
              src={company.logo}
              alt={`${company.companyName} corporate logo`}
              className="mx-auto h-[7.15rem] w-auto object-contain sm:h-[8.1rem]"
              onError={() => setLogoErrorCompanyCode(company.code)}
            />
          ) : (
            <div className="flex h-32 w-full flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-[var(--color-brand-red)]/18 bg-[#faf7f8] px-5 text-center text-black sm:h-36">
              <Building2 className="h-10 w-10" />
              <p className="mt-2 text-base font-bold text-black">{company.name}</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[0.93rem] leading-6 text-black/74">{company.companyOverview}</p>
        </div>

        <div className="mt-4">
          <CompanyActionButtons company={company} centered />
        </div>

        {(company.footerLogo || company.address || company.websiteUrl || company.emailAddress || company.phoneUrl) ? (
          <div className="-mb-4 -mx-4 mt-5 rounded-b-[2.15rem] bg-[var(--color-brand-red)] px-5 py-5 text-center text-white sm:-mb-5 sm:-mx-5">
            {company.footerLogo ? (
              <div className="flex justify-center">
                <img
                  src="/akbar-footer-logo.png"
                  alt="Akbar Brothers footer logo"
                  className="h-9 w-auto max-w-[13rem] object-contain sm:h-[3.1rem]"
                />
              </div>
            ) : null}

            {company.address ? (
              <p className="mt-4 text-sm leading-6 text-white/88">{company.address}</p>
            ) : null}

            <div className="mt-4">
              <CompanyContactButtons company={company} centered tone="light" />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default PublicCompanyInfo;
