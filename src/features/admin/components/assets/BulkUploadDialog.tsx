"use client";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { useBulkUploadItems } from "@/features/modules/controllers/config/itemController";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAssetUploadLookups, preprocessAssetCSV, type AssetUploadLookups } from "@/features/admin/utils/assetBulkUploadHelper";

// Version marker to verify code is loading
console.log('🚀🚀🚀 BulkUploadDialog V3 LOADED - 2025-01-09-18:00 🚀🚀🚀');

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string; // Keep for backward compatibility but no longer used
}

interface UploadResult {
  created: number;
  updated: number;
  failed: number;
  skipped?: number;
  errors?: Array<{ row: number; item_name?: string; errors: string[] | string }>;
}

export default function AssetBulkUploadDialog({ open, onOpenChange }: BulkUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [lookups, setLookups] = useState<AssetUploadLookups | null>(null);
  const [isLoadingLookups, setIsLoadingLookups] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { bulkUploadItems, isLoading } = useBulkUploadItems();

  // Fetch lookup data when dialog opens
  useEffect(() => {
    if (open && !lookups) {
      console.log('🔄 Dialog opened, fetching lookup data...');
      setIsLoadingLookups(true);
      fetchAssetUploadLookups()
        .then((data) => {
          console.log('✅ Lookup data fetched successfully:', {
            assetTypes: data.assetTypes.size,
            projects: data.projects.size,
            donors: data.donors.size,
            implementers: data.implementers.size,
            locations: data.locations.size,
            classifications: data.classifications.size,
            conditions: data.conditions.size,
            employees: data.employees.size
          });
          setLookups(data);
          setIsLoadingLookups(false);
        })
        .catch((error) => {
          console.error("❌ Error loading lookup data:", error);
          toast.error("Failed to load reference data. Some name lookups may not work.");
          setIsLoadingLookups(false);
        });
    }
  }, [open, lookups]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv"
      ];

      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error("Please upload a valid Excel or CSV file");
        return;
      }

      setSelectedFile(file);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    // VERSION: 2025-01-09-17:45 - Name to UUID preprocessing active
    alert('🚀 NEW CODE V2 LOADED! Upload button clicked with file: ' + (selectedFile?.name || 'none'));
    console.log('🚀 NEW CODE V2 - handleUpload called at', new Date().toISOString());

    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!lookups) {
      toast.error("Reference data is still loading. Please wait a moment.");
      return;
    }

    try {
      setUploadStatus("uploading");
      setUploadProgress(0);
      setUploadResult(null);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 70));
      }, 200);

      // Preprocess CSV to convert names to UUIDs
      console.log('🔄 Starting preprocessing for file:', selectedFile.name, selectedFile.type, selectedFile.size);
      console.log('📊 Lookups available:', {
        assetTypes: lookups.assetTypes.size,
        projects: lookups.projects.size,
        donors: lookups.donors.size,
        implementers: lookups.implementers.size,
        locations: lookups.locations.size,
        classifications: lookups.classifications.size,
        conditions: lookups.conditions.size,
        employees: lookups.employees.size
      });
      toast.info("Converting names to system IDs...");

      let processedFile;
      try {
        processedFile = await preprocessAssetCSV(selectedFile, lookups);
        console.log('✅ Preprocessing completed successfully');
        console.log('📄 Processed file:', processedFile.name, processedFile.type, processedFile.size);
      } catch (preprocessError) {
        console.error('❌ Preprocessing failed:', preprocessError);
        clearInterval(progressInterval);
        throw new Error(`Failed to preprocess file: ${preprocessError instanceof Error ? preprocessError.message : 'Unknown error'}`);
      }

      // Update progress
      clearInterval(progressInterval);
      setUploadProgress(80);

      // Upload the processed file
      console.log('Uploading processed file:', processedFile.name, processedFile.type, processedFile.size);

      // DEBUG: Read the actual file content before uploading
      const verifyReader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        verifyReader.onload = (e) => resolve(e.target?.result as string);
        verifyReader.onerror = reject;
        verifyReader.readAsText(processedFile);
      });
      console.log('📄 ACTUAL FILE CONTENT BEING UPLOADED:');
      console.log('First 500 chars:', fileContent.substring(0, 500));
      console.log('Last 200 chars:', fileContent.substring(Math.max(0, fileContent.length - 200)));
      console.log('Total length:', fileContent.length, 'characters');
      console.log('Number of lines:', fileContent.split('\n').length);

      toast.info("Uploading assets...");
      const result = await bulkUploadItems(processedFile);

      setUploadProgress(100);

      // Extract result data from the response
      const resultData = result?.data || result;
      console.log('📊 Upload Result:', JSON.stringify(resultData, null, 2));
      console.log('📊 Full API Response:', JSON.stringify(result, null, 2));
      setUploadResult(resultData);

      if (resultData.failed > 0) {
        setUploadStatus("error");
        toast.error(`Upload completed with ${resultData.failed} errors. Check details below.`);
      } else {
        setUploadStatus("success");
        const successMessage = `Successfully uploaded! Created: ${resultData.created || 0}, Updated: ${resultData.updated || 0}`;
        console.log('✅ Success:', successMessage);
        toast.success(successMessage);

        // Close dialog and reload after success
        setTimeout(() => {
          console.log('🔄 Reloading page to show new data...');
          onOpenChange(false);
          setSelectedFile(null);
          setUploadStatus("idle");
          setUploadResult(null);
          window.location.reload();
        }, 3000);
      }
    } catch (error: any) {
      setUploadStatus("error");
      setUploadProgress(0);

      console.error("Bulk upload error:", error);

      // Extract detailed error message
      let errorMessage = "Failed to upload assets";

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Check if errors are simple strings (validation errors) or objects (row errors)
          if (errorData.errors.length > 0 && typeof errorData.errors[0] === 'string') {
            // Simple validation errors - show them directly
            errorMessage = errorData.message || "Upload failed";
            if (errorData.errors.length > 0) {
              errorMessage += `: ${errorData.errors.join(', ')}`;
            }
          } else {
            // Row-specific errors
            setUploadResult(errorData);
            errorMessage = `Upload failed: ${errorData.errors.length} row(s) had errors`;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleDownloadBackendTemplate = async () => {
    try {
      toast.info("Downloading pre-filled template from backend...");

      const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "https://127.0.0.1:8000/api/v1/";
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${baseURL}config/items/download-template/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend template download failed:', response.status, errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'asset_upload_template_populated.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Pre-filled template downloaded! Includes your actual system data (categories, employees, etc.)");
    } catch (error) {
      console.error('Error downloading backend template:', error);
      toast.error("Failed to download pre-filled template. Downloading basic template instead...");
      // Fall back to client-side template
      handleDownloadTemplate();
    }
  };

  const handleDownloadTemplate = () => {
    // Get sample names from lookup data for template (only available after lookups are fetched)
    const sampleAssetType = (lookups?.assetTypes.size && lookups.assetTypes.size > 0)
      ? Array.from(lookups.assetTypes.keys())[0]
      : '';
    const sampleDonor = (lookups?.donors.size && lookups.donors.size > 0)
      ? Array.from(lookups.donors.keys())[0]
      : '';
    const sampleLocation = (lookups?.locations.size && lookups.locations.size > 0)
      ? Array.from(lookups.locations.keys())[0]
      : '';
    const sampleClassification = (lookups?.classifications.size && lookups.classifications.size > 0)
      ? Array.from(lookups.classifications.keys())[0]
      : '';
    const sampleCondition = (lookups?.conditions.size && lookups.conditions.size > 0)
      ? Array.from(lookups.conditions.keys())[0]
      : '';
    const sampleImplementer = (lookups?.implementers.size && lookups.implementers.size > 0)
      ? Array.from(lookups.implementers.keys())[0]
      : '';

    // Create comprehensive CSV template with ALL asset fields
    // Includes fields for ALL asset types - leave empty if not applicable
    // Helper text in parentheses is automatically cleaned by the backend
    const headers = [
      // Required fields (ALL asset types)
      "category (Required)",
      "name (Required)",
      "uom (Required)",
      "unit (Required - Quantity)",

      // Standard asset fields (COMMON to all types)
      "description (Optional)",
      "asset_code (Optional)",
      "asset_type (Optional - ID or name)",
      "project (Optional - ID or name)",
      "donor (Optional - ID or name)",
      "assignee (Optional - Email or ID)",
      "implementer (Optional - ID or name)",
      "location (Optional - ID or name)",
      "state (Optional)",
      "classification (Optional - ID or name)",
      "asset_condition (Optional - ID or name)",
      "acquisition_date (Optional - YYYY-MM-DD)",
      "estimated_life_span (Optional - Years)",
      "usd_cost (Optional)",
      "ngn_cost (Optional)",
      "depreciation_rate (Optional - %)",
      "insurance_duration (Optional - Months)",

      // VEHICLE-SPECIFIC FIELDS (Leave empty for non-vehicles)
      // Basic Vehicle Information
      "plate_number (Optional - Vehicles Only)",
      "chasis_number (Optional - Vehicles Only - VIN)",
      "engine_number (Optional - Vehicles Only)",
      "make (Optional - Vehicles Only)",
      "model (Optional - Vehicles Only)",
      "odometer_reading (Optional - Vehicles Only - km)",

      // Additional Vehicle Details
      "manufacture_year (Optional - Vehicles Only)",
      "vehicle_color (Optional - Vehicles Only)",
      "fuel_type (Optional - Vehicles Only - PETROL/DIESEL/ELECTRIC/HYBRID/CNG/LPG)",
      "seating_capacity (Optional - Vehicles Only)",
      "vehicle_type (Optional - Vehicles Only - SEDAN/SUV/TRUCK/VAN/PICKUP/BUS/MOTORCYCLE/OTHER)",

      // Vehicle Registration & Insurance
      "registration_number (Optional - Vehicles Only)",
      "registration_expiry_date (Optional - Vehicles Only - YYYY-MM-DD)",
      "insurance_policy_number (Optional - Vehicles Only)",
      "insurance_provider (Optional - Vehicles Only)",
      "insurance_expiry_date (Optional - Vehicles Only - YYYY-MM-DD)",

      // Vehicle Maintenance Schedule
      "last_service_date (Optional - Vehicles Only - YYYY-MM-DD)",
      "next_service_date (Optional - Vehicles Only - YYYY-MM-DD)",
      "service_interval_km (Optional - Vehicles Only)",

      // IT/LAB EQUIPMENT FIELDS (Leave empty for non-IT assets)
      "serial_number (Optional - IT/Lab Equipment Only)"
    ];

    // Sample data rows - Shows examples for DIFFERENT asset types
    // EXAMPLE 1: IT Equipment (Laptop)
    const sampleData1 = [
      // Required fields
      "Fixed Assets",  // category - REQUIRED (must match exactly)
      "Dell Latitude 7420",  // name - REQUIRED
      "Unit",  // uom - REQUIRED
      "1",  // unit - REQUIRED (quantity)

      // Standard fields
      "14-inch business laptop",  // description
      "AST-2024-001",  // asset_code
      sampleAssetType,  // asset_type - Real name from your system
      "",  // project
      sampleDonor,  // donor - Real name from your system
      "employee@example.com",  // assignee - Use employee email
      sampleImplementer,  // implementer - Real partner name from your system
      sampleLocation,  // location - Real location name from your system
      "Abuja",  // state
      sampleClassification,  // classification
      sampleCondition,  // asset_condition
      "2024-01-15",  // acquisition_date (YYYY-MM-DD)
      "5",  // estimated_life_span (years)
      "1200",  // usd_cost
      "1800000",  // ngn_cost
      "20",  // depreciation_rate
      "",  // insurance_duration

      // Vehicle fields - LEAVE EMPTY for non-vehicles
      "", "", "", "", "", "",  // Basic info (plate, VIN, engine, make, model, odometer)
      "", "", "", "", "",  // Additional details (year, color, fuel, capacity, type)
      "", "", "", "", "",  // Registration & Insurance
      "", "", "",  // Maintenance

      // IT/Lab Equipment fields
      "SN123456789"  // serial_number - FILL IN for IT equipment
    ];

    // EXAMPLE 2: Vehicle
    const sampleData2 = [
      // Required fields
      "Vehicles",  // category - REQUIRED for vehicles
      "Toyota Hilux",  // name - REQUIRED
      "Unit",  // uom - REQUIRED
      "1",  // unit - REQUIRED

      // Standard fields
      "4x4 pickup truck for field work",  // description
      "VEH-2024-001",  // asset_code
      sampleAssetType,  // asset_type
      "",  // project
      sampleDonor,  // donor
      "employee@example.com",  // assignee
      sampleImplementer,  // implementer
      sampleLocation,  // location
      "Lagos",  // state
      sampleClassification,  // classification
      sampleCondition,  // asset_condition
      "2024-03-10",  // acquisition_date
      "10",  // estimated_life_span
      "45000",  // usd_cost
      "67500000",  // ngn_cost
      "15",  // depreciation_rate
      "12",  // insurance_duration

      // Vehicle fields - FILL IN for vehicles
      "LAG-234-AB",  // plate_number
      "MRHTS85J504123456",  // chasis_number (VIN)
      "1GR-FE-12345",  // engine_number
      "Toyota",  // make
      "Hilux",  // model
      "5000",  // odometer_reading (km)
      "2024",  // manufacture_year
      "White",  // vehicle_color
      "DIESEL",  // fuel_type
      "5",  // seating_capacity
      "PICKUP",  // vehicle_type
      "REG-2024-4567",  // registration_number
      "2026-03-10",  // registration_expiry_date
      "POL-2024-8901",  // insurance_policy_number
      "AXA Mansard Insurance",  // insurance_provider
      "2025-03-10",  // insurance_expiry_date
      "2024-10-15",  // last_service_date
      "2025-01-15",  // next_service_date
      "5000",  // service_interval_km

      // IT/Lab Equipment - LEAVE EMPTY for vehicles
      ""  // serial_number
    ];

    // EXAMPLE 3: Furniture/Equipment (No vehicle or IT fields)
    const sampleData3 = [
      // Required fields
      "Fixed Assets",  // category
      "Office Desk",  // name
      "Unit",  // uom
      "1",  // unit

      // Standard fields
      "Wooden executive desk",  // description
      "AST-2024-003",  // asset_code
      sampleAssetType,  // asset_type
      "",  // project
      sampleDonor,  // donor
      "",  // assignee - leave empty
      "",  // implementer
      sampleLocation,  // location
      "",  // state
      sampleClassification,  // classification
      sampleCondition,  // asset_condition
      "2024-02-20",  // acquisition_date
      "10",  // estimated_life_span
      "300",  // usd_cost
      "450000",  // ngn_cost
      "10",  // depreciation_rate
      "",  // insurance_duration

      // Vehicle fields - LEAVE EMPTY for furniture
      "", "", "", "", "", "",  // Basic info
      "", "", "", "", "",  // Additional details
      "", "", "", "", "",  // Registration & Insurance
      "", "", "",  // Maintenance

      // IT/Lab Equipment - LEAVE EMPTY for furniture
      ""  // serial_number
    ];

    // Build helpful comment with available options
    const availableOptions = [];
    if (lookups) {
      if (lookups.assetTypes.size > 0) {
        const types = Array.from(lookups.assetTypes.keys()).slice(0, 5).join(', ');
        availableOptions.push(`# Available Asset Types: ${types}${lookups.assetTypes.size > 5 ? `, ... (${lookups.assetTypes.size} total)` : ''}`);
      }
      if (lookups.donors.size > 0) {
        const donors = Array.from(lookups.donors.keys()).slice(0, 5).join(', ');
        availableOptions.push(`# Available Donors: ${donors}${lookups.donors.size > 5 ? `, ... (${lookups.donors.size} total)` : ''}`);
      }
      if (lookups.locations.size > 0) {
        const locations = Array.from(lookups.locations.keys()).slice(0, 5).join(', ');
        availableOptions.push(`# Available Locations: ${locations}${lookups.locations.size > 5 ? `, ... (${lookups.locations.size} total)` : ''}`);
      }
      if (lookups.classifications.size > 0) {
        const classifications = Array.from(lookups.classifications.keys()).slice(0, 5).join(', ');
        availableOptions.push(`# Available Classifications: ${classifications}${lookups.classifications.size > 5 ? `, ... (${lookups.classifications.size} total)` : ''}`);
      }
      if (lookups.conditions.size > 0) {
        const conditions = Array.from(lookups.conditions.keys()).slice(0, 5).join(', ');
        availableOptions.push(`# Available Conditions: ${conditions}${lookups.conditions.size > 5 ? `, ... (${lookups.conditions.size} total)` : ''}`);
      }
    }

    const csvContent = [
      headers.join(","),
      "# ================================================================================================",
      "# COMPREHENSIVE ASSET UPLOAD TEMPLATE - Supports ALL Asset Types",
      "# ================================================================================================",
      "#",
      "# INSTRUCTIONS:",
      "# 1. This single template works for ALL asset types (Vehicles, IT Equipment, Furniture, etc.)",
      "# 2. Required fields: category, name, uom, unit - MUST be filled for every asset",
      "# 3. Optional fields: Leave EMPTY if not applicable to your asset type",
      "# 4. Vehicle fields: Only fill for vehicles - leave empty for other asset types",
      "# 5. IT/Lab fields: Only fill for IT/Lab equipment - leave empty for other asset types",
      "# 6. Use EXACT names for: Asset Type, Project, Donor, Location, Classification, Condition",
      "# 7. Date format: YYYY-MM-DD (e.g., 2024-01-15)",
      "# 8. Multiple asset types can be uploaded in ONE file",
      "#",
      ...availableOptions,
      "#",
      "# ================================================================================================",
      "# SAMPLE DATA - Shows 3 different asset types:",
      "# ================================================================================================",
      "#",
      "# Example 1: IT Equipment (Laptop) - Has serial_number, no vehicle fields",
      sampleData1.join(","),
      "#",
      "# Example 2: Vehicle (Toyota Hilux) - Has all vehicle fields filled, no serial_number",
      sampleData2.join(","),
      "#",
      "# Example 3: Furniture (Office Desk) - Standard fields only, no vehicle/IT fields",
      sampleData3.join(","),
      "#",
      "# ================================================================================================",
      "# ADD YOUR ASSETS BELOW - Delete examples above and add your own data",
      "# ================================================================================================",
      Array(headers.length).fill("").join(","),
      Array(headers.length).fill("").join(","),
      Array(headers.length).fill("").join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "assets_upload_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Template downloaded successfully!");
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Assets</DialogTitle>
          <DialogDescription>
            Add many assets at once from a spreadsheet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Loading Lookups Indicator */}
          {isLoadingLookups && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-900">
                Preparing…
              </p>
            </div>
          )}

          {/* Step 1 */}
          <section>
            <h4 className="mb-1 text-sm font-semibold">1. Get the template</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              It comes filled with your categories and locations, so you can just type names.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button onClick={handleDownloadBackendTemplate} size="sm">
                <Download size={16} className="mr-2" />
                Download template
              </Button>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Blank version
              </button>
            </div>
          </section>

          {/* Upload Section */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">2. Upload it</h4>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {!selectedFile ? (
                  <>
                    <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                    <p className="text-sm text-gray-600 mb-2">
                      Drop your file here or choose one
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      CSV or Excel, up to 10 MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          Select File
                        </span>
                      </Button>
                    </label>
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="text-green-600" size={24} />
                      <div className="text-left">
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      disabled={isLoading}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploadStatus === "uploading" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Results */}
            {uploadResult && (
              <div className="space-y-3">
                {/* Summary */}
                <div className={`p-4 rounded-lg border ${
                  uploadResult.failed === 0
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <div className="flex items-start gap-3">
                    {uploadResult.failed === 0 ? (
                      <CheckCircle className="text-green-600 mt-0.5" size={20} />
                    ) : (
                      <Info className="text-yellow-600 mt-0.5" size={20} />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-2">Upload Summary</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p className="text-green-700 font-semibold text-lg">{uploadResult.created}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Updated</p>
                          <p className="text-blue-700 font-semibold text-lg">{uploadResult.updated}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Failed</p>
                          <p className="text-red-700 font-semibold text-lg">{uploadResult.failed}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Details */}
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="border rounded-lg border-red-200 bg-red-50">
                    <div className="p-3 border-b border-red-200 bg-red-100">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={18} />
                        <h4 className="font-semibold text-sm text-red-900">
                          Error Details ({uploadResult.errors.length} errors)
                        </h4>
                      </div>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="p-3 space-y-2">
                        {uploadResult.errors.map((error, index) => (
                          <div key={index} className="p-2 bg-white border border-red-200 rounded text-xs">
                            <p className="font-semibold text-red-800">
                              Row {error.row}{error.item_name ? `: ${error.item_name}` : ''}
                            </p>
                            <div className="text-red-700 mt-1">
                              {Array.isArray(error.errors) ? (
                                error.errors.map((err, i) => (
                                  <p key={i}>• {err}</p>
                                ))
                              ) : (
                                <p>{error.errors}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {uploadStatus === "error" && !uploadResult && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-800">Upload failed. Please check the error messages above.</p>
              </div>
            )}
          </div>

          {/* Tips – collapsed so the dialog stays short */}
          <details className="group rounded-lg border px-4 py-3 text-sm">
            <summary className="cursor-pointer list-none font-medium text-foreground marker:hidden">
              Tips for filling it in
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Category, Name, UOM and Unit are required.</li>
              <li>Don&apos;t change the header row.</li>
              <li>Dates as YYYY-MM-DD. Assignee as an email address.</li>
              <li>Vehicle and IT fields only apply to those asset types.</li>
            </ul>
          </details>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isLoadingLookups}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading || isLoadingLookups || !lookups}
          >
            {isLoadingLookups ? "Loading reference data..." : isLoading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
