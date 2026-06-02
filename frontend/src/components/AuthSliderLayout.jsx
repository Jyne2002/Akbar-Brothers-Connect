import { Link } from 'react-router-dom';
import ThemedLogo from './ThemedLogo';

const AuthSliderLayout = ({
  title,
  subtitle,
  switchPrompt,
  switchLabel,
  switchTo,
  containerClassName = 'max-w-md',
  children,
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-cream-white)] px-4 py-10 sm:px-6">
      <div className={`w-full ${containerClassName}`}>
        <section className="auth-morph-shell rounded-[1.9rem] border border-[var(--color-brand-red)]/10 bg-white px-6 py-8 shadow-[0_26px_54px_rgba(89,10,22,0.08)] sm:px-8 sm:py-10">
          <div className="mb-6 flex justify-center">
            <ThemedLogo
              src="/akbar-corporate-logo.png"
              alt="Akbar Brothers corporate logo"
              className="theme-logo-image h-20 w-auto object-contain sm:h-24"
            />
          </div>

          <h1 className="font-poppins text-center text-3xl font-bold text-[var(--color-brand-red)] sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-center text-sm text-[var(--color-earth-brown)]/75 sm:text-base">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-8">{children}</div>

          {switchTo && switchLabel ? (
            <p className="mt-6 text-center text-sm text-[var(--color-earth-brown)]/75">
              {switchPrompt ? `${switchPrompt} ` : ''}
              <Link
                to={switchTo}
                viewTransition
                className="font-semibold text-[var(--color-brand-red-dark)] hover:underline"
              >
                {switchLabel}
              </Link>
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default AuthSliderLayout;
