import { getCompanyLabel } from '../constants/companies';

const SRI_LANKA_COUNTRY_CODE = '94';
const CARD_FONT_FAMILY = "'Segoe UI', sans-serif";
const CARD_BRAND_RED = '#B41F31';
const createSvgDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const CONTACT_ICON_SOURCES = {
  phone: createSvgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#151515" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.61 2.63a2 2 0 0 1-.45 2.11L8 9.99a16 16 0 0 0 6 6l1.53-1.27a2 2 0 0 1 2.11-.45c.85.28 1.73.49 2.63.61A2 2 0 0 1 22 16.92z"/></svg>',
  ),
  mobile: createSvgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#151515" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.75" width="10" height="18.5" rx="2.2"/><path d="M11 5.5h2"/><path d="M11.2 17.6h1.6"/></svg>',
  ),
  email: createSvgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#151515" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
  ),
};

export const normalizeLinkedinUrl = (value) => {
  const trimmedValue = typeof value === 'string' ? value.trim() : '';

  if (!trimmedValue) {
    return '';
  }

  return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
};

export const normalizeWhatsappNumber = (value) => {
  const digits = String(value || '').replace(/[^\d]/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (digits.startsWith(SRI_LANKA_COUNTRY_CODE)) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `${SRI_LANKA_COUNTRY_CODE}${digits.slice(1)}`;
  }

  return digits;
};

export const getWhatsappUrl = (phoneNumber) => {
  const normalizedNumber = normalizeWhatsappNumber(phoneNumber);

  return normalizedNumber ? `https://wa.me/${normalizedNumber}` : '';
};

export const formatPhoneWithExtension = (phoneNumber, extensionNumber) => {
  const { combinedText } = getPhoneWithExtensionParts(phoneNumber, extensionNumber);

  return combinedText;
};

export const getPhoneWithExtensionParts = (phoneNumber, extensionNumber) => {
  const normalizedPhoneNumber = String(phoneNumber || '').trim();
  const normalizedExtensionNumber = String(extensionNumber || '').trim();

  if (normalizedPhoneNumber && normalizedExtensionNumber) {
    return {
      mainText: normalizedPhoneNumber,
      extensionText: ` | EXT ${normalizedExtensionNumber}`,
      combinedText: `${normalizedPhoneNumber} | EXT ${normalizedExtensionNumber}`,
    };
  }

  if (normalizedExtensionNumber) {
    return {
      mainText: `EXT ${normalizedExtensionNumber}`,
      extensionText: '',
      combinedText: `EXT ${normalizedExtensionNumber}`,
    };
  }

  return {
    mainText: normalizedPhoneNumber,
    extensionText: '',
    combinedText: normalizedPhoneNumber,
  };
};

const sanitizePublicPathPart = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const buildPublicIdentitySegment = (fullName, employeeNumber) =>
  [sanitizePublicPathPart(fullName), sanitizePublicPathPart(employeeNumber)].filter(Boolean).join('-');

export const buildPublicProfilePath = (
  shareSlug,
  fullName,
  employeeNumber,
  identitySegment = '',
) => {
  if (!shareSlug) {
    return '';
  }

  const resolvedIdentitySegment =
    identitySegment?.trim() || buildPublicIdentitySegment(fullName, employeeNumber);

  return resolvedIdentitySegment ? `/card/${shareSlug}/${resolvedIdentitySegment}` : `/card/${shareSlug}`;
};

export const buildPublicProfileUrl = (
  shareSlug,
  fullName,
  employeeNumber,
  identitySegment = '',
) => {
  if (typeof window === 'undefined') {
    return '';
  }

  const profilePath = buildPublicProfilePath(
    shareSlug,
    fullName,
    employeeNumber,
    identitySegment,
  );

  return profilePath ? `${window.location.origin}${profilePath}` : '';
};

export const buildPublicCompanyInfoUrl = (
  shareSlug,
  companyCode,
  fullName,
  employeeNumber,
  identitySegment = '',
) => {
  if (!companyCode) {
    return '';
  }

  const profilePath = buildPublicProfilePath(
    shareSlug,
    fullName,
    employeeNumber,
    identitySegment,
  );

  return profilePath ? `${profilePath}/company/${encodeURIComponent(companyCode)}` : '';
};

const sanitizeFileStem = (value) =>
  String(value || 'employee-card')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'employee-card';

const downloadBlob = (blob, fileName) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 500);
};

const blobToUint8Array = async (blob) => new Uint8Array(await blob.arrayBuffer());

const concatenateUint8Arrays = (parts) => {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((part) => {
    combined.set(part, offset);
    offset += part.length;
  });

  return combined;
};

const createPdfFromJpegBytes = (jpegBytes, pageWidth, pageHeight, imageWidth, imageHeight) => {
  const encoder = new TextEncoder();
  const parts = [];
  const offsets = [0];
  let cursor = 0;

  const pushText = (text) => {
    const encoded = encoder.encode(text);
    parts.push(encoded);
    cursor += encoded.length;
  };

  const pushBinary = (bytes) => {
    parts.push(bytes);
    cursor += bytes.length;
  };

  pushText('%PDF-1.4\n%\u00ff\u00ff\u00ff\u00ff\n');

  offsets[1] = cursor;
  pushText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  offsets[2] = cursor;
  pushText('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  offsets[3] = cursor;
  pushText(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`,
  );

  const contentStream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  offsets[4] = cursor;
  pushText(`4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

  offsets[5] = cursor;
  pushText(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  );
  pushBinary(jpegBytes);
  pushText('\nendstream\nendobj\n');

  const xrefOffset = cursor;
  pushText('xref\n0 6\n0000000000 65535 f \n');

  for (let index = 1; index <= 5; index += 1) {
    pushText(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`);
  }

  pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob([concatenateUint8Arrays(parts)], { type: 'application/pdf' });
};

const ensureFontsReady = async () => {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue with the browser's fallback font if custom fonts are unavailable.
    }
  }
};

const toAbsoluteAssetUrl = (src) => {
  if (!src) {
    return '';
  }

  if (/^(data:|blob:|https?:)/i.test(src)) {
    return src;
  }

  return new URL(src, window.location.href).href;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const resolvedSrc = toAbsoluteAssetUrl(src);

    if (!resolvedSrc) {
      reject(new Error('Missing image source'));
      return;
    }

    const image = new Image();

    if (!/^data:/i.test(resolvedSrc)) {
      image.crossOrigin = 'anonymous';
    }

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${resolvedSrc}`));
    image.src = resolvedSrc;
  });

const drawRoundedRectanglePath = (context, x, y, width, height, radius) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
};

const wrapLongToken = (context, token, maxWidth) => {
  const segments = [];
  let currentSegment = '';

  Array.from(token).forEach((character) => {
    const nextSegment = `${currentSegment}${character}`;

    if (currentSegment && context.measureText(nextSegment).width > maxWidth) {
      segments.push(currentSegment);
      currentSegment = character;
      return;
    }

    currentSegment = nextSegment;
  });

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
};

const wrapText = (context, value, maxWidth) => {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return [''];
  }

  const tokens = normalizedValue.split(/\s+/);
  const lines = [];
  let currentLine = '';

  tokens.forEach((token) => {
    const tokenPieces =
      context.measureText(token).width <= maxWidth ? [token] : wrapLongToken(context, token, maxWidth);

    tokenPieces.forEach((piece) => {
      const nextLine = currentLine ? `${currentLine} ${piece}` : piece;

      if (currentLine && context.measureText(nextLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = piece;
        return;
      }

      currentLine = nextLine;
    });
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
};

const drawWrappedText = (context, lines, x, y, lineHeight) => {
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
};

const getCardFileStem = (profile) =>
  sanitizeFileStem(profile.fullName || profile.employeeNumber || profile.shareSlug || 'employee-card');

const createCardArtwork = async (profile, company) => {
  await ensureFontsReady();

  const scale = 3;
  const logicalWidth = 380;
  const pagePadding = 16;
  const cardX = pagePadding;
  const cardY = pagePadding;
  const cardWidth = logicalWidth - pagePadding * 2;
  const cardRadius = 39;
  const headerHeight = 168;
  const avatarSize = 112;
  const avatarOverlap = 24;
  const avatarTop = cardY + headerHeight - avatarOverlap;
  const avatarCenterX = logicalWidth / 2;
  const nameTop = avatarTop + avatarSize + 16;
  const boxX = cardX + 16;
  const boxWidth = cardWidth - 32;
  const iconColumnWidth = 20;
  const rowGap = 14;
  const boxPadding = 16;
  const valueColumnX = boxX + boxPadding + iconColumnWidth + rowGap;
  const valueColumnWidth = boxWidth - boxPadding * 2 - iconColumnWidth - rowGap;
  const departmentValue = String(profile.department || '').trim();
  const jobRoleValue = String(profile.jobRole || '').trim();
  const companyNameValue = String(company?.companyName || getCompanyLabel(profile.company) || '').trim();
  const phoneValue = getPhoneWithExtensionParts(profile.phoneNumber, profile.extensionNumber);
  const details = [
    {
      label: 'Phone',
      value: phoneValue.combinedText || 'Not shared yet',
      mainText: phoneValue.mainText,
      extensionText: phoneValue.extensionText,
      icon: 'phone',
    },
    { label: 'Mobile', value: profile.mobileNumber || 'Not shared yet', icon: 'mobile' },
    { label: 'Email', value: profile.email || 'Not shared yet', icon: 'email' },
  ];

  const measurementCanvas = document.createElement('canvas');
  const measurementContext = measurementCanvas.getContext('2d');

  if (!measurementContext) {
    throw new Error('Unable to prepare the profile card for download');
  }

  measurementContext.font = `600 15px ${CARD_FONT_FAMILY}`;
  const nameMaxWidth = 248;
  const nameLines = wrapText(measurementContext, profile.fullName || 'Employee Card', nameMaxWidth);
  const nameLineHeight = 34;
  const nameHeight = nameLines.length * nameLineHeight;

  measurementContext.font = `700 12px ${CARD_FONT_FAMILY}`;
  const departmentLines = departmentValue
    ? wrapText(measurementContext, departmentValue.toUpperCase(), 270)
    : [];
  const departmentLineHeight = 18;
  const departmentHeight = departmentLines.length * departmentLineHeight;

  measurementContext.font = `700 18px ${CARD_FONT_FAMILY}`;
  const jobRoleLines = jobRoleValue ? wrapText(measurementContext, jobRoleValue, 270) : [];
  const jobRoleLineHeight = 25;
  const jobRoleHeight = jobRoleLines.length * jobRoleLineHeight;
  measurementContext.font = `400 14px ${CARD_FONT_FAMILY}`;
  const companyLineHeight = 20;
  const companyLines = companyNameValue ? wrapText(measurementContext, companyNameValue, 270) : [];
  const companyHeight = companyLines.length * companyLineHeight;
  let subtitleHeight = 0;

  if (departmentHeight > 0) {
    subtitleHeight += departmentHeight;
  }

  if (jobRoleHeight > 0) {
    subtitleHeight += (subtitleHeight > 0 ? 4 : 0) + jobRoleHeight;
  }

  if (companyHeight > 0) {
    subtitleHeight += (subtitleHeight > 0 ? 6 : 0) + companyHeight;
  }

  measurementContext.font = `600 15px ${CARD_FONT_FAMILY}`;
  const detailMeasurements = details.map((detail) => {
    const lines = wrapText(measurementContext, detail.value, valueColumnWidth);
    const rowContentHeight = Math.max(20, lines.length * 24);
    const canTintExtensionInline = Boolean(
      detail.extensionText &&
        lines.length === 1 &&
        detail.mainText &&
        measurementContext.measureText(detail.value).width <= valueColumnWidth,
    );

    return {
      ...detail,
      lines,
      canTintExtensionInline,
      rowContentHeight,
    };
  });

  const detailsHeight =
    boxPadding * 2 +
    detailMeasurements.reduce(
      (totalHeight, detail, index) =>
        totalHeight + detail.rowContentHeight + (index < detailMeasurements.length - 1 ? 12 : 0),
      0,
    );
  const boxTop = nameTop + nameHeight + (subtitleHeight ? 16 + subtitleHeight : 0) + 22;
  const cardHeight = boxTop - cardY + detailsHeight + 28;
  const logicalHeight = Math.ceil(cardY + cardHeight + pagePadding);

  const canvas = document.createElement('canvas');
  canvas.width = logicalWidth * scale;
  canvas.height = logicalHeight * scale;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to prepare the profile card for download');
  }

  context.scale(scale, scale);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, logicalWidth, logicalHeight);

  context.save();
  context.shadowColor = 'rgba(89,20,36,0.11)';
  context.shadowBlur = 24;
  context.shadowOffsetY = 10;
  drawRoundedRectanglePath(context, cardX, cardY, cardWidth, cardHeight, cardRadius);
  context.fillStyle = '#ffffff';
  context.fill();
  context.restore();

  context.save();
  drawRoundedRectanglePath(context, cardX, cardY, cardWidth, cardHeight, cardRadius);
  context.clip();
  context.fillStyle = '#ffffff';
  context.fillRect(cardX, cardY, cardWidth, headerHeight);
  context.restore();

  const logoSource = company?.logo || '/akbar-corporate-logo.png';
  const contactIcons = Object.fromEntries(
    await Promise.all(
      Object.entries(CONTACT_ICON_SOURCES).map(async ([key, src]) => [key, await loadImage(src)]),
    ),
  );

  try {
    const logoImage = await loadImage(logoSource);
    const maxLogoHeight = 88;
    const maxLogoWidth = 260;
    const logoRatio = Math.min(maxLogoWidth / logoImage.width, maxLogoHeight / logoImage.height);
    const logoWidth = logoImage.width * logoRatio;
    const logoHeight = logoImage.height * logoRatio;

    context.drawImage(
      logoImage,
      logicalWidth / 2 - logoWidth / 2,
      cardY + headerHeight / 2 - logoHeight / 2,
      logoWidth,
      logoHeight,
    );
  } catch {
    context.fillStyle = '#151515';
    context.font = `900 16px ${CARD_FONT_FAMILY}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      company?.companyName || getCompanyLabel(profile.company) || 'Akbar Brothers',
      logicalWidth / 2,
      cardY + headerHeight / 2,
    );
  }

  context.save();
  context.shadowColor = 'rgba(89,10,22,0.2)';
  context.shadowBlur = 18;
  context.shadowOffsetY = 10;
  context.beginPath();
  context.arc(avatarCenterX, avatarTop + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  context.fillStyle = '#ffffff';
  context.fill();
  context.restore();

  context.save();
  context.beginPath();
  context.arc(avatarCenterX, avatarTop + avatarSize / 2, avatarSize / 2 - 5, 0, Math.PI * 2);
  context.closePath();
  context.clip();

  if (profile.profileImage) {
    try {
      const profileImage = await loadImage(profile.profileImage);
      const drawSize = avatarSize - 10;
      context.drawImage(profileImage, avatarCenterX - drawSize / 2, avatarTop + 5, drawSize, drawSize);
    } catch {
      context.fillStyle = CARD_BRAND_RED;
      context.fillRect(avatarCenterX - avatarSize / 2, avatarTop, avatarSize, avatarSize);
    }
  } else {
    context.fillStyle = CARD_BRAND_RED;
    context.fillRect(avatarCenterX - avatarSize / 2, avatarTop, avatarSize, avatarSize);
  }

  context.restore();

  if (!profile.profileImage) {
    const initials = (profile.fullName || 'AB')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();

    context.fillStyle = '#ffffff';
    context.font = `900 34px ${CARD_FONT_FAMILY}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(initials || 'AB', avatarCenterX, avatarTop + avatarSize / 2 + 2);
  }

  context.fillStyle = '#151515';
  context.font = `900 30px ${CARD_FONT_FAMILY}`;
  context.textAlign = 'center';
  context.textBaseline = 'top';
  drawWrappedText(context, nameLines, logicalWidth / 2, nameTop, nameLineHeight);

  let subtitleTop = nameTop + nameHeight + 16;

  if (departmentLines.length > 0) {
    context.fillStyle = 'rgba(180,31,49,0.84)';
    context.font = `700 12px ${CARD_FONT_FAMILY}`;
    drawWrappedText(context, departmentLines, logicalWidth / 2, subtitleTop, departmentLineHeight);
    subtitleTop += departmentHeight;
  }

  if (jobRoleLines.length > 0) {
    if (departmentLines.length > 0) {
      subtitleTop += 4;
    }

    context.fillStyle = 'rgba(21,21,21,0.8)';
    context.font = `700 18px ${CARD_FONT_FAMILY}`;
    drawWrappedText(context, jobRoleLines, logicalWidth / 2, subtitleTop, jobRoleLineHeight);
    subtitleTop += jobRoleHeight;
  }

  if (companyLines.length > 0) {
    if (departmentLines.length > 0 || jobRoleLines.length > 0) {
      subtitleTop += 6;
    }

    context.fillStyle = 'rgba(21,21,21,0.66)';
    context.font = `400 14px ${CARD_FONT_FAMILY}`;
    drawWrappedText(context, companyLines, logicalWidth / 2, subtitleTop, companyLineHeight);
  }

  const boxHeight = detailsHeight;
  drawRoundedRectanglePath(context, boxX, boxTop, boxWidth, boxHeight, 28);
  context.fillStyle = '#ffffff';
  context.fill();
  context.strokeStyle = 'rgba(0,0,0,0.08)';
  context.lineWidth = 1;
  context.stroke();

  let currentRowY = boxTop + boxPadding;
  detailMeasurements.forEach((detail, index) => {
    const iconImage = contactIcons[detail.icon];
    context.font = `600 15px ${CARD_FONT_FAMILY}`;
    context.textAlign = 'left';
    context.textBaseline = 'top';

    if (iconImage) {
      context.drawImage(iconImage, boxX + boxPadding, currentRowY + 2, 16, 16);
    }

    if (detail.canTintExtensionInline) {
      context.fillStyle = 'rgba(21,21,21,0.82)';
      context.fillText(detail.mainText, valueColumnX, currentRowY);
      context.fillStyle = 'rgba(21,21,21,0.48)';
      context.fillText(
        detail.extensionText,
        valueColumnX + context.measureText(detail.mainText).width,
        currentRowY,
      );
    } else {
      context.fillStyle = 'rgba(21,21,21,0.82)';
      drawWrappedText(context, detail.lines, valueColumnX, currentRowY, 24);
    }

    currentRowY += detail.rowContentHeight;

    if (index < detailMeasurements.length - 1) {
      currentRowY += 12;
      context.strokeStyle = 'rgba(0,0,0,0.08)';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(boxX + boxPadding, currentRowY - 6);
      context.lineTo(boxX + boxWidth - boxPadding, currentRowY - 6);
      context.stroke();
    }
  });

  return {
    canvas,
    pageWidth: logicalWidth,
    pageHeight: logicalHeight,
  };
};

export const downloadProfileAsJpg = async (profile, company) => {
  const { canvas } = await createCardArtwork(profile, company);

  const jpgBlob = await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to create JPG file'));
        return;
      }

      resolve(blob);
    }, 'image/jpeg', 0.96);
  });

  downloadBlob(jpgBlob, `${getCardFileStem(profile)}.jpg`);
};

export const downloadProfileAsPdf = async (profile, company) => {
  const { canvas, pageWidth, pageHeight } = await createCardArtwork(profile, company);

  const jpgBlob = await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to create PDF source image'));
        return;
      }

      resolve(blob);
    }, 'image/jpeg', 0.96);
  });

  const pdfBlob = createPdfFromJpegBytes(
    await blobToUint8Array(jpgBlob),
    pageWidth,
    pageHeight,
    canvas.width,
    canvas.height,
  );

  downloadBlob(pdfBlob, `${getCardFileStem(profile)}.pdf`);
};

const escapeVCardValue = (value) =>
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');

export const downloadProfileAsVcf = (profile, company) => {
  const noteParts = [profile.department, profile.extensionNumber ? `EXT ${profile.extensionNumber}` : ''].filter(
    Boolean,
  );

  const vCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardValue(profile.fullName)}`,
    `ORG:${escapeVCardValue(company?.companyName || getCompanyLabel(profile.company))}`,
    `TITLE:${escapeVCardValue(profile.jobRole)}`,
    `EMAIL:${escapeVCardValue(profile.email)}`,
    profile.phoneNumber ? `TEL;TYPE=WORK,VOICE:${escapeVCardValue(profile.phoneNumber)}` : '',
    profile.mobileNumber
      ? `TEL;TYPE=CELL:${escapeVCardValue(profile.mobileNumber)}`
      : profile.phoneNumber
        ? `TEL;TYPE=CELL:${escapeVCardValue(profile.phoneNumber)}`
        : '',
    `URL:${escapeVCardValue(normalizeLinkedinUrl(profile.linkedinUrl))}`,
    `NOTE:${escapeVCardValue(noteParts.join(' | '))}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');

  downloadBlob(new Blob([vCard], { type: 'text/vcard;charset=utf-8' }), `${getCardFileStem(profile)}.vcf`);
};
