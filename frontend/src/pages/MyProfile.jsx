import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, Camera, Loader2, Save, Share2, SquarePen } from 'lucide-react';
import ProfileImageEditorModal from '../components/ProfileImageEditorModal';
import ProfileSocialButtons from '../components/ProfileSocialButtons';
import ThemedLogo from '../components/ThemedLogo';
import { COMPANIES, getCompanyByValue, getCompanyLandlineNumber, getCompanySlug } from '../constants/companies';
import api from '../utils/api';
import { getStoredUser, hasFreshStoredUser, setStoredUser } from '../utils/auth';
import { buildPublicProfilePath } from '../utils/profileCard';

const inputClassName =
  'theme-field mt-1.5 w-full rounded-2xl border border-black/10 bg-[#f4f4f4] px-4 py-2.5 text-sm text-black outline-none transition focus:border-black/20 focus:ring-4 focus:ring-black/8 read-only:cursor-default disabled:cursor-default disabled:bg-[#efefef] disabled:text-black/70';
const primaryButtonClassName =
  'inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-red)] bg-[var(--color-brand-red)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]';
const compactPrimaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-brand-red)] bg-[var(--color-brand-red)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]';
const PHONE_NUMBER_LENGTH = 10;
const EXTENSION_NUMBER_MAX_LENGTH = 6;

const isValidEmailAddress = (value) => String(value || '').trim().includes('@');
const getPhoneNumberError = (value) =>
  value && value.length !== PHONE_NUMBER_LENGTH
    ? `Landline number must be exactly ${PHONE_NUMBER_LENGTH} digits`
    : '';
const getMobileNumberError = (value) =>
  value && value.length !== PHONE_NUMBER_LENGTH
    ? `Mobile number must be exactly ${PHONE_NUMBER_LENGTH} digits`
    : '';
const getWhatsappNumberError = (value) =>
  value && value.length !== PHONE_NUMBER_LENGTH
    ? `WhatsApp number must be exactly ${PHONE_NUMBER_LENGTH} digits`
    : '';
const getExtensionNumberError = (value) =>
  value && !/^\d{1,6}$/.test(String(value || '').trim()) ? 'EXT number must be 1 to 6 digits' : '';
const getEmailError = (value) =>
  value && !isValidEmailAddress(value) ? 'Email address must include @' : '';

const getApiErrorMessage = (error, fallbackMessage, managedProfileFallbackMessage = '') => {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (
    managedProfileFallbackMessage &&
    [404, 405, 501].includes(Number(error?.response?.status || 0))
  ) {
    return managedProfileFallbackMessage;
  }

  return error?.message || fallbackMessage;
};

const emptyProfile = {
  employeeNumber: '',
  fullName: '',
  email: '',
  linkedinUrl: '',
  whatsappNumber: '',
  department: '',
  jobRole: '',
  phoneNumber: '',
  mobileNumber: '',
  extensionNumber: '',
  company: '',
  profileImage: '',
  role: 'employee',
  profileCompleted: false,
};

const hydrateCachedProfile = (user) => ({
  ...emptyProfile,
  ...(user || {}),
  profileCompleted: Boolean(user?.profileCompleted),
});

const applyCompanyLandlineToProfile = (user) => {
  const companyLandlineNumber = getCompanyLandlineNumber(user?.company);

  if (!companyLandlineNumber) {
    return user;
  }

  return {
    ...user,
    phoneNumber: companyLandlineNumber,
  };
};

const MyProfile = () => {
  const { userId } = useParams();
  const storedUserRef = useRef(getStoredUser());
  const userInfo = storedUserRef.current;
  const isViewingManagedProfile = Boolean(userId);
  const isOwnProfile = !isViewingManagedProfile;
  const cachedOwnProfile = useMemo(
    () =>
      isOwnProfile && userInfo
        ? applyCompanyLandlineToProfile(hydrateCachedProfile(userInfo))
        : emptyProfile,
    [isOwnProfile, userInfo],
  );
  const hasCachedOwnProfile = isOwnProfile && Boolean(userInfo?.token);
  const shouldSkipOwnProfileRefresh = isOwnProfile && hasCachedOwnProfile && hasFreshStoredUser();
  const [profile, setProfile] = useState(cachedOwnProfile);
  const [formData, setFormData] = useState(cachedOwnProfile);
  const [loading, setLoading] = useState(!hasCachedOwnProfile);
  const [isEditing, setIsEditing] = useState(
    isOwnProfile ? !cachedOwnProfile.profileCompleted : false,
  );
  const [imageEditorSource, setImageEditorSource] = useState('');
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const hasLocalChangesRef = useRef(false);

  useEffect(() => {
    setProfile(cachedOwnProfile);
    setFormData(cachedOwnProfile);
    setLoading(!hasCachedOwnProfile);
    setIsEditing(isOwnProfile ? !cachedOwnProfile.profileCompleted : false);
    setImageEditorSource('');
    setIsImageEditorOpen(false);
    setError('');
    setSuccess('');
    hasLocalChangesRef.current = false;
  }, [cachedOwnProfile, hasCachedOwnProfile, isOwnProfile, userId]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccess('');
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [success]);

  useEffect(() => {
    if (shouldSkipOwnProfileRefresh) {
      return undefined;
    }

    const fetchProfile = async () => {
      const shouldBlockRender = !hasCachedOwnProfile || isViewingManagedProfile;

      try {
        if (shouldBlockRender) {
          setLoading(true);
          setError('');
        }

        const config = {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        };
        const endpoint = isViewingManagedProfile
          ? `/api/auth/users/${userId}`
          : '/api/auth/profile';
        const { data } = await api.get(endpoint, config);
        const normalizedData = applyCompanyLandlineToProfile(data);

        if (isOwnProfile) {
          setStoredUser(normalizedData);
        }

        setProfile(normalizedData);
        setFormData((currentValue) =>
          hasLocalChangesRef.current ? currentValue : normalizedData,
        );
        setIsEditing((currentValue) =>
          hasLocalChangesRef.current
            ? currentValue
            : isOwnProfile
              ? !normalizedData.profileCompleted
              : false,
        );
        setError('');
      } catch (fetchError) {
        if (shouldBlockRender) {
          setError(
            getApiErrorMessage(
              fetchError,
              'Failed to load profile',
              'This admin profile route is not available on the current backend yet.',
            ),
          );
        } else {
          console.error('Failed to refresh profile', fetchError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [
    hasCachedOwnProfile,
    isOwnProfile,
    isViewingManagedProfile,
    shouldSkipOwnProfileRefresh,
    userId,
    userInfo?.token,
  ]);

  const handleChange = (field, value) => {
    const nextValue =
      field === 'phoneNumber' || field === 'mobileNumber' || field === 'whatsappNumber'
        ? value.replace(/\D/g, '').slice(0, PHONE_NUMBER_LENGTH)
        : field === 'extensionNumber'
          ? value.replace(/\D/g, '').slice(0, EXTENSION_NUMBER_MAX_LENGTH)
          : value;

    hasLocalChangesRef.current = true;
    setError('');
    setSuccess('');
    setFormData((currentValue) => {
      const nextFormData = {
        ...currentValue,
        [field]: nextValue,
      };

      if (field === 'company') {
        nextFormData.phoneNumber = getCompanyLandlineNumber(nextValue);
      }

      return nextFormData;
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextImageSource = reader.result?.toString() || '';

      if (!nextImageSource) {
        return;
      }

      setImageEditorSource(nextImageSource);
      setIsImageEditorOpen(true);
      setError('');
      setSuccess('');
    };
    reader.readAsDataURL(file);
  };

  const handleImageEditorClose = () => {
    setIsImageEditorOpen(false);
    setImageEditorSource('');
  };

  const handleImageEditorApply = (nextProfileImage) => {
    hasLocalChangesRef.current = true;
    setFormData((currentValue) => ({
      ...currentValue,
      profileImage: nextProfileImage,
    }));
    setIsEditing(true);
    setError('');
    setSuccess('');
    handleImageEditorClose();
  };

  const phoneNumberError = getPhoneNumberError(formData.phoneNumber || '');
  const mobileNumberError = getMobileNumberError(formData.mobileNumber || '');
  const whatsappNumberError = getWhatsappNumberError(formData.whatsappNumber || '');
  const extensionNumberError = getExtensionNumberError(formData.extensionNumber || '');
  const emailError = getEmailError(formData.email || '');

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      if (emailError) {
        setError(emailError);
        return;
      }

      if (phoneNumberError) {
        setError(phoneNumberError);
        return;
      }

      if (mobileNumberError) {
        setError(mobileNumberError);
        return;
      }

      if (whatsappNumberError) {
        setError(whatsappNumberError);
        return;
      }

      if (extensionNumberError) {
        setError(extensionNumberError);
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      };
      const endpoint = isViewingManagedProfile
        ? `/api/auth/users/${userId}`
        : '/api/auth/profile';

      setIsSaving(true);
      const { data } = await api.put(endpoint, formData, config);

      const normalizedData = applyCompanyLandlineToProfile(data);

      if (isOwnProfile) {
        setStoredUser(normalizedData);
      }

      setProfile(normalizedData);
      setFormData(normalizedData);
      setIsEditing(false);
      hasLocalChangesRef.current = false;
      setSuccess(
        isViewingManagedProfile
          ? 'Employee details saved successfully.'
          : normalizedData.profileCompleted
            ? 'Your profile has been saved successfully.'
            : 'Please complete all required fields before saving.',
      );
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Failed to save profile details'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    hasLocalChangesRef.current = false;
    setFormData(profile);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const initials = useMemo(() => {
    const source = formData.fullName || profile.fullName || profile.employeeNumber || 'AB';

    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((namePart) => namePart[0])
      .join('')
      .toUpperCase();
  }, [formData.fullName, profile.employeeNumber, profile.fullName]);

  const selectedCompanyValue = formData.company || profile.company || '';
  const activeCompany = getCompanyByValue(selectedCompanyValue);
  const activeCompanySlug = getCompanySlug(selectedCompanyValue);
  const profileCardLogoSrc = activeCompany?.logo || '/akbar-corporate-logo.png';
  const profileCardLogoAlt = activeCompany?.companyName
    ? `${activeCompany.companyName} logo`
    : 'Akbar Brothers corporate logo';
  const displayRole = formData.jobRole || profile.jobRole;
  const displayDepartment = formData.department || profile.department;
  const roleDepartmentLabel = [displayRole, displayDepartment].filter(Boolean).join(' - ');
  const profileComplete = profile.profileCompleted;
  const publicCardPath =
    isOwnProfile && profile.profileCompleted && profile.shareSlug
      ? buildPublicProfilePath(profile.shareSlug, profile.fullName, profile.employeeNumber)
      : '';
  const showSetupFlow = isOwnProfile && !profileComplete;
  const fieldDisabled = isSaving || !isEditing;

  const renderTextField = ({
    label,
    field,
    type = 'text',
    placeholder = '',
    inputMode,
    pattern,
    maxLength,
    disabled = fieldDisabled,
    readOnly = false,
    className = '',
  }) => (
    <div className={className}>
      <label className="text-sm font-semibold text-black">{label}</label>
      <input
        type={type}
        value={formData[field] || ''}
        onChange={(event) => handleChange(field, event.target.value)}
        className={inputClassName}
        placeholder={placeholder}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        readOnly={readOnly}
        disabled={disabled}
      />
    </div>
  );

  const renderErrorText = (message) =>
    message ? <p className="mt-2 text-xs text-black">{message}</p> : null;

  const renderCompanyField = () => (
    <div>
      <label className="text-sm font-semibold text-black">Company</label>
      <select
        value={formData.company || ''}
        onChange={(event) => handleChange('company', event.target.value)}
        className={inputClassName}
        disabled={fieldDisabled}
      >
        <option value="" disabled hidden>
          Select company
        </option>
        {COMPANIES.map((company) => (
          <option key={company.code} value={company.code}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderFormFields = () => (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm font-semibold text-black">Employee number</label>
        <input type="text" value={formData.employeeNumber} className={inputClassName} disabled />
      </div>

      {renderTextField({
        label: 'Full name',
        field: 'fullName',
        placeholder: 'First name and last name',
      })}

      {renderTextField({
        label: 'Role',
        field: 'jobRole',
      })}

      {renderTextField({
        label: 'Department',
        field: 'department',
      })}

      <div>
        {renderTextField({
          label: 'Landline number',
          field: 'phoneNumber',
          type: 'tel',
          inputMode: 'numeric',
          pattern: '\\d{10}',
          maxLength: PHONE_NUMBER_LENGTH,
          placeholder: '0112697151',
          readOnly: true,
        })}
        {renderErrorText(phoneNumberError)}
      </div>

      <div>
        {renderTextField({
          label: 'EXT number (optional)',
          field: 'extensionNumber',
          type: 'tel',
          inputMode: 'numeric',
          pattern: '\\d{1,6}',
          maxLength: EXTENSION_NUMBER_MAX_LENGTH,
          placeholder: '247',
        })}
        {renderErrorText(extensionNumberError)}
      </div>

      <div>
        {renderTextField({
          label: 'Email address',
          field: 'email',
          type: 'email',
        })}
        {renderErrorText(emailError)}
      </div>

      <div>
        {renderTextField({
          label: 'Mobile number',
          field: 'mobileNumber',
          type: 'tel',
          inputMode: 'numeric',
          pattern: '\\d{10}',
          maxLength: PHONE_NUMBER_LENGTH,
          placeholder: '0771234567',
        })}
        {renderErrorText(mobileNumberError)}
      </div>

      <div>
        {renderTextField({
          label: 'WhatsApp number',
          field: 'whatsappNumber',
          type: 'tel',
          inputMode: 'numeric',
          pattern: '\\d{10}',
          maxLength: PHONE_NUMBER_LENGTH,
          placeholder: '0771234567',
        })}
        {renderErrorText(whatsappNumberError)}
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-semibold text-black">LinkedIn profile</label>
        <input
          type="url"
          value={formData.linkedinUrl || ''}
          onChange={(event) => handleChange('linkedinUrl', event.target.value)}
          className={inputClassName}
          placeholder="Linkedin profile URL"
          disabled={fieldDisabled}
        />
      </div>

      {renderCompanyField()}
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-black" />
      </div>
    );
  }

  const renderProfileCard = () => (
    <div className="theme-panel relative overflow-hidden rounded-[2rem] border border-black/6 bg-white p-5 text-black shadow-[0_24px_50px_rgba(16,16,16,0.06)] xl:p-6">
      <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-white/90 blur-2xl" />

      <div className="relative flex h-full flex-col">
        <div className="relative mx-auto h-32 w-32">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[5px] border-black/6 bg-white text-3xl font-black text-black shadow-sm">
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt={formData.fullName || 'Profile'}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {isOwnProfile && (
            <label
              className="absolute bottom-1 right-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[var(--color-brand-red)] text-white shadow-[0_12px_24px_rgba(142,20,36,0.22)] transition hover:bg-[var(--color-brand-red-dark)]"
              aria-label="Change picture"
              title="Change picture"
            >
              <Camera className="h-4.5 w-4.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="mt-6 text-center">
          <ThemedLogo
            src={profileCardLogoSrc}
            alt={profileCardLogoAlt}
            className="theme-logo-image mx-auto h-11 w-auto object-contain"
          />
          <h1 className="mt-2 text-2xl font-bold xl:text-3xl">
            {formData.fullName || profile.fullName || 'Complete your profile'}
          </h1>
          <p className="mt-1.5 text-sm text-black/78">
            {roleDepartmentLabel || 'Employee role and department will appear here'}
          </p>
          {activeCompany?.companyName ? (
            <p className="mt-1 text-sm font-normal text-black/62">{activeCompany.companyName}</p>
          ) : null}
        </div>

        <div className="mt-7 flex flex-col items-center gap-4">
          <ProfileSocialButtons
            linkedinUrl={formData.linkedinUrl}
            whatsappNumber={formData.whatsappNumber}
          />

          <div className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-6">
            {activeCompany ? (
              <Link
                to={`/company-info/${encodeURIComponent(activeCompanySlug || activeCompany.code)}`}
                className={compactPrimaryButtonClassName}
              >
                <Building2 className="h-4 w-4" />
                About {activeCompany.name}
              </Link>
            ) : (
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/55">
                <Building2 className="h-4 w-4" />
                Select a company below
              </div>
            )}

            {publicCardPath && (
              <Link
                to={publicCardPath}
                state={{ fromApp: true }}
                aria-label="Open mobile share card"
                title="Open mobile share card"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:bg-[#f3f3f3]"
              >
                <Share2 className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4 pb-4 pt-1 animate-in fade-in duration-500 lg:space-y-3 lg:pb-2">
        {showSetupFlow ? (
          <section className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
            {renderProfileCard()}

            <div className="theme-panel rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_26px_52px_rgba(0,0,0,0.08)] xl:p-6">
              <div className="border-b border-black/10 pb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
                  First Login
                </p>
                <h2 className="mt-2 text-2xl font-black text-black xl:text-3xl">
                  Complete your employee visiting card
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-5 text-black/70">
                  Welcome to the Akbar Brothers Employee Management System. Before continuing, please
                  fill in your profile details below. This card will become your homepage after saving.
                </p>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-black/10 bg-[#f3f3f3] px-4 py-3 text-sm text-black">
                  {error}
                </div>
              )}

              {renderFormFields()}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-red)] bg-[var(--color-brand-red)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:bg-[var(--color-brand-red)]"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Create My Profile
              </button>
            </div>
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
            {renderProfileCard()}

            <div className="theme-panel rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_26px_52px_rgba(0,0,0,0.08)] xl:p-6">
              <div className="flex flex-col gap-3 border-b border-black/10 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
                    {isViewingManagedProfile ? 'Admin View' : 'Home'}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-black xl:text-3xl">
                    {isViewingManagedProfile ? 'Employee Profile' : 'My Profile'}
                  </h2>
                  {isViewingManagedProfile && (
                    <p className="mt-2 text-sm text-black/68">
                      You are viewing this employee&apos;s internal visiting card profile.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {isViewingManagedProfile && (
                    <Link
                      to="/admin"
                      className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f3f3f3]"
                    >
                      Back to Admin Panel
                    </Link>
                  )}

                  {isViewingManagedProfile ? (
                    !isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`${primaryButtonClassName} -translate-y-1 hover:-translate-y-1.5`}
                      >
                        <SquarePen className="h-4 w-4" />
                        Edit employee details
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition -translate-y-1 hover:-translate-y-1.5 hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:-translate-y-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`${primaryButtonClassName} -translate-y-1 hover:-translate-y-1.5 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:-translate-y-1 disabled:hover:bg-[var(--color-brand-red)]`}
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save employee details
                        </button>
                      </>
                    )
                  ) : !isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`${primaryButtonClassName} -translate-y-1 hover:-translate-y-1.5`}
                    >
                      Edit details
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition -translate-y-1 hover:-translate-y-1.5 hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:-translate-y-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`${primaryButtonClassName} -translate-y-1 hover:-translate-y-1.5 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:-translate-y-1 disabled:hover:bg-[var(--color-brand-red)]`}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save changes
                      </button>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-black/10 bg-[#f3f3f3] px-4 py-3 text-sm text-black">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-black shadow-sm">
                  {success}
                </div>
              )}

              {renderFormFields()}
            </div>
          </section>
        )}
      </div>

      {isImageEditorOpen && imageEditorSource ? (
        <ProfileImageEditorModal
          key={imageEditorSource}
          imageSrc={imageEditorSource}
          alt={formData.fullName || profile.fullName || 'Profile picture'}
          onClose={handleImageEditorClose}
          onApply={handleImageEditorApply}
        />
      ) : null}
    </>
  );
};

export default MyProfile;
