export const getBrandMaskedIconStyle = (iconPath) => ({
  backgroundColor: 'var(--color-brand-red)',
  WebkitMaskImage: `url(${iconPath})`,
  maskImage: `url(${iconPath})`,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
});
