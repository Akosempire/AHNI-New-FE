"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import BackNavigation from "@/components/BackNavigation";
import FormButton from "@/components/FormButton";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelectField";
import { Form } from "@/components/ui/form";
import { AdminRoutes } from "@/constants/RouterConstants";
import {
  AssetSchema,
  TAssetFormValues,
} from "@/features/admin/types/inventory-management/asset";
import useQuery from "@/hooks/useQuery";
import { nigerianStates } from "@/lib/index";
import { useCallback, useEffect, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useGetAllAssetConditions } from "@/features/modules/controllers/admin/assetConditionController";
import { useGetAllAssetTypes } from "@/features/modules/controllers/admin/assetTypeController";
import { useGetAllAssetClassifications } from "@/features/modules/controllers/config/assetClassificationController";
import { useGetAHNIOfficeLocations } from "@/features/modules/controllers/config/locationController";
import { useGetAllProjects } from "@/features/projects/controllers/projectController";
import { useGetAllUsers } from "@/features/auth/controllers/userController";
import { toast } from "sonner";
import { useGetAllFundingSources } from "@/features/modules/controllers/project/fundingSourceController";
import { useGetAllPartners } from "@/features/modules/controllers/project/partnerController";
import FormTextArea from "@/components/FormTextArea";
import { useGetAllCategories } from "@/features/modules/controllers/config/categoryController";
import {
  useAddItem,
  useGetSingleItem,
  useUpdateItem,
} from "@/features/modules/controllers/config/itemController";
import {
  ITEM_TYPES,
  buildCategoryOptions,
  getCategoriesByTypeAndParent,
} from "@/utils/categoryHelpers";
import { useState } from "react";

export default function CreateAsset() {
  // State for cascading category selection
  const [selectedItemType, setSelectedItemType] = useState<string>("");
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>("");

  const form = useForm<TAssetFormValues>({
    resolver: zodResolver(AssetSchema),
    defaultValues: {
      name: "",
      asset_type: "",
      project: "",
      assignee: "",
      asset_code: "",
      // Vehicle - Basic Info
      plate_number: "",
      chasis_number: "",
      engine_number: "",
      odometer_reading: "",
      make: "",
      model: "",
      // Vehicle - Additional Details
      manufacture_year: "",
      vehicle_color: "",
      fuel_type: "",
      seating_capacity: "",
      vehicle_type: "",
      // Vehicle - Registration & Insurance
      registration_number: "",
      registration_expiry_date: "",
      insurance_policy_number: "",
      insurance_provider: "",
      insurance_expiry_date: "",
      // Vehicle - Maintenance
      last_service_date: "",
      next_service_date: "",
      service_interval_km: "",
      // IT/Lab Equipment
      serial_number: "",
      // Standard fields
      description: "",
      donor: "",
      depreciation_rate: "",
      acquisition_date: "",
      state: "",
      asset_condition: "",
      location: "",
      estimated_life_span: "",
      classification: "",
      usd_cost: "",
      ngn_cost: "",
      unit: "",
      implementer: "",
      insurance_duration: "",
      category: "",
    },
  });

  const { data: assetType } = useGetAllAssetTypes({
    page: 1,
    size: 2000000,
    search: "",
  });

  // Asset Type options removed - now auto-derived from category selection
  // const assetTypeOptions = useMemo(
  //   () =>
  //     assetType?.data?.results?.map(({ name, id }) => ({
  //       label: name,
  //       value: id,
  //     })),
  //   [assetType]
  // );

  const { data: project } = useGetAllProjects({
    page: 1,
    size: 2000000,
    search: "",
  });

  const projectOptions = useMemo(
    () =>
      project?.data?.results?.map(({ title, id }) => ({
        label: title,
        value: id,
      })) ?? [],
    [project]
  );

  const { data: user } = useGetAllUsers({
    page: 1,
    size: 2000000,
    search: "",
  });

  const userOptions = useMemo(
    () =>
      user?.data?.results?.map(({ first_name, last_name, id }) => ({
        label: `${first_name} ${last_name}`,
        value: id,
      })) ?? [],
    [user]
  );

  const { data: partner } = useGetAllPartners({
    page: 1,
    size: 2000000,
    search: "",
  });

  const partnerOptions = useMemo(
    () =>
      partner?.data?.results?.map(({ name, id }) => ({
        label: name,
        value: id,
      })) ?? [],
    [partner]
  );

  const stateOptions = useMemo(
    () =>
      nigerianStates.map((state) => ({
        label: state,
        value: state,
      })),
    [nigerianStates]
  );

  const { data: assetCondition } = useGetAllAssetConditions({
    page: 1,
    size: 2000000,
    search: "",
  });

  const assetConditionOptions = useMemo(
    () =>
      assetCondition?.data?.results?.map(({ name, id }) => ({
        label: name,
        value: id,
      })) ?? [],
    [assetCondition]
  );

  const { data: location } = useGetAHNIOfficeLocations({
    page: 1,
    size: 2000000,
    search: "",
  });

  const locationOptions = useMemo(
    () =>
      location?.data?.results?.map(({ name, id }) => ({
        label: name,
        value: id,
      })) ?? [],
    [location]
  );

  const { data: assetClassification } = useGetAllAssetClassifications({
    page: 1,
    size: 2000000,
    search: "",
  });

  const assetClassificationOptions = useMemo(
    () =>
      assetClassification?.data?.results?.map(({ name, id }) => ({
        label: name,
        value: id,
      })) ?? [],
    [assetClassification]
  );

  const { data: fundingSource } = useGetAllFundingSources({
    page: 1,
    size: 200000,
    search: "",
  });

  const fundingSourceOptions = useMemo(
    () =>
      fundingSource?.data?.results?.map(({ name, id }) => ({
        label: name,
        value: id,
      })) ?? [],
    [fundingSource]
  );

  // Fetch all categories for hierarchical selection
  const { data: categories } = useGetAllCategories({
    page: 1,
    size: 1000, // Get all categories
    search: "",
  });

  // Item type options (GOODS, SERVICE, WORK)
  const itemTypeOptions = useMemo(
    () => [
      { label: "Goods", value: ITEM_TYPES.GOODS },
      { label: "Service", value: ITEM_TYPES.SERVICE },
      { label: "Work", value: ITEM_TYPES.WORK },
      { label: "Others", value: ITEM_TYPES.OTHERS },
    ],
    []
  );

  // Parent category options (filtered by item type)
  const parentCategoryOptions = useMemo(() => {
    if (!categories?.data?.results || !selectedItemType) {
      return [];
    }

    const topLevelCategories = getCategoriesByTypeAndParent(
      categories.data.results,
      selectedItemType as any
    );

    return buildCategoryOptions(topLevelCategories);
  }, [categories, selectedItemType]);

  // Final category options (filtered by parent category)
  const finalCategoryOptions = useMemo(() => {
    if (!categories?.data?.results || !selectedItemType) {
      return [];
    }

    const childCategories = getCategoriesByTypeAndParent(
      categories.data.results,
      selectedItemType as any,
      selectedParentCategory || undefined
    );

    return buildCategoryOptions(childCategories);
  }, [categories, selectedItemType, selectedParentCategory]);

  const query = useQuery();
  const assetId = query.get("id");

  //   const { data: asset } = useGetSingleAsset(assetId , !! || "", true);
  const { data: asset } = useGetSingleItem(assetId || "", {
    enabled: !!assetId,
  });

  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset?.data?.name,
        assignee: asset?.data?.assignee?.id,
        asset_code: asset?.data?.asset_code,
        project: asset?.data?.project?.id,
        donor: asset?.data?.donor?.id,
        depreciation_rate: asset?.data?.depreciation_rate,
        asset_type: asset?.data?.asset_type?.id,
        acquisition_date: asset?.data?.acquisition_date,
        state: asset?.data?.state,
        asset_condition: asset?.data?.asset_condition?.id,
        location: asset?.data?.location?.id,
        estimated_life_span: asset?.data?.estimated_life_span,
        classification: asset?.data?.classification?.id,
        usd_cost: asset?.data?.usd_cost,
        ngn_cost: asset?.data?.ngn_cost,
        unit: asset?.data?.unit,
        implementer: asset?.data?.implementer?.id,
        insurance_duration: asset?.data?.insurance_duration,
        // Vehicle - Basic Info
        chasis_number: asset?.data?.chasis_number,
        engine_number: asset?.data?.engine_number,
        odometer_reading: asset?.data?.odometer_reading,
        plate_number: asset?.data?.plate_number,
        make: asset?.data?.make,
        model: asset?.data?.model,
        // Vehicle - Additional Details
        manufacture_year: asset?.data?.manufacture_year,
        vehicle_color: asset?.data?.vehicle_color,
        fuel_type: asset?.data?.fuel_type,
        seating_capacity: asset?.data?.seating_capacity,
        vehicle_type: asset?.data?.vehicle_type,
        // Vehicle - Registration & Insurance
        registration_number: asset?.data?.registration_number,
        registration_expiry_date: asset?.data?.registration_expiry_date,
        insurance_policy_number: asset?.data?.insurance_policy_number,
        insurance_provider: asset?.data?.insurance_provider,
        insurance_expiry_date: asset?.data?.insurance_expiry_date,
        // Vehicle - Maintenance
        last_service_date: asset?.data?.last_service_date,
        next_service_date: asset?.data?.next_service_date,
        service_interval_km: asset?.data?.service_interval_km,
        // IT/Lab Equipment
        serial_number: asset?.data?.serial_number,
        // Other fields
        description: asset?.data?.description,
        uom: asset?.data?.uom,
        category: asset?.data?.category?.id || asset?.data?.category,
      });
    }
  }, [asset, user]);

  const router = useRouter();

  const { createItem, isLoading: isCreateLoading } = useAddItem();
  const { updateItem: editItem, isLoading: isEditLoading } = useUpdateItem(
    assetId || ""
  );

  const onSubmit: SubmitHandler<TAssetFormValues> = async (data) => {
    try {
      // Filter out empty, null, undefined, and whitespace-only string values
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          String(value).trim() !== ""
        ) {
          acc[key as keyof TAssetFormValues] = value;
        }
        return acc;
      }, {} as Partial<TAssetFormValues>);

      if (assetId) {
        await editItem(filteredData as any);
      } else {
        await createItem(filteredData as any);
      }

      router.push(AdminRoutes.ASSETS);
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Something went wrong");
    }
  };

  // Watch the selected category to determine which fields to show
  const selectedCategoryId = form.watch("category");

  // Get the category name to determine asset type
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId || !categories?.data?.results) return "";

    const category = categories.data.results.find(
      (cat) => cat.id === selectedCategoryId
    );

    return category?.name?.toLowerCase() || "";
  }, [selectedCategoryId, categories]);

  // Determine which conditional fields to show based on category
  const isVehicle = selectedCategoryName.includes("vehicle");
  const isITEquipment = selectedCategoryName.includes("it") || selectedCategoryName.includes("equipment");
  const isLabEquipment = selectedCategoryName.includes("lab") || selectedCategoryName.includes("laboratory");
  const isFurniture = selectedCategoryName.includes("furniture");

  // Auto-derive asset type from category selection
  const getAssetTypeByCategory = useCallback((categoryName: string) => {
    if (!assetType?.data?.results) return null;

    const normalizedCategory = categoryName.toLowerCase();

    // Find matching asset type based on category name
    return assetType.data.results.find((type: any) => {
      const normalizedTypeName = type.name.toLowerCase();

      if (normalizedCategory.includes("vehicle")) {
        return normalizedTypeName.includes("vehicle") || normalizedTypeName.includes("transport");
      }
      if (normalizedCategory.includes("equipment") || normalizedCategory.includes("it")) {
        return normalizedTypeName.includes("equipment") || normalizedTypeName.includes("technology");
      }
      if (normalizedCategory.includes("lab") || normalizedCategory.includes("laboratory")) {
        return normalizedTypeName.includes("lab") || normalizedTypeName.includes("scientific");
      }
      if (normalizedCategory.includes("furniture")) {
        return normalizedTypeName.includes("furniture") || normalizedTypeName.includes("office");
      }

      // Default fallback - try to match by name similarity
      return normalizedTypeName.includes(normalizedCategory) || normalizedCategory.includes(normalizedTypeName);
    });
  }, [assetType]);

  // Effect to auto-set asset type when category changes
  useEffect(() => {
    if (selectedCategoryName && assetType?.data?.results) {
      const matchingAssetType = getAssetTypeByCategory(selectedCategoryName);
      if (matchingAssetType) {
        form.setValue("asset_type", matchingAssetType.id);
      }
    }
  }, [selectedCategoryName, assetType, getAssetTypeByCategory, form]);

  const selectedAssetTypeId = form.watch("asset_type");
  const selectedAssetTypeName = assetType?.data.results.find(
    (assetType) => assetType.id === selectedAssetTypeId
  )?.name;

  return (
    <div className='space-y-6'>
      <BackNavigation
        extraText={asset ? "Asset Update" : "Asset Registration"}
      />
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-y-7'
          >
            <div className='grid grid-cols-3 gap-x-5 gap-y-10'>
              <FormInput
                label='Asset Name'
                name='name'
                placeholder='Enter Asset Name'
                required
              />

              {/* Asset Type is now auto-derived from Category selection */}
              {/* <FormSelect
                label='Asset Type'
                name='asset_type'
                placeholder='Select Asset Type'
                required
                options={assetTypeOptions}
              /> */}

              <FormSelect
                label='Project'
                name='project'
                placeholder='Select Project'
                required
                options={projectOptions}
              />

              <FormSelect
                label='Assignee'
                name='assignee'
                placeholder='Select Assignee'
                options={userOptions}
                required
              />

              <FormInput
                label='Asset Code'
                name='asset_code'
                placeholder='Enter Asset Code'
                required
              />

              {/* Conditional fields based on asset category */}

              {/* Vehicle-specific fields */}
              {isVehicle && (
                <>
                  {/* Section: Basic Vehicle Information */}
                  <div className='col-span-3'>
                    <h3 className='font-semibold text-gray-700 border-b pb-2'>Basic Vehicle Information</h3>
                  </div>

                  <FormInput
                    label='Plate Number'
                    name='plate_number'
                    placeholder='Enter Plate Number'
                  />

                  <FormInput
                    label='VIN Number'
                    name='chasis_number'
                    placeholder='Enter VIN Number'
                  />

                  <FormInput
                    label='Engine Number'
                    name='engine_number'
                    placeholder='Enter Engine Number'
                  />

                  <FormInput
                    label='Make'
                    name='make'
                    placeholder='Enter Make (e.g., Toyota, Honda)'
                  />

                  <FormInput
                    label='Model'
                    name='model'
                    placeholder='Enter Model (e.g., Hilux, Accord)'
                  />

                  <FormInput
                    label='Current Odometer Reading'
                    name='odometer_reading'
                    placeholder='Enter Current Odometer Reading (km)'
                    type='number'
                  />

                  {/* Section: Additional Vehicle Details */}
                  <div className='col-span-3'>
                    <h3 className='font-semibold text-gray-700 border-b pb-2 mt-4'>Additional Vehicle Details</h3>
                  </div>

                  <FormInput
                    label='Manufacture Year'
                    name='manufacture_year'
                    placeholder='Enter Manufacture Year (e.g., 2020)'
                    type='number'
                  />

                  <FormInput
                    label='Vehicle Color'
                    name='vehicle_color'
                    placeholder='Enter Vehicle Color'
                  />

                  <FormSelect
                    label='Fuel Type'
                    name='fuel_type'
                    placeholder='Select Fuel Type'
                    options={[
                      { label: "Petrol", value: "PETROL" },
                      { label: "Diesel", value: "DIESEL" },
                      { label: "Electric", value: "ELECTRIC" },
                      { label: "Hybrid", value: "HYBRID" },
                      { label: "CNG", value: "CNG" },
                      { label: "LPG", value: "LPG" },
                    ]}
                  />

                  <FormInput
                    label='Seating Capacity'
                    name='seating_capacity'
                    placeholder='Enter Number of Seats'
                    type='number'
                  />

                  <FormSelect
                    label='Vehicle Type'
                    name='vehicle_type'
                    placeholder='Select Vehicle Type'
                    options={[
                      { label: "Sedan", value: "SEDAN" },
                      { label: "SUV", value: "SUV" },
                      { label: "Truck", value: "TRUCK" },
                      { label: "Van", value: "VAN" },
                      { label: "Pickup", value: "PICKUP" },
                      { label: "Bus", value: "BUS" },
                      { label: "Motorcycle", value: "MOTORCYCLE" },
                      { label: "Other", value: "OTHER" },
                    ]}
                  />

                  {/* Section: Registration & Insurance */}
                  <div className='col-span-3'>
                    <h3 className='font-semibold text-gray-700 border-b pb-2 mt-4'>Registration & Insurance</h3>
                  </div>

                  <FormInput
                    label='Registration Number'
                    name='registration_number'
                    placeholder='Enter Registration Number'
                  />

                  <FormInput
                    label='Registration Expiry Date'
                    name='registration_expiry_date'
                    placeholder='Select Registration Expiry'
                    type='date'
                  />

                  <FormInput
                    label='Insurance Policy Number'
                    name='insurance_policy_number'
                    placeholder='Enter Insurance Policy Number'
                  />

                  <FormInput
                    label='Insurance Provider'
                    name='insurance_provider'
                    placeholder='Enter Insurance Provider Name'
                  />

                  <FormInput
                    label='Insurance Expiry Date'
                    name='insurance_expiry_date'
                    placeholder='Select Insurance Expiry'
                    type='date'
                  />

                  {/* Section: Maintenance Schedule */}
                  <div className='col-span-3'>
                    <h3 className='font-semibold text-gray-700 border-b pb-2 mt-4'>Maintenance Schedule</h3>
                  </div>

                  <FormInput
                    label='Last Service Date'
                    name='last_service_date'
                    placeholder='Select Last Service Date'
                    type='date'
                  />

                  <FormInput
                    label='Next Service Date'
                    name='next_service_date'
                    placeholder='Select Next Service Date'
                    type='date'
                  />

                  <FormInput
                    label='Service Interval (km)'
                    name='service_interval_km'
                    placeholder='Enter Service Interval (e.g., 5000)'
                    type='number'
                  />
                </>
              )}

              {/* IT Equipment fields */}
              {isITEquipment && !isVehicle && (
                <>
                  <FormInput
                    label='Serial Number'
                    name='serial_number'
                    placeholder='Enter Serial Number'
                  />

                  <FormInput
                    label='Make'
                    name='make'
                    placeholder='Enter Make (e.g., Dell, HP)'
                  />

                  <FormInput
                    label='Model'
                    name='model'
                    placeholder='Enter Model'
                  />
                </>
              )}

              {/* Lab Equipment fields */}
              {isLabEquipment && (
                <>
                  <FormInput
                    label='Make'
                    name='make'
                    placeholder='Enter Make'
                  />

                  <FormInput
                    label='Model'
                    name='model'
                    placeholder='Enter Model'
                  />

                  <FormInput
                    label='Serial Number'
                    name='serial_number'
                    placeholder='Enter Serial Number'
                  />
                </>
              )}

              {/* Furniture has no special fields */}

              <FormSelect
                label='Funding Source'
                name='donor'
                placeholder='Select Funding Source'
                required
                options={fundingSourceOptions}
              />

              <FormInput
                label='Date of Acquisition'
                name='acquisition_date'
                required
                placeholder='Select Acquisition Date'
                type='date'
              />

              <FormInput
                label='Current Insurance Duration'
                name='insurance_duration'
                placeholder='Enter Current Insurance Duration'
                required
              />

              <FormInput
                label='Depreciation Rate'
                name='depreciation_rate'
                placeholder='Enter Depreciation Rate'
                required
                type='number'
              />

              <FormSelect
                label='Select State'
                name='state'
                placeholder='Select State'
                required
                options={stateOptions}
              />

              <FormSelect
                label='Asset Condition'
                name='asset_condition'
                placeholder='Select Asset Condition'
                required
                options={assetConditionOptions}
              />

              <FormSelect
                label='Location'
                name='location'
                placeholder='Select Location'
                required
                options={locationOptions}
              />

              <FormInput
                label='Life of the Project'
                name='estimated_life_span'
                placeholder='Enter Life of Project'
                required
              />

              <FormSelect
                label='Classification'
                name='classification'
                placeholder='Select Classification'
                required
                options={assetClassificationOptions}
              />

              <FormInput
                label='Cost in USD'
                name='usd_cost'
                placeholder='Enter USD Cost'
                required
                type='number'
              />

              <FormInput
                label='Cost in NGN'
                name='ngn_cost'
                placeholder='Enter NGN Cost'
                required
                type='number'
              />

              <FormInput
                label='Unit'
                name='unit'
                placeholder='Enter Unit'
                required
                type='number'
              />

              <FormSelect
                label='Implementer'
                name='implementer'
                placeholder='Select Implementer'
                required
                options={partnerOptions}
              />
            </div>

            <div className='grid grid-cols-2 gap-x-5 gap-y-10'>
              <FormInput
                label='UOM'
                name='uom'
                required
                placeholder='Enter UOM'
              />

              {/* Cascading Category Selection */}
              <div className='col-span-2'>
                <h3 className='font-semibold mb-4 text-gray-700'>Category Selection</h3>
                <div className='grid grid-cols-3 gap-x-5 gap-y-6'>
                  {/* Step 1: Item Type */}
                  <FormSelect
                    label='Item Type'
                    name='item_type'
                    required
                    placeholder='Select Item Type'
                    options={itemTypeOptions}
                    onValueChange={(value) => {
                      setSelectedItemType(value);
                      setSelectedParentCategory("");
                      form.setValue("category", "");
                    }}
                  />

                  {/* Step 2: Parent Category (Assets, Consumables, etc.) */}
                  <FormSelect
                    label='Parent Category'
                    name='parent_category'
                    required={!!selectedItemType}
                    placeholder={
                      !selectedItemType
                        ? "Select Item Type first"
                        : parentCategoryOptions.length === 0
                        ? "No parent categories available"
                        : "Select Parent Category"
                    }
                    options={parentCategoryOptions}
                    disabled={!selectedItemType}
                    onValueChange={(value) => {
                      setSelectedParentCategory(value);
                      form.setValue("category", "");
                    }}
                  />

                  {/* Step 3: Final Category (Vehicles, IT Equipment, etc.) */}
                  <FormSelect
                    label='Category'
                    name='category'
                    required
                    placeholder={
                      !selectedItemType
                        ? "Select Item Type first"
                        : !selectedParentCategory
                        ? "Select Parent Category first"
                        : finalCategoryOptions.length === 0
                        ? "No categories available"
                        : "Select Category"
                    }
                    options={finalCategoryOptions}
                    disabled={!selectedItemType || !selectedParentCategory}
                  />
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  Example: Goods → Assets → Vehicles
                </p>
              </div>
            </div>

            <FormTextArea
              label='Description'
              name='description'
              placeholder='Enter Description'
              required
            />

            <FormButton
              loading={isCreateLoading || isEditLoading}
              className='ml-auto'
              size='lg'
            >
              Submit
            </FormButton>
          </form>
        </Form>
      </div>
    </div>
  );
}
