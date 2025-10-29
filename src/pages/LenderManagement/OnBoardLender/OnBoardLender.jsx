import { Form, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ValidatedTextField from '@components/Form/ValidatedTextField';
import ValidatedTextArea from '@components/Form/ValidatedTextArea';
import ValidatedLabel from '@components/Form/ValidatedLabel';
import SubmitBtn from '@components/Form/SubmitBtn';
import ImageUploadField from '@components/Form/ImageUploadField';
import FormRow from '@components/Form/FormRow';
import { uploadImage } from '../../../api-services/cms-services';
import ToastNotification from '../../../components/Notification/ToastNotification';
import { Toaster } from 'react-hot-toast';
import { AddLender, getLenderById, UpdateLender } from '../../../api-services/Modules/LenderApi';
import { MetaKeywordsInput } from '@components/Form/MetaKeywordsInput'
import { Features } from '@components/Form/features';

export default function LenderCreate() {
  const imageUrl = import.meta.env.VITE_IMAGE_URL
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerImageKey, setBannerImageKey] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [features, setFeatures] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      website: '',
      playStoreLink: '',
      appStoreLink: '',
      startingInterestRate: '',
      maximumLoanAmount: '',
      minimumLoanAmount: '',
      maximumTenure: '',
      minimumTenure: '',
      processingFee: '',
      prepaymentCharges: '',
      latePaymentCharges: '',
      foreclosureCharges: '',
      eligibilityCriteria: '',
      customerSupportNumber: '',
      customerSupportEmail: '',
      termsAndConditionsLink: '',
      privacyPolicyLink: '',
      faqLink: '',
      aboutUsLink: '',
      sortedOrder: '',
      isActive: true,
      features: [],
    },
  });

  useEffect(() => {
    if (
      errors.startingInterestRate ||
      errors.processingFee ||
      errors.maximumLoanAmount ||
      errors.minimumLoanAmount ||
      errors.maximumTenure ||
      errors.minimumTenure ||
      errors.prepaymentCharges ||
      errors.latePaymentCharges ||
      errors.foreclosureCharges ||
      errors.eligibilityCriteria ||
      errors.customerSupportNumber ||
      errors.customerSupportEmail ||
      errors.termsAndConditionsLink ||
      errors.privacyPolicyLink ||
      errors.faqLink ||
      errors.aboutUsLink ||
      errors.sortedOrder
    ) {
      setOpenAdvanced(true);
    }
  }, [errors]);

  const handleFileInputChangeBanner = async (e) => {
    console.log('Image upload triggered');
    try {
      const file = e.target.files[0];
      if (!file) {
        ToastNotification.error('No file selected.');
        return;
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        setImgSrc(img.src);
        const formData = new FormData();
        formData.append('image_type', 'onBoardLender');
        formData.append('image', file);
        try {
          setLoading(true);
          setIsUploadingBanner(true);
          const response = await uploadImage(formData);
          console.log('Image Upload Response:', response.data.data.path);
          const imagePath = response?.data?.data?.path;
          setBannerImageKey(imagePath);
          setValue('logo', imagePath); // Update form state
          ToastNotification.success('Image uploaded successfully');
        } catch (uploadError) {
          console.error('Upload Error:', uploadError);
          ToastNotification.error('Error uploading image.');
        } finally {
          setLoading(false);
          setIsUploadingBanner(false);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        ToastNotification.error('Error loading image.');
        setValue('logo', '');
      };
    } catch (err) {
      console.error('Image Error:', err);
      ToastNotification.error('An unexpected error occurred.');
      setValue('logo', '');
    }
  };

  const handleFileInputReset = () => {
    setImgSrc('');
    setBannerImageKey('');
    setValue('logo', ''); // Reset logo in form state
  };

  const onSubmit = async (data) => {
    const submittedData = {
      ...data,
      logo: bannerImageKey,
      lender_features: features
    };

    if (Object.keys(errors).length > 0) {
      ToastNotification.error('Please fill all required fields.');
      return;
    }
    if (!bannerImageKey) {
      ToastNotification.error('Please upload a logo image.');
      return;
    }
    setLoading(true);
    try {
      console.log(submittedData, "id")
      // const response = await AddLender(submittedData);
      const response = id
        ? await UpdateLender(id, submittedData)
        : await AddLender(submittedData);
      console.log('API Response:', response);
      if (response?.data?.success) {
        ToastNotification.success(`Lender ${id ? 'Updated' : 'Added'} Successfully`);
        navigate('/list-of-lenders');
      } else {
        ToastNotification.error(`Failed to add lender: ${response?.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AddLender Error:', error.response?.data || error.message);
      ToastNotification.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      console.log('Fetching lender data for ID:', id);
      const fetchLender = async () => {
        try {
          const res = await getLenderById(id);
          console.log('Lender Data:', res);
          if (res?.data?.success) {
            const lender = res?.data?.data;
            // Populate all fields
            setValue('name', lender.name || '');
            setValue('slug', lender.slug || '');
            setValue('description', lender.description || '');
            setValue('website', lender.website || '');
            setValue('playStoreLink', lender.playStoreLink || '');
            setValue('appStoreLink', lender.appStoreLink || '');
            setValue('startingInterestRate', lender.startingInterestRate || '');
            setValue('maximumLoanAmount', lender.maximumLoanAmount || '');
            setValue('minimumLoanAmount', lender.minimumLoanAmount || '');
            setValue('maximumTenure', lender.maximumTenure || '');
            setValue('minimumTenure', lender.minimumTenure || '');
            setValue('processingFee', lender.processingFee || '');
            setValue('prepaymentCharges', lender.prepaymentCharges || '');
            setValue('latePaymentCharges', lender.latePaymentCharges || '');
            setValue('foreclosureCharges', lender.foreclosureCharges || '');
            setValue('eligibilityCriteria', lender.eligibilityCriteria || '');
            setValue('customerSupportNumber', lender.customerSupportNumber || '');
            setValue('customerSupportEmail', lender.customerSupportEmail || '');
            setValue('termsAndConditionsLink', lender.termsAndConditionsLink || '');
            setValue('privacyPolicyLink', lender.privacyPolicyLink || '');
            setValue('faqLink', lender.faqLink || '');
            setValue('aboutUsLink', lender.aboutUsLink || '');
            setValue('features', lender?.features)
            setValue('sortedOrder', lender.sortedOrder ? String(lender.sortedOrder) : '');
            setValue('isActive', lender.isActive !== undefined ? lender.isActive : true);

            // Handle logo image
            if (lender.logo) {
              setBannerImageKey(lender.logo);
              setImgSrc(imageUrl + lender.logo); // Set for preview
              setValue('logo', lender.logo);
            } else {
              setValue('logo', '');
            }
          } else {
            ToastNotification.error('Failed to load lender data');
          }
        } catch (error) {
          console.error('Fetch Lender Error:', error);
          ToastNotification.error('Failed to load lender data');
        }
      };
      fetchLender();
    }
  }, [id, setValue]);

  return (
    <div>
      <Toaster />


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow p-6 rounded-xl space-y-4">

          <div className="flex justify-between items-center ">
            <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Lender' : 'Create Lender'}</h2>

            <div className='flex  items-center'>
              <FormRow>
                <div className="form-control ">
                  <label className="label mr-3 font-medium">
                    <span className="label-text">Is Active</span>
                  </label>
                  <input
                    type="checkbox"
                    {...control.register('isActive')}
                    className="toggle toggle-primary"
                  />
                  {errors.isActive && (
                    <span className="text-error text-sm">{errors.isActive.message}</span>
                  )}
                </div>
              </FormRow>
              <div>
                <SubmitBtn loading={loading} label={id ? 'Update' : 'Submit'} />
              </div>
            </div>
          </div>


          <FormRow cols={3}>
            <ValidatedTextField
              name="name"
              control={control}
              label="Lender Name"
              errors={errors}
              rules={{ required: 'Lender name is required' }}
              helperText={errors.name ? errors.name.message : 'Enter the lender’s name'}
              required
            />

            <ValidatedTextField
              name="website"
              control={control}
              label="Website"
              errors={errors}
              rules={{ required: 'Website is required' }}
              helperText={errors.website ? errors.website.message : 'Enter the lender’s website URL'}
              required
            />

            <ValidatedTextField
              name="appStoreLink"
              control={control}
              label="App Store Link"
              errors={errors}
              rules={{ required: 'App Store Link is required' }}
              helperText={errors.appStoreLink ? errors.appStoreLink.message : 'Enter the App Store URL'}
              required
            />
          </FormRow>

          <FormRow cols={3}>
            <ValidatedTextField
              name="playStoreLink"
              control={control}
              label="Play Store Link"
              errors={errors}
              rules={{ required: 'Play Store Link is required' }}
              helperText={errors.playStoreLink ? errors.playStoreLink.message : 'Enter the Play Store URL'}
              required
            />


          </FormRow>

          <div className="flex gap-4">
            <div className="w-2/3">
              <ValidatedTextArea
                name="description"
                control={control}
                label="Description"
                errors={errors}
                rows={4}
                rules={{ required: 'Description is required' }} // Fixed to match Postman JSON
                // helperText={'Enter a brief description'}
                required
              />
            </div>
            <div className="w-1/3">
              <ValidatedLabel label="Select Logo" required />
              <ImageUploadField
                name="logo"
                control={control}
                label="Logo"
                errors={errors}
                imgSrc={imgSrc}
                rules={{ required: 'Logo is required' }}
                helperText={errors.logo ? errors.logo.message : 'Upload a logo image'}
                handleFileInputReset={handleFileInputReset}
                handleFileInputChangeBanner={handleFileInputChangeBanner}
                isUploading={isUploadingBanner}
              />
            </div>
          </div>
          <FormRow cols={3}>
            <Features
              name="features"
              control={control}
              label="Features"
              errors={errors}
              keywords={features}
              setKeywords={setFeatures}
              setValue={setValue}
              rules={{ required: false }}
            />
          </FormRow>
        </div>

        {/* Advanced Fields */}
        <div className="w-full join join-vertical bg-base-100">
          <div className="collapse collapse-arrow join-item border-base-300 border">
            <input
              type="checkbox"
              checked={openAdvanced}
              onChange={() => setOpenAdvanced(!openAdvanced)}
            />
            <div className="collapse-title font-semibold">Advanced Fields</div>
            <div className="collapse-content text-sm">
              <div className="space-y-4">
                <FormRow cols={3}>
                  <ValidatedTextField
                    name="startingInterestRate"
                    control={control}
                    label="Starting Interest Rate"
                    errors={errors}
                    rules={{ required: false }} // Fixed to match Postman JSON
                    helperText={errors.startingInterestRate ? errors.startingInterestRate.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="processingFee"
                    control={control}
                    label="Processing Fee"
                    errors={errors}
                    rules={{ required: false }}  // Fixed to match Postman JSON
                    helperText={errors.processingFee ? errors.processingFee.message : ''}
                  // required
                  />

                  <ValidatedTextField
                    name="minimumLoanAmount"
                    control={control}
                    label="Minimum Loan Amount"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.minimumLoanAmount ? errors.minimumLoanAmount.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="maximumLoanAmount"
                    control={control}
                    label="Maximum Loan Amount"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.maximumLoanAmount ? errors.maximumLoanAmount.message : ''}
                  // required
                  />

                  <ValidatedTextField
                    name="minimumTenure"
                    control={control}
                    label="Minimum Tenure"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.minimumTenure ? errors.minimumTenure.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="maximumTenure"
                    control={control}
                    label="Maximum Tenure"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.maximumTenure ? errors.maximumTenure.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="prepaymentCharges"
                    control={control}
                    label="Prepayment Charges"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.prepaymentCharges ? errors.prepaymentCharges.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="latePaymentCharges"
                    control={control}
                    label="Late Payment Charges"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.latePaymentCharges ? errors.latePaymentCharges.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="foreclosureCharges"
                    control={control}
                    label="Foreclosure Charges"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.foreclosureCharges ? errors.foreclosureCharges.message : ''}
                  // required
                  />
                  <ValidatedTextArea
                    name="eligibilityCriteria"
                    control={control}
                    label="Eligibility Criteria"
                    errors={errors}
                    rows={3}
                    rules={{ required: false }}
                    helperText={errors.eligibilityCriteria ? errors.eligibilityCriteria.message : ''}
                  // required
                  />
                </FormRow>
              </div>

              <div className="mt-8 space-y-4">
                <FormRow cols={3}>
                  <ValidatedTextField
                    name="customerSupportNumber"
                    control={control}
                    label="Customer Support Number"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.customerSupportNumber ? errors.customerSupportNumber.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="customerSupportEmail"
                    control={control}
                    label="Customer Support Email"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.customerSupportEmail ? errors.customerSupportEmail.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="termsAndConditionsLink"
                    control={control}
                    label="Terms & Conditions Link"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.termsAndConditionsLink ? errors.termsAndConditionsLink.message : ''}
                  // required
                  />
                </FormRow>

                <FormRow cols={3}>
                  <ValidatedTextField
                    name="privacyPolicyLink"
                    control={control}
                    label="Privacy Policy Link"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.privacyPolicyLink ? errors.privacyPolicyLink.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="faqLink"
                    control={control}
                    label="FAQ Link"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.faqLink ? errors.faqLink.message : ''}
                  // required
                  />
                  <ValidatedTextField
                    name="aboutUsLink"
                    control={control}
                    label="About Us Link"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.aboutUsLink ? errors.aboutUsLink.message : ''}
                  // required
                  />
                </FormRow>

                <FormRow cols={3}>
                  <ValidatedTextField
                    name="sortedOrder"
                    control={control}
                    label="Sorted Order"
                    errors={errors}
                    rules={{ required: false }}
                    helperText={errors.sortedOrder ? errors.sortedOrder.message : ''}
                  // required
                  />
                </FormRow>
              </div>
            </div>
          </div>
        </div>



      </form>
    </div>
  );
}