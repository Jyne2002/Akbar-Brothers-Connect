import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Copy,
  Download,
  Eye,
  Loader2,
  Mail,
  Phone,
  QrCode,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  Users,
} from 'lucide-react';
import QRCode from 'qrcode';
import { COMPANIES, getCompanyCode, getCompanyLabel } from '../constants/companies';
import api from '../utils/api';
import { getStoredUser } from '../utils/auth';
import { buildPublicProfileUrl } from '../utils/profileCard';

const inputClassName =
  'theme-field w-full rounded-2xl border border-black/10 bg-[#f4f4f4] px-4 py-3 text-sm text-black outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/8';
const activeFilterButtonClassName =
  'border border-[var(--color-brand-red)] bg-[var(--color-brand-red)] text-white shadow-[0_14px_28px_rgba(142,20,36,0.18)]';
const primaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-brand-red)] bg-[var(--color-brand-red)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]';
const compactPrimaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-brand-red)] bg-[var(--color-brand-red)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]';
const slimInputClassName =
  'theme-field w-full min-h-10 rounded-xl border border-black/10 bg-[#f4f4f4] px-4 py-2 text-sm text-black outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/8';
const slimPrimaryButtonClassName =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[var(--color-brand-red)] bg-[var(--color-brand-red)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]';
const disabledPrimaryButtonClassName =
  'disabled:cursor-not-allowed disabled:border-[var(--color-brand-red)]/45 disabled:bg-[var(--color-brand-red)]/45 disabled:text-white/80';

const matchesUserSearch = (user, searchValue) => {
  const normalizedSearch = searchValue.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [
    user.employeeNumber,
    user.fullName,
    user.email,
    user.department,
    user.jobRole,
    user.whatsappNumber,
    user.phoneNumber,
    user.mobileNumber,
    user.company,
    getCompanyLabel(user.company),
    user.role,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch);
};

const sortUsers = (records) =>
  [...records].sort((firstUser, secondUser) =>
    (firstUser.fullName || firstUser.employeeNumber || '').localeCompare(
      secondUser.fullName || secondUser.employeeNumber || '',
    ),
  );

const QR_CODE_OPTIONS = {
  width: 280,
  margin: 1,
  color: {
    dark: '#151515',
    light: '#FFFFFFFF',
  },
};

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    if (src && !/^data:/i.test(src)) {
      image.crossOrigin = 'anonymous';
    }

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('We could not prepare that image.'));
    image.src = src;
  });

const buildUserInitials = (user) =>
  (user?.fullName || user?.employeeNumber || 'AB')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const sanitizeFileStem = (value) =>
  String(value || 'employee')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'employee';

const AdminPanel = () => {
  const userInfo = getStoredUser();
  const [activeSection, setActiveSection] = useState('admins');
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]?.code || 'A');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPromotionUserId, setSelectedPromotionUserId] = useState('');
  const [pendingRoleUserId, setPendingRoleUserId] = useState('');
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState('');
  const [isPromotingSelectedUser, setIsPromotingSelectedUser] = useState(false);
  const [expandedQrUserId, setExpandedQrUserId] = useState('');
  const [qrPreviewDataUrls, setQrPreviewDataUrls] = useState({});
  const [qrLoadingUserId, setQrLoadingUserId] = useState('');

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccess('');
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [success]);

  const requestConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${userInfo?.token}` },
    }),
    [userInfo?.token],
  );

  const fetchUsers = useCallback(async ({ showLoadingState = true, showRefreshingState = false } = {}) => {
    try {
      if (showLoadingState) {
        setLoadingUsers(true);
      }

      if (showRefreshingState) {
        setIsRefreshingUsers(true);
      }

      setError('');
      const { data } = await api.get('/api/auth/users', requestConfig);
      setUsers(data);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Failed to load users');
    } finally {
      if (showLoadingState) {
        setLoadingUsers(false);
      }

      if (showRefreshingState) {
        setIsRefreshingUsers(false);
      }
    }
  }, [requestConfig]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (
      selectedPromotionUserId &&
      !users.some((user) => String(user._id) === selectedPromotionUserId && user.role !== 'admin')
    ) {
      setSelectedPromotionUserId('');
    }
  }, [selectedPromotionUserId, users]);

  const adminUsers = useMemo(
    () =>
      sortUsers(users.filter((user) => user.role === 'admin' && matchesUserSearch(user, userSearch))),
    [userSearch, users],
  );

  const eligibleUsers = useMemo(
    () => sortUsers(users.filter((user) => user.role !== 'admin')),
    [users],
  );

  const employeeRecords = useMemo(
    () =>
      sortUsers(
        users.filter(
          (user) =>
            getCompanyCode(user.company) === selectedCompany && matchesUserSearch(user, employeeSearch),
        ),
      ),
    [employeeSearch, selectedCompany, users],
  );

  const handleRoleToggle = async (user, { isPromotionAction = false } = {}) => {
    const nextRole = user.role === 'admin' ? 'employee' : 'admin';
    const actionLabel =
      nextRole === 'admin' ? 'grant admin access to' : 'remove admin access from';

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} ${user.fullName || user.employeeNumber}?`,
      )
    ) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      if (isPromotionAction) {
        setIsPromotingSelectedUser(true);
      } else {
        setPendingRoleUserId(String(user._id));
      }
      await api.put(`/api/auth/users/${user._id}/role`, { role: nextRole }, requestConfig);
      await fetchUsers({ showLoadingState: false });
      setSuccess(
        `${user.fullName || user.employeeNumber} is now ${
          nextRole === 'admin' ? 'an admin' : 'an employee'
        }.`,
      );
    } catch (toggleError) {
      setError(toggleError.response?.data?.message || 'Failed to update user role');
    } finally {
      setPendingRoleUserId('');
      setIsPromotingSelectedUser(false);
    }
  };

  const handlePromoteSelectedUser = async () => {
    const selectedUser = eligibleUsers.find((user) => String(user._id) === selectedPromotionUserId);
    if (!selectedUser) {
      setError('Choose an employee account before granting admin access');
      setSuccess('');
      return;
    }

    await handleRoleToggle(selectedUser, { isPromotionAction: true });
    setSelectedPromotionUserId('');
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete the account for ${user.fullName || user.employeeNumber}?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setPendingDeleteUserId(String(user._id));
      await api.delete(`/api/auth/users/${user._id}`, requestConfig);
      await fetchUsers({ showLoadingState: false });
      setSuccess(`${user.fullName || user.employeeNumber} was removed from the system.`);
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Failed to delete user');
    } finally {
      setPendingDeleteUserId('');
    }
  };

  const getEmployeePublicCardUrl = (user) => {
    if (!user?.shareSlug || !user?.profileCompleted) {
      return '';
    }

    return buildPublicProfileUrl(user.shareSlug, user.fullName, user.employeeNumber);
  };

  const handleCopyPublicCardLink = async (user) => {
    const publicCardUrl = getEmployeePublicCardUrl(user);

    if (!publicCardUrl) {
      setError(`${user.fullName || user.employeeNumber} does not have a public profile card yet.`);
      setSuccess('');
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicCardUrl);
        setError('');
        setSuccess(`Public profile link copied for ${user.fullName || user.employeeNumber}.`);
        return;
      }

      window.prompt('Copy this public profile link:', publicCardUrl);
      setError('');
      setSuccess(`Public profile link ready to copy for ${user.fullName || user.employeeNumber}.`);
    } catch (copyError) {
      setError(copyError?.message || 'We could not copy that public profile link right now.');
      setSuccess('');
    }
  };

  const handleSharePublicCardLink = async (user) => {
    const publicCardUrl = getEmployeePublicCardUrl(user);

    if (!publicCardUrl) {
      setError(`${user.fullName || user.employeeNumber} does not have a public profile card yet.`);
      setSuccess('');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user.fullName || user.employeeNumber} | Employee Card`,
          text: `View ${(user.fullName || user.employeeNumber)}'s employee visiting card.`,
          url: publicCardUrl,
        });
        setError('');
        setSuccess(`Public profile link shared for ${user.fullName || user.employeeNumber}.`);
        return;
      }

      await handleCopyPublicCardLink(user);
    } catch (shareError) {
      setError(shareError?.message || 'We could not share that public profile link right now.');
      setSuccess('');
    }
  };

  const getQrPreviewDataUrl = async (user) => {
    const publicCardUrl = getEmployeePublicCardUrl(user);

    if (!publicCardUrl) {
      throw new Error(`${user.fullName || user.employeeNumber} does not have a public profile card yet.`);
    }

    if (qrPreviewDataUrls[user._id]) {
      return qrPreviewDataUrls[user._id];
    }

    const qrDataUrl = await QRCode.toDataURL(publicCardUrl, QR_CODE_OPTIONS);
    setQrPreviewDataUrls((currentValue) => ({
      ...currentValue,
      [user._id]: qrDataUrl,
    }));
    return qrDataUrl;
  };

  const buildQrCardCanvas = async (user) => {
    const qrDataUrl = await getQrPreviewDataUrl(user);
    const qrImage = await loadImageElement(qrDataUrl);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('We could not prepare that QR code right now.');
    }

    const canvasWidth = 340;
    const canvasHeight = 320;
    const qrSize = 220;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = 86;
    const avatarSize = 54;
    const avatarY = 22;
    let hasRenderedProfileImage = false;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    const displayName = user.fullName || user.employeeNumber || 'Employee';
    context.fillStyle = '#151515';
    context.font = "700 17px 'Segoe UI', sans-serif";
    context.textAlign = 'left';
    context.textBaseline = 'middle';

    const maxNameWidth = canvasWidth - 88;
    const measuredNameWidth = Math.min(context.measureText(displayName).width, maxNameWidth);
    const headerGap = 14;
    const headerWidth = avatarSize + headerGap + measuredNameWidth;
    const headerX = Math.max(22, (canvasWidth - headerWidth) / 2);
    const avatarX = headerX;
    const nameX = avatarX + avatarSize + headerGap;
    const nameY = avatarY + avatarSize / 2;

    context.save();
    context.beginPath();
    context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    context.closePath();
    context.clip();

    if (user.profileImage) {
      try {
        const profileImage = await loadImageElement(user.profileImage);
        context.drawImage(profileImage, avatarX, avatarY, avatarSize, avatarSize);
        hasRenderedProfileImage = true;
      } catch {
        context.fillStyle = '#B41F31';
        context.fillRect(avatarX, avatarY, avatarSize, avatarSize);
      }
    } else {
      context.fillStyle = '#B41F31';
      context.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    }

    context.restore();

    if (!hasRenderedProfileImage) {
      context.fillStyle = '#FFFFFF';
      context.font = "700 24px 'Segoe UI', sans-serif";
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(buildUserInitials(user) || 'AB', avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 1);
    }

    context.fillStyle = '#151515';
    context.font = "700 17px 'Segoe UI', sans-serif";
    context.textAlign = 'left';
    context.textBaseline = 'middle';

    const nameWords = displayName.split(/\s+/).filter(Boolean);
    const nameLines = [];
    let currentLine = '';

    nameWords.forEach((word) => {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;

      if (currentLine && context.measureText(nextLine).width > maxNameWidth) {
        nameLines.push(currentLine);
        currentLine = word;
        return;
      }

      currentLine = nextLine;
    });

    if (currentLine) {
      nameLines.push(currentLine);
    }

    nameLines.slice(0, 2).forEach((line, index) => {
      const lineOffset = nameLines.length > 1 ? (index === 0 ? -10 : 10) : 0;
      context.fillText(line, nameX, nameY + lineOffset);
    });

    context.fillStyle = '#FFFFFF';
    context.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
    context.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    return canvas;
  };

  const handleToggleQrPreview = async (user) => {
    if (!getEmployeePublicCardUrl(user)) {
      setError(`${user.fullName || user.employeeNumber} does not have a public profile card yet.`);
      setSuccess('');
      return;
    }

    if (expandedQrUserId === String(user._id)) {
      setExpandedQrUserId('');
      setError('');
      setSuccess('');
      return;
    }

    try {
      setQrLoadingUserId(String(user._id));
      await getQrPreviewDataUrl(user);
      setExpandedQrUserId(String(user._id));
      setError('');
      setSuccess('');
    } catch (qrError) {
      setError(qrError?.message || 'We could not generate that QR code right now.');
      setSuccess('');
    } finally {
      setQrLoadingUserId('');
    }
  };

  const handleCopyPublicCardQr = async (user) => {
    try {
      if (!navigator.clipboard?.write || !window.ClipboardItem) {
        setError('This browser does not support copying QR images to the clipboard yet.');
        setSuccess('');
        return;
      }

      const canvas = await buildQrCardCanvas(user);
      const qrBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('We could not create the QR code image.'));
            return;
          }

          resolve(blob);
        }, 'image/png');
      });

      await navigator.clipboard.write([
        new window.ClipboardItem({
          [qrBlob.type || 'image/png']: qrBlob,
        }),
      ]);

      setError('');
      setSuccess(`QR code copied for ${user.fullName || user.employeeNumber}.`);
    } catch (copyError) {
      setError(copyError?.message || 'We could not copy that QR code right now.');
      setSuccess('');
    }
  };

  const handleDownloadPublicCardQr = async (user) => {
    try {
      const canvas = await buildQrCardCanvas(user);

      const jpgBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('We could not create the QR code image.'));
            return;
          }

          resolve(blob);
        }, 'image/jpeg', 0.96);
      });

      const objectUrl = window.URL.createObjectURL(jpgBlob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${sanitizeFileStem(user.fullName || user.employeeNumber || 'employee')}-qr.jpg`;
      link.click();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 500);

      setError('');
      setSuccess(`QR code downloaded for ${user.fullName || user.employeeNumber}.`);
    } catch (downloadError) {
      setError(downloadError?.message || 'We could not download that QR code right now.');
      setSuccess('');
    }
  };

  const selectedCompanyLabel = getCompanyLabel(selectedCompany);

  return (
    <div className="space-y-8 pb-12 pt-4 animate-in fade-in duration-500">
      <section className="rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,_rgba(255,255,255,0.97)_0%,_rgba(241,241,241,0.94)_100%)] p-7 shadow-[0_28px_60px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
              Admin Panel
            </p>
            <h1 className="mt-2 text-4xl font-black text-black">Manage employees and access</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveSection('admins')}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeSection === 'admins'
                  ? activeFilterButtonClassName
                  : 'border border-black/10 bg-white text-black hover:bg-[#f3f3f3]'
              }`}
            >
              Manage Admins
            </button>
            <button
              onClick={() => setActiveSection('employees')}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeSection === 'employees'
                  ? activeFilterButtonClassName
                  : 'border border-black/10 bg-white text-black hover:bg-[#f3f3f3]'
              }`}
            >
              Manage Employees
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-black/10 bg-[#f3f3f3] px-4 py-3 text-sm text-black">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-black/10 bg-[#f3f3f3] px-4 py-3 text-sm text-black">
          {success}
        </div>
      )}

      {activeSection === 'admins' ? (
        <section className="rounded-[1.9rem] border border-black/8 bg-white/90 p-6 shadow-[0_22px_54px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-black">Admin access management</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[18rem]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search users"
                  className="w-full rounded-full border border-black/10 bg-[#f4f4f4] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/8"
                />
              </div>
              <button
                onClick={() => fetchUsers({ showLoadingState: false, showRefreshingState: true })}
                disabled={isRefreshingUsers}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRefreshingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-[1.35rem] border border-black/10 bg-[#f7f7f7] p-3.5">
            <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-xl">
                <h3 className="text-[0.96rem] font-bold text-black">Grant admin access</h3>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row xl:max-w-[44rem]">
                <select
                  value={selectedPromotionUserId}
                  onChange={(event) => setSelectedPromotionUserId(event.target.value)}
                  className={slimInputClassName}
                  disabled={eligibleUsers.length === 0}
                >
                  {eligibleUsers.length === 0 ? (
                    <option value="" disabled>
                      No employee accounts available
                    </option>
                  ) : (
                    <option value="" disabled hidden>
                      Select an employee account
                    </option>
                  )}
                  {eligibleUsers.map((user) => (
                    <option key={user._id} value={String(user._id)}>
                      {user.fullName || user.employeeNumber}{' '}
                      {user.employeeNumber ? `(${user.employeeNumber})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handlePromoteSelectedUser}
                  disabled={!selectedPromotionUserId || isPromotingSelectedUser}
                  className={`${slimPrimaryButtonClassName} ${disabledPrimaryButtonClassName}`}
                >
                  {isPromotingSelectedUser ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Make admin
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loadingUsers ? (
              <div className="flex justify-center p-10">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-black" />
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-[#f4f4f4] p-10 text-center text-black/65">
                No admin accounts matched that search.
              </div>
            ) : (
              adminUsers.map((user) => (
                <div
                  key={user._id}
                  className="rounded-[1.6rem] border border-black/10 bg-[#fafafa] p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#ededed] text-black/65">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName || user.employeeNumber}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Users className="h-7 w-7" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-black">
                            {user.fullName || user.employeeNumber}
                          </h3>
                          <span className="rounded-full border border-black/10 bg-[#f0f0f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-black">
                            Admin
                          </span>
                          {user._id === userInfo?._id && (
                            <span className="rounded-full border border-black/10 bg-[#e9e9e9] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-black">
                              You
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-black/70 sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-black/70" />
                            {user.employeeNumber || 'No employee number'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-black/70" />
                            {user.email || 'Email not added yet'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-black/70" />
                            {user.phoneNumber || 'Phone not added yet'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-black/70" />
                            {getCompanyLabel(user.company) || 'No company added yet'}
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Briefcase className="h-4 w-4 text-black/70" />
                            {[user.jobRole, user.department].filter(Boolean).join(' / ') ||
                              'Role and department not added yet'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleRoleToggle(user)}
                        disabled={
                          (user._id === userInfo?._id && user.role === 'admin') ||
                          pendingRoleUserId === String(user._id)
                        }
                        className={`${compactPrimaryButtonClassName} ${disabledPrimaryButtonClassName}`}
                      >
                        {pendingRoleUserId === String(user._id) ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Remove admin
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={user._id === userInfo?._id || pendingDeleteUserId === String(user._id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:border-black/8 disabled:text-black/35"
                      >
                        {pendingDeleteUserId === String(user._id) ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Delete user
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-[1.9rem] border border-black/8 bg-white/90 p-6 shadow-[0_22px_54px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-black text-black">Employee management</h2>
            </div>

            <button
              onClick={() => fetchUsers({ showLoadingState: false, showRefreshingState: true })}
              disabled={isRefreshingUsers}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRefreshingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {COMPANIES.map((company) => (
                <button
                  key={company.code}
                  onClick={() => setSelectedCompany(company.code)}
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    selectedCompany === company.code
                      ? activeFilterButtonClassName
                      : 'border border-black/10 bg-white text-black hover:bg-[#f3f3f3]'
                  }`}
                >
                  {company.name}
                </button>
              ))}
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
              <input
                type="text"
                value={employeeSearch}
                onChange={(event) => setEmployeeSearch(event.target.value)}
                placeholder={`Search ${selectedCompanyLabel} employees`}
                className="w-full rounded-full border border-black/10 bg-[#f4f4f4] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/8"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loadingUsers ? (
              <div className="flex justify-center p-10">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-black" />
              </div>
            ) : employeeRecords.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-[#f4f4f4] p-10 text-center text-black/65">
                No employee records found for {selectedCompanyLabel}.
              </div>
            ) : (
              employeeRecords.map((user) => {
                const hasPublicCard = Boolean(getEmployeePublicCardUrl(user));

                return (
                  <div
                    key={user._id}
                    className="rounded-[1.6rem] border border-black/10 bg-white p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#ededed] text-black/65">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.fullName || user.employeeNumber}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users className="h-7 w-7" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-bold text-black">
                              {user.fullName || user.employeeNumber}
                            </h3>
                            <span className="rounded-full border border-black/10 bg-[#f0f0f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-black">
                              {user.employeeNumber || 'No employee number'}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-black/70 sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-black/70" />
                              {user.email || 'Email not added yet'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-black/70" />
                              {user.phoneNumber || 'Phone not added yet'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-black/70" />
                              {getCompanyLabel(user.company) || 'No company added yet'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-black/70" />
                              {user.jobRole || 'Role not added yet'}
                            </div>
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <Briefcase className="h-4 w-4 text-black/70" />
                              {user.department || 'Department not added yet'}
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="flex flex-wrap items-start gap-3">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => handleToggleQrPreview(user)}
                            disabled={!hasPublicCard}
                            title={
                              hasPublicCard
                                ? expandedQrUserId === String(user._id)
                                  ? 'Hide QR code'
                                  : 'Show QR code'
                                : 'Public profile card not available yet'
                            }
                            aria-label={
                              hasPublicCard
                                ? expandedQrUserId === String(user._id)
                                  ? 'Hide QR code'
                                  : 'Show QR code'
                                : 'Public profile card not available yet'
                            }
                            aria-expanded={expandedQrUserId === String(user._id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:border-black/8 disabled:text-black/35 disabled:hover:bg-white"
                          >
                            {qrLoadingUserId === String(user._id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <QrCode className="h-4 w-4" />
                            )}
                          </button>

                          {expandedQrUserId === String(user._id) && qrPreviewDataUrls[user._id] ? (
                            <div className="absolute left-0 top-full z-20 mt-3 w-[15rem] rounded-[1.4rem] border border-black/10 bg-[#fafafa] p-3.5 shadow-[0_22px_44px_rgba(0,0,0,0.12)]">
                              <img
                                src={qrPreviewDataUrls[user._id]}
                                alt={`${user.fullName || user.employeeNumber} QR code`}
                                className="mx-auto h-44 w-44 rounded-2xl bg-white p-2 object-contain"
                              />
                              <div className="mt-3 flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPublicCardQr(user)}
                                  title="Download QR code"
                                  aria-label="Download QR code"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-[#f3f3f3]"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPublicCardQr(user)}
                                  title="Copy QR code"
                                  aria-label="Copy QR code"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-[#f3f3f3]"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPublicCardLink(user)}
                          disabled={!hasPublicCard}
                          title={hasPublicCard ? 'Copy public profile link' : 'Public profile card not available yet'}
                          aria-label={hasPublicCard ? 'Copy public profile link' : 'Public profile card not available yet'}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:border-black/8 disabled:text-black/35 disabled:hover:bg-white"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSharePublicCardLink(user)}
                          disabled={!hasPublicCard}
                          title={hasPublicCard ? 'Share public profile link' : 'Public profile card not available yet'}
                          aria-label={hasPublicCard ? 'Share public profile link' : 'Public profile card not available yet'}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:border-black/8 disabled:text-black/35 disabled:hover:bg-white"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/admin/profile/${user._id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f3f3f3]"
                        >
                          <Eye className="h-4 w-4" />
                          View profile
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user._id === userInfo?._id || pendingDeleteUserId === String(user._id)}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:border-black/8 disabled:text-black/35"
                        >
                          {pendingDeleteUserId === String(user._id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminPanel;
