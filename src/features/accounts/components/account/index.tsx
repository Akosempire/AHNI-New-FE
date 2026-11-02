"use client";

// import { Button } from "@/components/ui/button";
// import SearchIcon from "@/components/icons/SearchIcon";
// import FilterIcon from "@/components/icons/FilterIcon";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// import { useAppDispatch } from "@/hooks/useStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import {
  ProfileSchema,
  SecuritySchema,
  // TProfileFormValues,
  // TSecurityFormValues,
} from "@/features/accounts/types/account/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import FormInput from "@/components/FormInput";
import FormButton from "@/components/FormButton";
import { ImagePlus } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  useGetUserProfile,
  useUpdateUser,
} from "@/features/auth/controllers/userController";
import { toast } from "sonner";
import FormSelect from "@/components/FormSelect";
import FormMultiSelect from "@/components/FormMultiSelect";
import { useGetAllRoles } from "@/features/auth/controllers/roleController";
import { useAuthChangePassword } from "@/features/auth/controllers/authController";
import { useAppDispatch } from "@/hooks/useStore";
import { logOut } from "@/store/auth/authSlice";
import { AuthRoutes } from "@/constants/RouterConstants";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export type TFormValues = z.infer<typeof ProfileSchema>;
export type TFormValuesSecond = z.infer<typeof SecuritySchema>;
export default function Account() {
  // const dispatch = useAppDispatch();

  const { data: profile, refetch: refetchProfile, isLoading: isProfileLoading, error } = useGetUserProfile();

  // Enhanced debugging for account data loading
  console.log('🔍 Account Component - useGetUserProfile state:', {
    profile,
    isLoading: isProfileLoading,
    error,
    hasData: !!profile?.data,
    fullProfile: profile,
    errorDetails: error,
    errorMessage: error?.message,
    errorStatus: (error as any)?.response?.status
  });

  // Check authentication state
  if (typeof window !== 'undefined') {
    console.log('🔍 Account Component - Authentication check:', {
      hasToken: !!localStorage.getItem('token'),
      tokenPreview: localStorage.getItem('token')?.substring(0, 20) + '...',
      hasAccessToken: !!localStorage.getItem('access_token'),
      accessTokenPreview: localStorage.getItem('access_token')?.substring(0, 20) + '...',
      currentURL: window.location.href,
      authRequired: !localStorage.getItem('token') && !localStorage.getItem('access_token')
    });

    // If no tokens and we get a 401/403 error, redirect to login
    if (!localStorage.getItem('token') && !localStorage.getItem('access_token')) {
      console.log('❌ Account Component - No authentication tokens found, may need to login');
    }
  }
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get user ID with debugging
  const userId = ((profile?.data || profile) as any)?.id;
  console.log('🔍 Account Component - User ID for updateUser hook:', {
    userId,
    hasProfile: !!profile,
    profileData: profile?.data,
    directProfile: profile,
    rawUserId: userId
  });

  // Initialize the updateUser hook with a temporary ID, we'll validate before making calls
  // The hook needs to be initialized but we won't use it unless we have a valid user ID
  const { updateUser, isLoading: isUpdateLoading } = useUpdateUser(userId || "temp-user-id");
  const { data: role } = useGetAllRoles({
    page: 1,
    size: 2000000,
  });

  const { authChangePassword, isLoading: isPasswordChangeLoading } = useAuthChangePassword();

  const Profileform = useForm<TFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      role: [],
      gender: "",
      profile_picture: "",
      mobile_number: "",
      department: "",
      position: "",
      location: "",
      user_type: "",
    },
  });

  const roleOptions = (role as any)?.data?.results?.map(({ name, id }: any) => ({
    label: name,
    value: id,
  })) || [];
  const Securityform = useForm<TFormValuesSecond>({
    resolver: zodResolver(SecuritySchema),
    // defaultValues: {},
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });
  const [file, setFile] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Token validation for better user experience
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Validate token by testing the profile endpoint
        const response = await fetch('https://127.0.0.1:8000/api/v1/users/profile/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok && response.status === 401) {
          console.warn('Token expired, redirecting to login');
          toast.error("Your session has expired. Please log in again to continue.");

          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        }
      } catch (err) {
        console.error('Token validation error:', err);
      }
    };

    // Run token validation after component mounts
    setTimeout(validateToken, 1000);
  }, []);

  useEffect(() => {
    console.log('🔍 Account Component - Profile data:', profile);
    console.log('🔍 Account Component - Profile loading:', !profile);
    console.log('🔍 Account Component - Profile structure check:', {
      hasProfile: !!profile,
      hasProfileData: !!profile?.data,
      profileKeys: profile ? Object.keys(profile) : [],
      dataKeys: profile?.data ? Object.keys(profile.data) : []
    });

    // Check if we have profile data in the right structure
    // Handle both cases: profile.data (wrapped) or profile (direct)
    const profileData = (profile?.data || profile) as any;

    if (profileData && typeof profileData === 'object' && (profileData as any).id) {
      console.log('📋 Raw profile data structure:', JSON.stringify(profileData, null, 2));
      console.log('🔄 Form reset triggered - About to populate form with profile data');

      const roles = profileData.roles || [];
      const roleValues = roles.map((role: any) => role.id || role);

      console.log('🔄 Form reset - Processed role values:', roleValues);

      const formData = {
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        email: profileData.email || "",
        // @ts-ignore
        username: profileData.username || profileData.employee_id || "",
        // @ts-ignore
        role: roleValues || [],
        gender: profileData.gender || "",
        profile_picture: profileData.profile_picture || "",
        mobile_number: profileData.mobile_number || "",
        department: typeof profileData.department === 'object' && profileData.department !== null
          ? profileData.department.name || profileData.department.title || ""
          : profileData.department || "",
        position: typeof profileData.position === 'object' && profileData.position !== null
          ? profileData.position.name || profileData.position.title || ""
          : profileData.position || "",
        location: typeof profileData.location === 'object' && profileData.location !== null
          ? profileData.location.name || profileData.location.title || ""
          : profileData.location || "",
        user_type: profileData.user_type || "",
      };

      console.log('🔄 Form reset - Data about to be set:', formData);

      Profileform.reset(formData);

      console.log('✅ Form reset completed');
    } else {
      console.log('❌ No profile data available for form reset');
    }
  }, [profile]); // Removed Profileform to prevent infinite loop

  const handlePaperclipClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmitProfile = async (data: TFormValues) => {
    console.log('🚨 FORM SUBMISSION STARTED!');
    console.log('🔍 Form data received:', data);
    console.log('🔍 Current file state:', file);

    // Dispatch update profile action or API call

    try {
      const actualUserId = ((profile?.data || profile) as any)?.id;
      console.log('🔍 Extracted user ID:', actualUserId);

      if (!actualUserId) {
        console.log('❌ No user ID found');
        toast.error("User ID is missing. Please refresh the page.");
        return;
      }

      console.log('🔍 Form submission - Using user ID:', actualUserId);
      console.log('🔍 Form submission - Hook was initialized with:', userId);

      // Use FormData ONLY when uploading a file, otherwise use JSON like the manager profile
      let result; // Declare result in the correct scope

      if (file) {
        console.log('📁 Profile picture detected - using FormData for file upload');
        const formData = new FormData();

        formData.append("first_name", data.first_name);
        formData.append("last_name", data.last_name);
        formData.append("email", data.email);
        formData.append("gender", data.gender);
        formData.append("mobile_number", data.mobile_number);
        data.role.forEach((role) => formData.append("roles", role));
        formData.append("profile_picture", file);

        console.log('📤 Submitting FormData via updateUser hook...');
        result = await updateUser(formData);
      } else {
        console.log('📝 No profile picture - using JSON like manager profile');
        const jsonData = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          gender: data.gender,
          mobile_number: data.mobile_number,
          roles: data.role, // Note: roles not role for JSON
        };

        console.log('📤 Submitting JSON data via updateUser hook...');
        result = await updateUser(jsonData);
      }
      console.log('✅ Form submission completed:', result);

      // Manually invalidate and refetch the user profile to update the header avatar
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      await refetchProfile();

      // Clear the file state so the preview updates with the new URL from the server
      setFile(undefined);

      toast.success("User Updated");
      console.log('🎉 Profile update successful!');
    } catch (error: any) {
      console.error("❌ Profile update error:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        data: error?.data,
        response: error?.response,
        stack: error?.stack,
        name: error?.name
      });
      toast.error(error?.message || error?.data?.message || "Something went wrong");
    }
  };

  const onSubmitSecurity = async (data: TFormValuesSecond) => {
    // Dispatch update password action or API call
    const payload = {
      new_password: data?.new_password,
      confirm_password: data?.confirm_password,
      current_password: data?.old_password,
    };

    try {
      await authChangePassword(payload);
      toast.success("Password changed successfully");

      // Only log out and redirect if password change is successful
      dispatch(logOut());
      router.push(AuthRoutes.LOGIN);
      router.push("/login");
    } catch (err: any) {
      // On error, just show toast and do not log out or redirect
      toast.error(err.data.message || "Something went wrong");
    }
  };

  return (
    <div className='space-y-5'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            /
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <div className='grid w-full grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12'>
          <div className='flex flex-row items-center gap-4 lg:flex-col lg:items-start'>
            {/* <div
              className='w-[200px] h-[200px] flex-shrink-0 rounded-full bg-primary'
              style={{
                backgroundImage: file
                  ? `url(${URL.createObjectURL(file)})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            /> */}
            <div
              className='grid h-20 w-20 flex-shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[24px] font-medium text-[var(--ink-2)] lg:h-28 lg:w-28'
              aria-label='Profile photo'
              style={{
                backgroundImage: file
                  ? `url(${URL.createObjectURL(file)})`
                  : (profile as any)?.profile_picture
                  ? `url(${(profile as any)?.profile_picture})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <div className='min-w-0 space-y-2'>
              <p className='truncate text-[15px] font-medium'>
                {[(profile as any)?.first_name, (profile as any)?.last_name].filter(Boolean).join(" ") || "Your profile"}
              </p>
              <p className='truncate text-[13px] text-[var(--muted)]'>{(profile as any)?.email}</p>
              <button
                type='button'
                onClick={handlePaperclipClick}
                className='btn btn-outline !h-8 text-[13px]'
              >
                <ImagePlus className='h-4 w-4' />
                Change photo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type='file'
              onChange={handleChangeFile}
              className='hidden'
            />
          </div>
          <div className='min-w-0'>
            <Tabs defaultValue='profile'>
              <TabsList>
                <TabsTrigger value='profile'>
                  Profile
                </TabsTrigger>
                <TabsTrigger value='security'>
                  Security
                </TabsTrigger>
              </TabsList>
              <TabsContent
                className='w-full max-w-[720px] pt-6'
                value='profile'
              >
                <FormProvider {...Profileform}>
                  <form
                    onSubmit={Profileform.handleSubmit(onSubmitProfile)}
                    className='flex flex-col w-full gap-[20px]'
                  >
                    <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-[20px]'>
                      <FormInput
                        label='First Name'
                        name='first_name'
                        className=''
                        required
                        placeholder='Enter First name'
                      />
                      <FormInput
                        label='Last Name'
                        name='last_name'
                        className=''
                        required
                        placeholder='Enter Last name'
                      />
                    </div>
                    <FormInput
                      label='Email Address'
                      name='email'
                      className=''
                      required
                      placeholder='Enter Email address'
                      disabled={true}
                    />

                    <FormMultiSelect
                      label='Role'
                      placeholder='Select Role'
                      name='role'
                      required
                      options={roleOptions}
                      disabled={true}
                    />

                    <FormSelect
                      label='Gender'
                      placeholder='Select Gender'
                      name='gender'
                      required
                      options={[
                        { label: "Male", value: "MALE" },
                        { label: "Female", value: "FEMALE" },
                      ]}
                    />

                    <FormInput
                      label='Mobile Number'
                      name='mobile_number'
                      className=''
                      required
                      placeholder='Enter mobile number'
                      type='tel'
                    />

                    <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-[20px]'>
                      <FormInput
                        label='Department'
                        name='department'
                        className=''
                        placeholder='Department'
                        disabled={true}
                      />
                      <FormInput
                        label='Position'
                        name='position'
                        className=''
                        placeholder='Position'
                        disabled={true}
                      />
                    </div>

                    <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-[20px]'>
                      <FormInput
                        label='Location'
                        name='location'
                        className=''
                        placeholder='Location'
                        disabled={true}
                      />
                      <FormInput
                        label='User Type'
                        name='user_type'
                        className=''
                        placeholder='User Type'
                        disabled={true}
                      />
                    </div>

                    <div className='mt-2 flex justify-end gap-3 border-t border-[var(--line)] pt-4'>
                      <FormButton
                        loading={isUpdateLoading}
                        type='submit'
                        disabled={isUpdateLoading}
                      >
                        Save changes
                      </FormButton>
                    </div>
                  </form>
                </FormProvider>
              </TabsContent>
              <TabsContent
                className='w-full max-w-[520px] pt-6'
                value='security'
              >
                <div className='flex flex-col gap-4'>
                  <div>
                    <h2 className='text-[18px] font-medium'>Change password</h2>
                    <p className='text-[13px] text-[var(--muted)]'>You&apos;ll stay signed in on this device.</p>
                  </div>
                  <FormProvider {...Securityform}>
                    <form
                      onSubmit={Securityform.handleSubmit(onSubmitSecurity)}
                      className='flex flex-col w-full gap-[20px]'
                    >
                      <FormInput
                        label='Old Password'
                        type='password'
                        name='old_password'
                        className=''
                        required
                        placeholder='Enter old password'
                      />
                      <FormInput
                        label='New Password'
                        type='password'
                        name='new_password'
                        className=''
                        required
                        placeholder='Enter new password'
                      />

                      <FormInput
                        label='Confirm Password'
                        type='password'
                        name='confirm_password'
                        className=''
                        // disabled
                        placeholder='Confirm new password'
                      />

                      <div className='mt-2 flex justify-end gap-3 border-t border-[var(--line)] pt-4'>
                        <FormButton
                          loading={isPasswordChangeLoading}
                          type='submit'
                          disabled={isPasswordChangeLoading}
                        >
                          Update password
                        </FormButton>
                      </div>
                    </form>
                  </FormProvider>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}