"use client";
/**
 * Navigation data for the staff dashboard, with the exact permission / department
 * filtering that used to live inside components/Sidebar.tsx (moved here verbatim so
 * the new shell shows the same items to the same people).
 */
import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  departmentalLinks,
  globalHubLinks,
  moduleLinks,
  globalHubCategories,
  SidebarItem,
} from "@/utils/sidebarItems";
import { groupGlobalHubByCategory } from "@/utils/sidebarPermissions";
import { useUnifiedPermissions } from "@/hooks/useUnifiedPermissions";
import { useDepartmentFeatures } from "@/hooks/useDepartmentFeatures";
import { useAppSelector } from "@/store/hooks";

export function useSidebarNav() {
  // UNIFIED PERMISSION SYSTEM - Single source of truth
  const {
    hasPermission,
    hasPermissionByCodename,
    isAdmin,
    isLoading: permissionsLoading,
    user
  } = useUnifiedPermissions();

  const authState = useAppSelector(state => state.auth);
  const pathname = usePathname();

  // Get permission count from auth state for more permissive filtering
  const permissionCount = authState.permissions?.length || 0;

  // Department-based features
  const {
    userDepartment,
    hasEmployeeProfile,
    canAccessProgramsFeatures,
    canAccessContractsGrantsFeatures,
    canAccessHRFeatures,
    canAccessFinanceFeatures,
    canAccessAdminFeatures,
    canAccessProcurementFeatures,
    getDepartmentFeatures,
    getDepartmentTheme
  } = useDepartmentFeatures();

  // Hydration state management
  // Hydration state management
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    // Debug after hydration
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 SIDEBAR HYDRATED DEBUG:', {
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!user,
        userEmail: user?.email || 'no user'
      });
    }
  }, [authState.isAuthenticated, user]);

  // Department-based access mapping using new hook
  const getDepartmentAccess = () => {
    const features = getDepartmentFeatures();
    const accessMap: string[] = [];

    // Debug department features (development only)
    if (process.env.NODE_ENV === 'development' && user?.email?.includes('admin')) {
      console.log('🏢 Department Features Debug:', {
        userEmail: user?.email,
        features,
        adminFeature: features.admin,
        canAccessAdminFeatures
      });
    }

    if (features.programs) accessMap.push('Programs');
    if (features.contractsGrants) accessMap.push('C&G');
    if (features.hr) accessMap.push('HR');
    if (features.finance) accessMap.push('Finance');
    if (features.admin) accessMap.push('Admin');
    if (features.procurement) accessMap.push('Procurement Management');

    // STAFF GLOBAL HUB ACCESS - All staff members get full Global Hub access
    if (user && authState.isAuthenticated) {
      // Core Global Hub items that all authenticated users can access
      accessMap.push('Global Hub');
      accessMap.push('Staff Self-Service');
      accessMap.push('Support');

      // Staff members (officers) get access to ALL Global Hub items
      if (user?.is_staff || isAdmin) {
        accessMap.push('Communication', 'Organization', 'Programs & Planning', 'Procurement & Purchasing',
                       'Inventory Management', 'Fleet & Transport', 'Maintenance', 'Financial Services', 'Contracts & Reports');
      } else {
        // For non-staff users, provide department-specific access only
        if (canAccessContractsGrantsFeatures) accessMap.push('Contracts & Reports');
        if (canAccessProgramsFeatures) accessMap.push('Programs & Planning');
        if (canAccessFinanceFeatures) accessMap.push('Financial Services');
        if (canAccessAdminFeatures) accessMap.push('Inventory Management', 'Fleet & Transport', 'Maintenance');
        if (canAccessProcurementFeatures) accessMap.push('Procurement & Purchasing');
      }
    }

    if (features.leave) accessMap.push('Leave Management');
    if (features.itemRequisition) accessMap.push('Item Requisition');
    if (features.travelExpense) accessMap.push('Travel Expense');

    return accessMap;
  };

  // Helper function to check if we're in a department hierarchy for any officer role
  const isInDepartmentHierarchy = (parentDepartment?: string, userPosition?: string): boolean => {
    if (!parentDepartment || !userPosition) return false;

    // Define department hierarchies for each officer type
    const departmentHierarchies: Record<string, { mainDepartment: string; subDepartments: string[] }> = {
      'Program Officer': {
        mainDepartment: 'Programs',
        subDepartments: ['Plans', 'Stakeholder Management', 'Adhoc Management', 'Fund Request', 'Reports']
      },
      'Program Admin': {
        mainDepartment: 'Programs',
        subDepartments: ['Plans', 'Stakeholder Management', 'Adhoc Management', 'Fund Request', 'Reports']
      },
      'HR Officer': {
        mainDepartment: 'HR',
        subDepartments: [
          'Employee Management', 'Leave Management', 'Performance Management', 'Training & Development',
          'Recruitment', 'Employee compensation & benefits', 'Separation Management', 'Grievance Management',
          'Timesheet Management', 'Compliance & Audit', 'Employee Relations', 'HR Reports'
        ]
      },
      'HR Manager': {
        mainDepartment: 'HR',
        subDepartments: [
          'Employee Management', 'Leave Management', 'Performance Management', 'Training & Development',
          'Recruitment', 'Employee compensation & benefits', 'Separation Management', 'Grievance Management',
          'Timesheet Management', 'Compliance & Audit', 'Employee Relations', 'HR Reports'
        ]
      },
      'Procurement Officer': {
        mainDepartment: 'Procurement Management',
        subDepartments: ['Purchase Requests', 'Vendor Management', 'Contract Management', 'Procurement Tracker', 'Asset Management']
      },
      'Admin Officer': {
        mainDepartment: 'Admin',
        subDepartments: ['Asset Management', 'Store Management', 'Vehicle Management', 'Facility Management', 'Travel Management']
      },
      'Admin Manager': {
        mainDepartment: 'Admin',
        subDepartments: ['Asset Management', 'Store Management', 'Vehicle Management', 'Facility Management', 'Travel Management', 'Inventory Management', 'Solicitation Management', 'Fleet Management']
      },
      'Finance Officer': {
        mainDepartment: 'Finance',
        subDepartments: [
          'Budget Management', 'Expense Management', 'Financial Reporting', 'Audit', 'Accounts',
          'Financial Classifications', 'Chart of Accounts', 'Bank Accounts', 'Journal Entries',
          'Financial Reports', 'Bank Reconciliation', 'Expense Tracking', 'Budget Reports', 'Petty Cash'
        ]
      },
      'Finance Manager': {
        mainDepartment: 'Finance',
        subDepartments: [
          'Budget Management', 'Expense Management', 'Financial Reporting', 'Audit', 'Accounts',
          'Financial Classifications', 'Chart of Accounts', 'Bank Accounts', 'Journal Entries',
          'Financial Reports', 'Bank Reconciliation', 'Integration Dashboard', 'Financial Analysis',
          'QuickBooks Settings', 'QuickBooks Sync', 'Customer Management', 'Invoicing & Billing',
          'Sales Orders', 'Accounts Receivable', 'Tax Management', 'Accounts Payable',
          'Fixed Assets', 'Expense Tracking', 'Budget Reports', 'Petty Cash', 'Travel Reconciliation'
        ]
      }
    };

    const hierarchy = departmentHierarchies[userPosition];
    if (!hierarchy) return false;

    // Check if it's the direct department or a sub-department
    if (parentDepartment === hierarchy.mainDepartment) return true;
    return hierarchy.subDepartments.includes(parentDepartment);
  };

  // Enhanced menu filtering function with department-based safety layer
  const filterMenuItems = (items: SidebarItem[], isChild: boolean = false, parentDepartment?: string): SidebarItem[] => {
    return items.filter(item => {
      // Get user's allowed departments based on their department and role
      const allowedDepartments = getDepartmentAccess();

      // Show employee profile warning if needed
      if (!hasEmployeeProfile && process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Employee profile not set up - limited menu access');
      }

      // Department-based filtering logic
      let departmentBasedAccess = false;

      if (isChild && parentDepartment) {
        // SUPERUSER OVERRIDE: Admins get access to everything
        if (isAdmin) {
          departmentBasedAccess = true;
        } else {
          // For child items, check if parent department is allowed OR if we're in department hierarchy
          const directParentAllowed = allowedDepartments.includes(parentDepartment);
          const departmentHierarchyAllowed = isInDepartmentHierarchy(parentDepartment, user?.position?.title || '');

          // Enhanced logic for nested children (children of children)
          // Check if this is a nested child under the user's department
          const isNestedCGChild = (parentDepartment === 'Contract Management' || parentDepartment === 'Sub Grants' ||
            parentDepartment === 'Closeout') && canAccessContractsGrantsFeatures;
          const isNestedProgramsChild = (parentDepartment === 'Plans' || parentDepartment === 'Stakeholder Management' ||
            parentDepartment === 'Fund Request' || parentDepartment === 'Adhoc Management') && canAccessProgramsFeatures;
          const isNestedProcurementChild = (parentDepartment === 'Purchase Request' || parentDepartment === 'Vendor Management') && canAccessProcurementFeatures;

          // SIMPLIFIED ADMIN NESTED CHILDREN - All admin submenus
          const adminSubmenus = [
            'Inventory Management', 'Solicitation Management', 'Fleet Management', 'Facility Management',
            'Payment Request', 'Service Level Agreements', 'Asset Maintenance', 'Expense Authorization', 'Travel Expenses Report'
          ];
          const isNestedAdminChild = (adminSubmenus.includes(parentDepartment) || parentDepartment === 'Admin') && canAccessAdminFeatures;

          // Enhanced nested finance child check - includes ALL finance submenu items
          const financeSubmenus = [
            // Main finance sections
            'Finance Dashboards', 'Payments & Disbursements', 'Grant Operations', 'Revenue Management',
            'Accounts Payable', 'Accounts Receivable', 'Expense Management', 'Banking',
            'Accounting Core', 'Tax Management', 'Integrations', 'Reports',
            // Legacy/detailed submenu names (keep for backwards compatibility)
            'Financial Classifications', 'Chart of Accounts', 'Bank Accounts', 'Journal Entries',
            'Financial Reports', 'Bank Reconciliation', 'Integration Dashboard', 'Financial Analysis',
            'QuickBooks Settings', 'QuickBooks Sync', 'Customer Management', 'Invoicing & Billing',
            'Sales Orders', 'Fixed Assets', 'Expense Tracking', 'Budget Reports', 'Petty Cash',
            'Travel Reconciliation'
          ];
          const isNestedFinanceChild = (financeSubmenus.includes(parentDepartment) || parentDepartment === 'Finance') && canAccessFinanceFeatures;

          // Enhanced nested HR child check - includes ALL HR sub-sections
          const hrSubmenus = [
            'Employee Management', 'Leave Management', 'Performance Management', 'Training & Development',
            'Recruitment', 'Employee compensation & benefits', 'Separation Management', 'Grievance Management',
            'Timesheet Management', 'Compliance & Audit', 'Employee Relations', 'HR Reports'
          ];
          const isNestedHRChild = (hrSubmenus.includes(parentDepartment) || parentDepartment === 'HR') && canAccessHRFeatures;

          departmentBasedAccess = allowedDepartments.length === 0 || directParentAllowed || departmentHierarchyAllowed ||
            isNestedCGChild || isNestedProgramsChild || isNestedProcurementChild || isNestedAdminChild || isNestedFinanceChild || isNestedHRChild;
        }
      } else {
        // SUPERUSER OVERRIDE: Admins get access to everything
        if (isAdmin) {
          departmentBasedAccess = true;
        } else {
          // For top-level items, check if this department is allowed
          // Be more permissive if user is authenticated but has low permissions (common for departmental officers)
          departmentBasedAccess = allowedDepartments.length === 0 || allowedDepartments.includes(item.name) ||
            (authState.isAuthenticated && (allowedDepartments.includes('Global Hub') || userDepartment)) ||
            // Special finance user override - email-based finance users should access Finance department
            (item.name === 'Finance' && user?.email?.toLowerCase().includes('finance')) ||
            // Special HR user override - email-based HR users should access HR department
            (item.name === 'HR' && user?.email?.toLowerCase().includes('hr')) ||
            // Special admin user override - email-based admin users should access Admin department
            (item.name === 'Admin' && (user?.email?.toLowerCase().includes('admin.officer') || user?.email?.toLowerCase().includes('adminofficer') || user?.email?.toLowerCase().includes('admin.manager') || user?.email?.toLowerCase().includes('adminmanager'))) ||
            // TEMPORARY DEBUG: Force HR access for testing
            (item.name === 'HR');
        }
      }

      // Permission-based access - be more permissive for departmental officers with 0 permissions
      // Also handle case when permissions are still loading
      const permissionBasedAccess =
        // SUPERUSER OVERRIDE: Admins get access to everything
        (isAdmin) ||
        // No specific permissions required
        (!item.permissions || item.permissions.length === 0) ||
        // User has required permissions
        hasPermission(item.permissions) ||
        // REMOVED: Zero permissions should not grant full access
        // (authState.isAuthenticated && permissionCount === 0) ||
        // Special finance user override - email-based finance users should access Finance module
        (item.name === 'Finance' && user?.email?.toLowerCase().includes('finance')) ||
        // Special HR user override - email-based HR users should access HR module
        (item.name === 'HR' && user?.email?.toLowerCase().includes('hr')) ||
        // Special admin user override - email-based admin users should access Admin module
        (item.name === 'Admin' && (user?.email?.toLowerCase().includes('admin.officer') || user?.email?.toLowerCase().includes('adminofficer') || user?.email?.toLowerCase().includes('admin.manager') || user?.email?.toLowerCase().includes('adminmanager'))) ||
        // REMOVED: These forced HR overrides granted access to all users
        // (item.name === 'HR') ||
        // (item.name?.includes('Employee Management')) ||
        // (item.name?.includes('Recruitment')) ||
        // (item.name?.includes('Performance Management')) ||
        // (item.name?.includes('Timesheet Management')) ||
        // (item.name?.includes('compensation')) ||
        // If permissions are still loading but user is authenticated, be more permissive
        (permissionsLoading && authState.isAuthenticated && user);

      // Get user position for department hierarchy checks
      const userPosition = user?.position?.name || user?.position?.title || '';

      // Special handling for Department Officers - if they can access their department hierarchy,
      // they should see the main functional sub-menus even if specific permissions are missing
      let adjustedPermissionAccess = permissionBasedAccess;

      // SUPERUSER OVERRIDE: Admins get access to everything
      if (isAdmin || user?.is_staff) {
        adjustedPermissionAccess = true;
      } else if (isChild && isInDepartmentHierarchy(parentDepartment, userPosition)) {
        // For department hierarchy (including sub-departments), be more permissive for department officers
        const isDepartmentOfficer = ['Program Officer', 'Program Admin', 'HR Officer', 'HR Manager', 'Procurement Officer', 'Admin Officer', 'Admin Manager', 'Finance Officer', 'Finance Manager'].includes(userPosition);
        if (isDepartmentOfficer) {
          adjustedPermissionAccess = true; // Allow access to all department sub-menus and their children
        }
      }

      // Enhanced child menu access for departmental officers with their own department
      if (isChild && parentDepartment) {
        // SUPERUSER OVERRIDE: Admins get access to everything (already handled above, but keeping for clarity)
        if (!(isAdmin)) {
          // SIMPLIFIED ADMIN DEPARTMENT ACCESS
          // If user can access Admin features, grant access to all Admin submenus
          if (parentDepartment === 'Admin' && canAccessAdminFeatures) {
            adjustedPermissionAccess = true;
          }

          // Other department-specific overrides
          if (parentDepartment === 'Finance' && canAccessFinanceFeatures) {
            adjustedPermissionAccess = true;
          }

          if (parentDepartment === 'HR' && canAccessHRFeatures) {
            adjustedPermissionAccess = true;
          }

          if (parentDepartment === 'Programs' && canAccessProgramsFeatures) {
            adjustedPermissionAccess = true;
          }

          if (parentDepartment === 'C&G' && canAccessContractsGrantsFeatures) {
            adjustedPermissionAccess = true;
          }

          if (parentDepartment === 'Procurement Management' && canAccessProcurementFeatures) {
            adjustedPermissionAccess = true;
          }
        }
      }

      // Combined access: Must pass BOTH department and permission checks
      const finalAccess = departmentBasedAccess && adjustedPermissionAccess;

      // Debug individual permission checks
      if (process.env.NODE_ENV === 'development') {
        const isImportantItem = item.name.includes('Global') || item.name.includes('C&G') ||
          item.name === 'Communication' || item.name === 'Organization' ||
          item.name === 'Programs' || item.name === 'C ANG G' ||
          item.name === 'Finance' || item.name === 'Settings' ||
          item.name === 'Access Management' || item.name === 'Admin' ||
          item.name === 'HR' || item.name === 'Fleet Management' ||
          item.name.includes('Fleet'); // Add Fleet Management to debug

        if (isImportantItem || !finalAccess || isChild) {
          console.log(`🔍 ENHANCED Department Check: "${item.name}"`, {
          isChild: isChild,
          parentDepartment: parentDepartment,
          userPosition: userPosition,
          allowedDepartments: allowedDepartments,
          departmentBasedAccess: departmentBasedAccess,
          directParentAllowed: isChild && parentDepartment ? allowedDepartments.includes(parentDepartment) : 'N/A',
          departmentHierarchyAllowed: isChild && parentDepartment ? isInDepartmentHierarchy(parentDepartment, userPosition) : 'N/A',
          permissionBasedAccess: permissionBasedAccess,
          adjustedPermissionAccess: adjustedPermissionAccess,
          finalAccess: finalAccess,
          departmentOfficerOverride: isChild && isInDepartmentHierarchy(parentDepartment, userPosition) && ['Program Officer', 'Program Admin', 'HR Officer', 'HR Manager', 'Procurement Officer', 'Admin Officer', 'Finance Officer', 'Finance Manager'].includes(userPosition),
          departmentHierarchyCheck: isInDepartmentHierarchy(parentDepartment, userPosition),
          // Finance-specific debugging
          isFinanceItem: item.name === 'Finance',
          userEmailContainsFinance: user?.email?.toLowerCase().includes('finance'),
          canAccessFinanceFeatures: canAccessFinanceFeatures,
          financeEmailOverride: item.name === 'Finance' && user?.email?.toLowerCase().includes('finance'),
          reason: !departmentBasedAccess
            ? `Role "${userPosition}" not allowed for ${isChild ? 'parent department' : 'department'} "${isChild ? parentDepartment : item.name}"`
            : !adjustedPermissionAccess
            ? 'User lacks required permissions (after adjustment)'
            : 'Both role and permissions allow access'
        });
        }
      }

      return finalAccess;
    }).map(item => {
      const filteredChildren = item.children ? filterMenuItems(item.children, true, item.name) : undefined;

      // Debug logging for Finance menu children specifically
      if (process.env.NODE_ENV === 'development' && item.name === 'Finance') {
        console.log('🏦 FINANCE CHILDREN FILTERING DEBUG:', {
          originalChildrenCount: item.children?.length || 0,
          filteredChildrenCount: filteredChildren?.length || 0,
          originalChildren: item.children?.map(c => c.name) || [],
          filteredChildren: filteredChildren?.map(c => c.name) || [],
          userEmail: user?.email,
          canAccessFinanceFeatures: canAccessFinanceFeatures
        });
      }

      // Debug logging for Settings menu children specifically
      if (process.env.NODE_ENV === 'development' && (item.name === 'Settings' || item.name === 'Access Management')) {
        console.log(`⚙️ SETTINGS CHILDREN FILTERING DEBUG: "${item.name}"`, {
          originalChildrenCount: item.children?.length || 0,
          filteredChildrenCount: filteredChildren?.length || 0,
          originalChildren: item.children?.map(c => c.name) || [],
          filteredChildren: filteredChildren?.map(c => c.name) || [],
          userEmail: user?.email,
          isAdmin: isAdmin,
          userIsSuperuser: user?.is_superuser,
          userIsStaff: user?.is_staff,
          willBeRemoved: item.children && filteredChildren?.length === 0,
          itemPermissions: item.permissions || 'none'
        });
      }

      return {
        ...item,
        children: filteredChildren
      };
    }).filter(item => {
      // Keep items that either have no children or have visible children
      return !item.children || item.children.length > 0;
    });
  };

  // UNIFIED FILTERING - Single permission system
  const filteredDepartmentalLinks = useMemo(() => {
    // Enhanced debugging for authentication state
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEPARTMENTAL LINKS FILTERING:', {
        isHydrated,
        permissionsLoading,
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!user,
        userEmail: user?.email,
        userPosition: user?.position?.name || user?.position?.title,
        userDepartment: userDepartment,
        canAccessFinanceFeatures: canAccessFinanceFeatures,
        willShowDepartmentalLinks: isHydrated && !permissionsLoading && authState.isAuthenticated
      });
    }

    // More permissive loading logic - if user is authenticated and hydrated,
    // allow department links to show even if permissions are still loading
    const hasBasicAuth = authState.isAuthenticated && !!user;
    const canShowLinks = isHydrated && hasBasicAuth;

    if (!canShowLinks) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ DEPARTMENTAL LINKS BLOCKED:', {
          reason: !isHydrated ? 'Not hydrated' :
                  !authState.isAuthenticated ? 'Not authenticated' :
                  !user ? 'No user data' :
                  'Unknown',
          isHydrated,
          permissionsLoading,
          isAuthenticated: authState.isAuthenticated,
          hasUser: !!user
        });
      }
      return [];
    }

    // Only superusers and specifically admin department users can see all departments
    // HR Managers should NOT see all departments, even if they are staff
    const isActualAdminUser = user?.is_superuser ||
      (userDepartment?.toUpperCase() === 'ADMIN' || userDepartment?.toUpperCase() === 'ADMINISTRATION');

    // First filter by department - users should only see their own department unless admin
    const departmentFiltered = departmentalLinks.filter(item => {
      if (isActualAdminUser) {
        return true;
      }

      // Map user's department to departmental sections
      const userDept = userDepartment?.toUpperCase() || user?.department?.name?.toUpperCase();

      // Department mapping
      const departmentMapping = {
        'PROGRAMS': ['Programs'],
        'PROCUREMENT': ['Procurement Management'],
        'HR': ['HR'],
        'HUMAN RESOURCES': ['HR'],
        'FINANCE': ['Finance'],
        'CONTRACT & GRANTS': ['C&G'],
        'CONTRACTS & GRANTS': ['C&G'],
        'CONTRACTS AND GRANTS': ['C&G'],
        'C ANG G': ['C&G'],
        'C AND G': ['C&G'],
        'C&G': ['C&G'],
        'CG': ['C&G'],
        'ADMIN': ['Admin'],
        'ADMINISTRATION': ['Admin'],
        'ADMIN DEPT': ['Admin']
      };

      let allowedDepartments = departmentMapping[userDept] || [];

      // Fallback: If no exact match, check for partial matches with common patterns
      if (allowedDepartments.length === 0 && userDept) {
        if (userDept.includes('CONTRACT') || userDept.includes('GRANT') || userDept.includes('C&G') || userDept.includes('CG')) {
          allowedDepartments = ['C&G'];
        } else if (userDept.includes('PROGRAM')) {
          allowedDepartments = ['Programs'];
        } else if (userDept.includes('PROCUR')) {
          allowedDepartments = ['Procurement Management'];
        } else if (userDept.includes('HR') || userDept.includes('HUMAN')) {
          allowedDepartments = ['HR'];
        } else if (userDept.includes('FINANC')) {
          allowedDepartments = ['Finance'];
        } else if (userDept.includes('ADMIN')) {
          allowedDepartments = ['Admin'];
        }
      }

      // Allow if item matches user's department
      return allowedDepartments.includes(item.name);
    });

    // Then apply permission filtering
    const filtered = filterMenuItems(departmentFiltered);

    // Debug logging (development only) - Check departmental filtering
    if (process.env.NODE_ENV === 'development') {
      console.log('🏢 DEPARTMENTAL FILTERING Debug:', {
        userType: isActualAdminUser ? 'Admin' : 'Regular User',
        userPosition: user?.position?.title,
        userDepartment: userDepartment,
        backendDepartment: user?.department?.name,
        originalDepartments: departmentalLinks.map(item => item.name),
        departmentFilteredDepartments: departmentFiltered.map(item => item.name),
        finalFilteredDepartments: filtered.map(item => item.name),
        departmentAccessRule: 'Department Officers should see only their assigned department menu',
        hasFleetManagement: departmentalLinks.some(item => item.name === 'Fleet Management'),
        fleetManagementFiltered: departmentFiltered.some(item => item.name === 'Fleet Management'),
        detailedResults: filtered.map(item => ({
          name: item.name,
          hasChildren: !!item.children,
          childrenCount: item.children?.length || 0
        })),
        // DETAILED ADMIN CHILDREN DEBUG
        adminItem: filtered.find(item => item.name === 'Admin'),
        adminChildren: filtered.find(item => item.name === 'Admin')?.children?.map(child => child.name) || [],
        adminChildrenCount: filtered.find(item => item.name === 'Admin')?.children?.length || 0,
        missingItems: ['Solicitation Management', 'Fleet Management', 'Facility Management'].filter(
          name => !filtered.find(item => item.name === 'Admin')?.children?.some(child => child.name === name)
        )
      });
    }

    return filtered;
  }, [
    isHydrated,
    permissionsLoading,
    authState.isAuthenticated,
    departmentalLinks,
    hasPermission,
    userDepartment,
    canAccessContractsGrantsFeatures,
    canAccessProgramsFeatures,
    canAccessHRFeatures,
    canAccessFinanceFeatures,
    canAccessAdminFeatures,
    canAccessProcurementFeatures
  ]);

  const filteredModuleLinks = useMemo(() => {
    const hasBasicAuth = authState.isAuthenticated && !!user;
    const canShowLinks = isHydrated && hasBasicAuth;

    if (!canShowLinks) {
      return [];
    }

    // Override admin access for Settings/Module links - HR managers should NOT see settings
    const isActualAdminUserForSettings = user?.is_superuser ||
      (userDepartment?.toUpperCase() === 'ADMIN' || userDepartment?.toUpperCase() === 'ADMINISTRATION');

    // If not actually an admin user, return empty array (no Settings access)
    if (!isActualAdminUserForSettings) {
      return [];
    }

    const filtered = filterMenuItems(moduleLinks);

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 UNIFIED Module Links Filtering:', {
        originalCount: moduleLinks.length,
        filteredCount: filtered.length,
        isActualAdminUserForSettings: isActualAdminUserForSettings,
        filteredItems: filtered.map(item => item.name),
        userEmail: user?.email,
        userIsSuperuser: user?.is_superuser,
        userIsStaff: user?.is_staff,
        permissionCount: authState.permissions?.length || 0,
        settingsMenuVisible: filtered.some(item => item.name === 'Settings'),
        accessManagementPermissions: {
          hasViewUser: hasPermission([{ module: "users", codenames: ["view_user"], requireAll: false }]),
          hasChangeUser: hasPermission([{ module: "users", codenames: ["change_user"], requireAll: false }]),
          hasViewRole: hasPermission([{ module: "authorization", codenames: ["view_role"], requireAll: false }]),
          hasViewPermission: hasPermission([{ module: "authorization", codenames: ["view_permission"], requireAll: false }])
        }
      });
    }

    return filtered;
  }, [isHydrated, permissionsLoading, authState.isAuthenticated, moduleLinks, hasPermission, user?.is_superuser, userDepartment]);

  const filteredGlobalHubItems = useMemo(() => {
    const hasBasicAuth = authState.isAuthenticated && !!user;
    const canShowLinks = isHydrated && hasBasicAuth;

    if (!canShowLinks) {
      return [];
    }

    // UNIVERSAL GLOBAL HUB - All authenticated users get Global Hub access immediately
    // This implements proper ERP user lifecycle: Create User → Global Hub → Role Assignment → Departmental Access
    const mapped = globalHubLinks.map(item => ({
      ...item,
      // Convert GlobalHubItem to match expected format
      permissions: item.permissions || undefined
    }));

    const filtered = mapped.filter(item => {
      // Admin and superuser access to everything
      if (isAdmin) {
        return true;
      }

      // Universal items that all authenticated users can access (no permissions required)
      const universalItems = [
        'Announcements',
        'Organization Chart',
        'Calendar',
        'Directory',
        'Annual Supervision Plan',
        'Site Visit Application',
        'Site Visit Management',
        'Supervision Evaluation'
      ];

      if (universalItems.includes(item.label)) {
        return true;
      }

      // If item has no permissions defined, it's universal access
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // PERMISSION-BASED ACCESS for Global Hub items with proper role filtering
      // Global Hub is accessible to all, but content is filtered based on user permissions and roles
      const itemPermissions = item.permissions;
      if (itemPermissions && itemPermissions.length > 0) {
        // Super admins can see everything
        if (user?.is_superuser) {
          return true;
        }

        // For regular staff and officers, check specific permissions
        const hasPermissionAccess = itemPermissions.some(permission => {
          if (!permission.codenames || permission.codenames.length === 0) {
            return true; // No specific permissions required
          }

          // Check if user has the required permissions
          const hasAnyCodename = permission.codenames.some(codename =>
            hasPermissionByCodename(permission.module, codename)
          );

          return hasAnyCodename;
        });

        // Global Hub should be accessible to ALL authenticated users with full visibility
        // Staff members, officers, and departmental managers get broader access to Global Hub items
        if (user?.is_staff || user?.is_superuser ||
            canAccessAdminFeatures || canAccessProcurementFeatures || canAccessFinanceFeatures ||
            canAccessContractsGrantsFeatures || canAccessProgramsFeatures || canAccessHRFeatures) {
          return hasPermissionAccess || true; // Departmental users get access to most Global Hub items
        }

        // For regular employees, check department relevance
        const isDepartmentRelevant =
          canAccessAdminFeatures && (item.category === 'inventory' || item.category === 'fleet' || item.category === 'maintenance' || item.category === 'financial') ||
          canAccessProcurementFeatures && item.category === 'procurement' ||
          canAccessFinanceFeatures && item.category === 'financial' ||
          canAccessContractsGrantsFeatures && item.category === 'contracts' ||
          canAccessProgramsFeatures && item.category === 'programs' ||
          canAccessHRFeatures && item.category === 'hr' || // HR items only for HR department users
          item.category === 'communication' || // Universal communication items
          item.category === 'organization'; // Universal organization items

        return hasPermissionAccess || isDepartmentRelevant;
      }

      return true; // Items without permissions (universal access items)
    });

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      // Special debug for Finance Manager users
      if (user?.email?.toLowerCase().includes('finance') ||
          user?.position?.title?.toLowerCase().includes('finance')) {
        console.log('💰 FINANCE MANAGER GLOBAL HUB DEBUG:', {
          userEmail: user?.email,
          userPosition: user?.position?.title,
          isStaff: user?.is_staff,
          isSuperuser: user?.is_superuser,
          canAccessFinanceFeatures,
          originalGlobalHubCount: globalHubLinks.length,
          filteredCount: filtered.length,
          filteredItems: filtered.map(item => ({
            label: item.label,
            category: item.category,
            hasPermissions: !!(item.permissions && item.permissions.length > 0)
          })),
          departmentAccess: {
            procurement: canAccessProcurementFeatures,
            admin: canAccessAdminFeatures,
            finance: canAccessFinanceFeatures,
            contractsGrants: canAccessContractsGrantsFeatures,
            programs: canAccessProgramsFeatures,
            hr: canAccessHRFeatures
          }
        });
      }

      console.log('🌐 GLOBAL HUB ROLE-BASED ACCESS (ENHANCED FOR MANAGERS):', {
        policy: 'Global Hub accessible to all, but content filtered by department and permissions',
        originalCount: globalHubLinks.length,
        visibleItemsCount: filtered.length,
        accessLevel: 'Universal Access for All Authenticated Users',
        userType: isAdmin ? 'Admin' : user?.is_staff ? 'Staff Officer' : 'Regular Employee',
        isStaff: user?.is_staff,
        isAdmin: isAdmin,
        isSuperuser: user?.is_superuser,
        universalItems: filtered.filter(item => !item.permissions || item.permissions.length === 0).length,
        permissionBasedItems: filtered.filter(item => item.permissions && item.permissions.length > 0).length,
        departmentAccess: {
          procurement: canAccessProcurementFeatures,
          admin: canAccessAdminFeatures,
          finance: canAccessFinanceFeatures,
          contractsGrants: canAccessContractsGrantsFeatures,
          programs: canAccessProgramsFeatures,
          hr: canAccessHRFeatures
        },
        visibleItems: filtered.map(item => ({
          label: item.label,
          category: item.category,
          hasPermissions: !!(item.permissions && item.permissions.length > 0),
          isUniversal: !item.permissions || item.permissions.length === 0
        }))
      });
    }

    return filtered;
  }, [isHydrated, permissionsLoading, authState.isAuthenticated, globalHubLinks, hasPermission, hasPermissionByCodename, user, isAdmin, canAccessProcurementFeatures, canAccessAdminFeatures, canAccessFinanceFeatures, canAccessContractsGrantsFeatures, canAccessProgramsFeatures, canAccessHRFeatures]);

  const groupedGlobalHubMenu = useMemo(() => {
    const grouped = groupGlobalHubByCategory(filteredGlobalHubItems, globalHubCategories);

    // Debug logging for grouped categories
    if (process.env.NODE_ENV === 'development') {
      console.log('🗂️ GLOBAL HUB GROUPED CATEGORIES:', {
        totalCategories: grouped.length,
        categories: grouped.map(cat => ({
          category: cat.category,
          label: cat.label,
          itemCount: cat.items.length,
          items: cat.items.map(item => item.label)
        }))
      });
    }

    return grouped;
  }, [filteredGlobalHubItems]);

  const userHasGlobalHubAccess = useMemo(() => {
    const hasBasicAuth = authState.isAuthenticated && !!user;

    if (!isHydrated) return false;

    // Global Hub access is universal for all authenticated users
    return hasBasicAuth;
  }, [isHydrated, authState.isAuthenticated, user]);

  const canSeeAuditLog = useMemo(
    () => hasPermission([{ module: "admin", codenames: ["view_auditlog"], requireAll: false }]),
    [hasPermission]
  );

  return {
    ready: isHydrated && authState.isAuthenticated && !!user,
    user,
    isAdmin,
    userDepartment,
    departmental: filteredDepartmentalLinks as SidebarItem[],
    modules: filteredModuleLinks as SidebarItem[],
    globalHub: groupedGlobalHubMenu,
    showGlobalHub: userHasGlobalHubAccess && groupedGlobalHubMenu.length > 0,
    canSeeAuditLog,
  };
}
