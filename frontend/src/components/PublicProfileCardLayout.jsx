import { ArrowLeft, Building2, Copy, Download, Mail, Phone, Share2, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemedLogo from './ThemedLogo';
import { getBrandMaskedIconStyle } from '../utils/socialIcons';

const PublicProfileCardLayout = ({
  profile,
  companyName,
  companyLogoSrc,
  companyLogoAlt,
  profileRows,
  initials,
  publicCompanyInfoPath,
  publicCompanyInfoState,
  socialLinks,
  showInteractiveSection = true,
  downloadMenuOpen = false,
  downloading = false,
  notice = '',
  onBack,
  onToggleTheme,
  backButtonLabel = 'Go back',
  themeToggleLabel = 'Toggle dark mode',
  onShare,
  onCopy,
  onCopyField,
  onToggleDownloadMenu,
  onDownload,
}) => (
  <section className="theme-panel relative w-full overflow-hidden rounded-[2.45rem] border border-black/10 bg-white shadow-[0_30px_72px_rgba(0,0,0,0.11)]">
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        aria-label={backButtonLabel}
        title={backButtonLabel}
        className="absolute left-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center text-black transition hover:-translate-x-0.5"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    ) : null}

    {onToggleTheme ? (
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={themeToggleLabel}
        title={themeToggleLabel}
        className="absolute right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f3f3f3]"
      >
        <img
          src="/moon-dark-mode.png"
          alt=""
          aria-hidden="true"
          className="theme-toggle-icon h-3.5 w-3.5 object-contain"
        />
      </button>
    ) : null}

    <div className="relative flex min-h-[8.4rem] items-start justify-center bg-white px-6 pb-2 pt-2.5 text-center">
      <ThemedLogo
        src={companyLogoSrc}
        alt={companyLogoAlt}
        className="theme-logo-image relative z-10 translate-y-1.5 h-[5.5rem] w-auto max-w-[16rem] object-contain"
      />
    </div>

    <div className={`relative px-5 pt-0 ${showInteractiveSection ? 'pb-0' : 'pb-7'}`}>
      <div className="-mt-5 flex justify-center">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-[var(--color-brand-red)] text-3xl font-black text-white shadow-[0_20px_38px_rgba(0,0,0,0.18)]">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={profile.fullName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>

      <div className="text-center">
        <h2 className="mx-auto mt-3 max-w-[16rem] text-[1.65rem] font-semibold leading-[1.1] text-[var(--color-brand-ink)]">
          {profile.fullName}
        </h2>

        <div className="mt-3 flex flex-col items-center gap-2.5">
          {[profile.jobRole, profile.department].filter(Boolean).length > 0 ? (
            <p className="mx-auto max-w-[16rem] text-[0.98rem] font-normal leading-[1.2] text-[var(--color-brand-ink)]/82">
              {[profile.jobRole, profile.department].filter(Boolean).join(' - ')}
            </p>
          ) : null}

          {companyName ? (
            <p className="mx-auto max-w-[16.5rem] text-[0.98rem] font-normal leading-[1.2] text-[var(--color-brand-ink)]/72">
              {companyName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="theme-subpanel mt-3 rounded-[1.75rem] border border-black/10 bg-white p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="space-y-2.5">
          {profileRows.map((row, index) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.5rem_minmax(0,1fr)_2rem] items-center gap-3 ${
                index === profileRows.length - 1 ? '' : 'border-b border-black/10 pb-2.5'
              }`}
            >
              <span className="flex h-8 items-center justify-center text-black/78" aria-hidden="true">
                {row.icon === 'mobile' ? (
                  <Smartphone className="h-4.5 w-4.5" />
                ) : row.icon === 'email' ? (
                  <Mail className="h-4.5 w-4.5" />
                ) : (
                  <Phone className="h-4.5 w-4.5" />
                )}
              </span>
              <span className="min-w-0 self-center break-words text-[0.94rem] leading-5 text-[var(--color-brand-ink)]/82">
                {row.value}
                {row.extensionTone ? (
                  <span className="text-[var(--color-brand-ink)]/48">{row.extensionTone}</span>
                ) : null}
              </span>
              <button
                type="button"
                onClick={() => onCopyField?.(row.label, row.copyValue)}
                disabled={!row.copyValue}
                title={`Copy ${row.label.toLowerCase()}`}
                aria-label={`Copy ${row.label.toLowerCase()}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-black transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showInteractiveSection && (
        <>
          <div className="mt-3 flex justify-center">
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((link) => (
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
                    className="inline-block h-10 w-10"
                    style={getBrandMaskedIconStyle(link.icon)}
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-3 px-1 pb-2.5 pt-3">
            {downloadMenuOpen && (
              <div className="mb-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onDownload?.('jpg')}
                  className="rounded-2xl border border-black/8 bg-[#f3f3f3] px-3 py-3 text-sm font-semibold text-black/75 transition hover:bg-[#e8e8e8]"
                >
                  JPG
                </button>
                <button
                  type="button"
                  onClick={() => onDownload?.('pdf')}
                  className="rounded-2xl border border-black/8 bg-[#f3f3f3] px-3 py-3 text-sm font-semibold text-black/75 transition hover:bg-[#e8e8e8]"
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => onDownload?.('vcf')}
                  className="rounded-2xl border border-black/8 bg-[#f3f3f3] px-3 py-3 text-sm font-semibold text-black/75 transition hover:bg-[#e8e8e8]"
                >
                  VCF
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={onShare}
                aria-label="Share this card"
                title="Share this card"
                className="inline-flex h-9 w-9 -translate-y-1 items-center justify-center text-black transition hover:-translate-y-1.5"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={onCopy}
                aria-label="Copy this card link"
                title="Copy this card link"
                className="inline-flex h-9 w-9 -translate-y-1 items-center justify-center text-black transition hover:-translate-y-1.5"
              >
                <Copy className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={onToggleDownloadMenu}
                disabled={downloading}
                aria-label="Download this card"
                title="Download this card"
                className="inline-flex h-9 w-9 -translate-y-1 items-center justify-center text-black transition hover:-translate-y-1.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:-translate-y-1"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 pt-3">
              <div className="flex justify-center">
                {publicCompanyInfoPath ? (
                  <Link
                    to={publicCompanyInfoPath}
                    state={publicCompanyInfoState}
                    className="inline-flex -translate-y-2 items-center justify-center gap-2 rounded-full bg-[var(--color-brand-red)] px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-2.5 hover:bg-[var(--color-brand-red-dark)]"
                  >
                    <Building2 className="h-4 w-4" />
                    About Company
                  </Link>
                ) : (
                  <div className="inline-flex -translate-y-2 items-center justify-center gap-2 rounded-full border border-black/10 bg-[#f4f4f4] px-5 py-2.5 text-sm font-semibold text-black/55">
                    <Building2 className="h-4 w-4" />
                    Company information unavailable
                  </div>
                )}
              </div>

              {notice && (
                <p className="mt-2.5 text-center text-sm font-medium text-black">
                  {notice}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  </section>
);

export default PublicProfileCardLayout;
