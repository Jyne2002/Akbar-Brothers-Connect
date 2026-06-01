import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import CompanyActionButtons from '../components/CompanyActionButtons';
import CompanyContactButtons from '../components/CompanyContactButtons';
import { getCompanyByValue } from '../constants/companies';

const CompanyInfo = () => {
  const { companyId } = useParams();
  const company = getCompanyByValue(decodeURIComponent(companyId || ''));
  const [logoErrorCompanyCode, setLogoErrorCompanyCode] = useState('');
  const showLogo = Boolean(company?.logo) && logoErrorCompanyCode !== company?.code;

  if (!company) {
    return (
      <div className="space-y-6 pb-12 pt-4 animate-in fade-in duration-500">
        <section className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_22px_52px_rgba(16,16,16,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
            Company Details
          </p>
          <h1 className="mt-3 text-3xl font-black text-black">Company not found</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70">
            We couldn&apos;t match that company selection to a saved company profile.
          </p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-red)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 pt-4 animate-in fade-in duration-500">
      <section className="rounded-[2rem] border border-[var(--color-brand-red)]/10 bg-white p-7 shadow-[0_26px_54px_rgba(89,10,22,0.08)]">
        <div className="grid gap-8 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-center">
          <div className="flex min-h-[20rem] items-center justify-center px-4 py-6">
            {showLogo ? (
              <img
                src={company.logo}
                alt={`${company.companyName} corporate logo`}
                className="mx-auto h-56 w-auto object-contain"
                onError={() => setLogoErrorCompanyCode(company.code)}
              />
            ) : (
              <div className="flex h-64 w-full max-w-[18rem] flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--color-brand-red)]/18 bg-[#faf7f8] px-6 text-center text-black">
                <Building2 className="h-14 w-14" />
                <p className="mt-4 text-lg font-bold text-black">{company.name}</p>
                <p className="mt-2 text-sm text-black/65">Logo will appear here once it is available.</p>
              </div>
            )}
          </div>

          <div className="px-1 py-2">
            <p className="max-w-3xl text-sm leading-7 text-black/74">
              {company.companyOverview}
            </p>

            <div className="mt-8">
              <CompanyActionButtons company={company} />
            </div>

            {company.address || company.websiteUrl || company.emailAddress || company.phoneUrl ? (
              <div className="mt-5 max-w-2xl text-left">
                {company.address ? (
                  <p className="text-sm leading-6 text-black/78">{company.address}</p>
                ) : null}
                <CompanyContactButtons company={company} />
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#faf7f8]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyInfo;
