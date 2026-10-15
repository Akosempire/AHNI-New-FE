/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import logoSvg from "@/assets/svgs/logo-bg.svg";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ArrowLeft, Menu, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  ShoppingCart,
  ClipboardList,
  BarChart,
  Settings,
  User,
  Bell,
  HelpCircle,
  MessageSquare,
  Briefcase
} from "lucide-react";
import { VendorAuthUtils, useVendorLogout } from "@/features/vendor-portal/controllers/vendorAuthController";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { logoutStateManager } from "@/utils/errorHandlers";

type VendorSidebarProps = {
  sidebarWidth: boolean;
  setSidebarWidth: (width: boolean) => void;
};

interface VendorSidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  subItems?: {
    name: string;
    href: string;
    description?: string;
  }[];
}

const vendorMenuItems: VendorSidebarItem[] = [
  {
    name: "Dashboard",
    href: "/vendor-portal/dashboard",
    icon: <BarChart className="w-5 h-5" />,
  },
  {
    name: "Available RFQs",
    href: "/vendor-portal/rfqs",
    icon: <FileText className="w-5 h-5" />,
    badge: "New",
  },
  {
    name: "My Submissions",
    href: "/vendor-portal/submissions",
    icon: <ClipboardList className="w-5 h-5" />,
    subItems: [
      { name: "All Submissions", href: "/vendor-portal/submissions", description: "View all bid submissions" },
      { name: "Available RFQs", href: "/vendor-portal/submissions/drafts", description: "New opportunities to bid on" },
    ],
  },
  {
    name: "Purchase Orders",
    href: "/vendor-portal/purchase-orders",
    icon: <ShoppingCart className="w-5 h-5" />,
    subItems: [
      { name: "Active Orders", href: "/vendor-portal/purchase-orders/active", description: "Current purchase orders" },
      { name: "Delivery Schedule", href: "/vendor-portal/purchase-orders/delivery", description: "Manage deliveries" },
      { name: "Order History", href: "/vendor-portal/purchase-orders/history", description: "Past orders" },
    ],
  },
  {
    name: "Service Orders",
    href: "/vendor-portal/service-orders",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    name: "Company Profile",
    href: "/vendor-portal/profile",
    icon: <Building2 className="w-5 h-5" />,
    subItems: [
      { name: "Basic Information", href: "/vendor-portal/profile/basic", description: "Company details" },
      { name: "Certifications", href: "/vendor-portal/profile/certifications", description: "Upload documents" },
      { name: "Categories", href: "/vendor-portal/profile/categories", description: "Service categories" },
      { name: "Bank Details", href: "/vendor-portal/profile/banking", description: "Payment information" },
    ],
  },
  {
    name: "Messages",
    href: "/vendor-portal/messages",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    name: "Support",
    href: "/vendor-portal/support",
    icon: <HelpCircle className="w-5 h-5" />,
    subItems: [
      { name: "Submit Ticket", href: "/vendor-portal/support/ticket", description: "Get technical help" },
      { name: "Knowledge Base", href: "/vendor-portal/support/kb", description: "Self-service articles" },
      { name: "Contact Procurement", href: "/vendor-portal/support/contact", description: "Direct procurement contact" },
    ],
  },
];

const VendorSidebar = ({ sidebarWidth, setSidebarWidth }: VendorSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Use the proper vendor logout hook with API call
  const { mutate: logout, isPending: isLoggingOut } = useVendorLogout();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = () => {
    // Set logout state to suppress authentication toasts
    logoutStateManager.setLoggingOut(true);

    logout(undefined, {
      onSuccess: () => {
        console.log('✅ Vendor logout successful');
        router.push('/vendor-portal/login');
      },
      onError: (error) => {
        console.error('❌ Vendor logout error:', error);
        // Still redirect even if API call fails
        router.push('/vendor-portal/login');
      },
      onSettled: () => {
        // Reset logout state after a delay to allow any pending requests to complete
        setTimeout(() => {
          logoutStateManager.setLoggingOut(false);
        }, 2000);
      }
    });
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (!isHydrated) {
    return <div className="w-full h-screen bg-white"></div>;
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out sticky top-0 z-40",
        sidebarWidth ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn("p-4 border-b border-gray-200", sidebarWidth ? "px-2" : "px-4")}>
        <div className="flex items-center justify-between">
          <Link href="/vendor-portal/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!sidebarWidth && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AHNI</h1>
                <p className="text-xs text-gray-500">Vendor Portal</p>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarWidth(!sidebarWidth)}
            className="p-1.5"
          >
            {sidebarWidth ? <Menu className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        <div className="space-y-1">
          {vendorMenuItems.map((item, index) => (
            <div key={index}>
              <div
                className={cn(
                  "group flex items-center justify-between mx-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer",
                  isActive(item.href)
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => {
                  if (item.subItems) {
                    setSelectedIndex(selectedIndex === index ? null : index);
                  } else {
                    router.push(item.href);
                  }
                }}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "mr-3 transition-colors",
                    isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                  )}>
                    {item.icon}
                  </div>
                  {!sidebarWidth && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {!sidebarWidth && (
                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.subItems && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          selectedIndex === index ? "rotate-180" : ""
                        )}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Submenu */}
              {item.subItems && selectedIndex === index && !sidebarWidth && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 mr-2 mt-1 space-y-1"
                >
                  {item.subItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.href}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md transition-colors",
                        isActive(subItem.href)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div>
                        <div className="font-medium">{subItem.name}</div>
                        {subItem.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {subItem.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {!sidebarWidth && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push('/vendor-portal/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

        {sidebarWidth && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-2"
              onClick={() => router.push('/vendor-portal/profile')}
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSidebar;