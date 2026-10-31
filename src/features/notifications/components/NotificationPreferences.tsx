"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Card from "@/components/Card";
import { CheckCircle, AlertCircle, Loader2, Bell, Clock, Tag } from 'lucide-react';
import { Icon } from "@iconify/react";
import { toast } from "sonner";

// Simple Switch component since the UI one might not be available
const Switch = ({ checked, onCheckedChange, disabled = false, id }: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  </label>
);

// Simple Label component
const Label = ({ children, htmlFor, className = "" }: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none ${className}`}>
    {children}
  </label>
);

// Simple Separator component
const Separator = ({ className = "" }: { className?: string }) => (
  <hr className={`border-gray-200 ${className}`} />
);

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  browser_notifications: boolean;
  desktop_notifications: boolean;
  digest_frequency: "instant" | "hourly" | "daily" | "weekly" | "never";
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  categories: {
    info: boolean;
    success: boolean;
    warning: boolean;
    error: boolean;
    system: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  modules: {
    [key: string]: boolean;
  };
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    browser_notifications: true,
    desktop_notifications: false,
    digest_frequency: "instant",
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
    categories: {
      info: true,
      success: true,
      warning: true,
      error: true,
      system: true,
    },
    priorities: {
      low: true,
      medium: true,
      high: true,
      urgent: true,
    },
    modules: {},
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Check browser notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted");
    }
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === "granted");
      if (permission === "granted") {
        toast.success("Browser notifications enabled");
      } else {
        toast.error("Browser notifications denied");
        setPreferences(prev => ({ ...prev, browser_notifications: false }));
      }
    }
  };

  // Load preferences from localStorage (in a real app, this would come from API)
  useEffect(() => {
    const savedPreferences = localStorage.getItem("notification_preferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would be an API call
      localStorage.setItem("notification_preferences", JSON.stringify(preferences));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Notification preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = (category: keyof NotificationPreferences["categories"], enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: enabled
      }
    }));
  };

  const handlePriorityChange = (priority: keyof NotificationPreferences["priorities"], enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: enabled
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-gray-600">Customize how and when you receive notifications</p>
        </div>
        <Button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Icon icon={isSaving ? "eos-icons:loading" : "mdi:check"} />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Delivery Methods */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell size={16} />
            Delivery Methods
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email Notifications</Label>
              <Switch
                id="email"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, email_notifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="push">Push Notifications</Label>
              <Switch
                id="push"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, push_notifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser">Browser Notifications</Label>
                {!hasPermission && (
                  <p className="text-xs text-gray-500">Permission required</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!hasPermission && preferences.browser_notifications && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={requestNotificationPermission}
                  >
                    Allow
                  </Button>
                )}
                <Switch
                  id="browser"
                  checked={preferences.browser_notifications}
                  onCheckedChange={(checked) => {
                    if (checked && !hasPermission) {
                      requestNotificationPermission();
                    } else {
                      setPreferences(prev => ({ ...prev, browser_notifications: checked }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="desktop">Desktop Notifications</Label>
              <Switch
                id="desktop"
                checked={preferences.desktop_notifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, desktop_notifications: checked }))
                }
              />
            </div>
          </div>
        </Card>

        {/* Digest & Timing */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} />
            Timing & Frequency
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Digest Frequency</Label>
              <Select 
                value={preferences.digest_frequency} 
                onValueChange={(value: any) => 
                  setPreferences(prev => ({ ...prev, digest_frequency: value }))
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="quiet">Enable Quiet Hours</Label>
              <Switch
                id="quiet"
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, quiet_hours_enabled: checked }))
                }
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start Time</Label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => 
                      setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value }))
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-sm">End Time</Label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => 
                      setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value }))
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag size={16} />
            Categories
          </h3>
          
          <div className="space-y-3">
            {Object.entries(preferences.categories).map(([category, enabled]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon 
                    icon={
                      category === 'error' ? 'mdi:alert-circle' :
                      category === 'warning' ? 'mdi:alert' :
                      category === 'success' ? 'mdi:check-circle' :
                      category === 'system' ? 'mdi:cog' : 'mdi:information'
                    }
                    className={`w-4 h-4 ${
                      category === 'error' ? 'text-red-500' :
                      category === 'warning' ? 'text-yellow-500' :
                      category === 'success' ? 'text-green-500' :
                      category === 'system' ? 'text-purple-500' : 'text-blue-500'
                    }`}
                  />
                  <Label>{category.charAt(0).toUpperCase() + category.slice(1)}</Label>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category as keyof NotificationPreferences["categories"], checked)
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Priorities */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Flag size={16} />
            Priorities
          </h3>
          
          <div className="space-y-3">
            {Object.entries(preferences.priorities).map(([priority, enabled]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    priority === 'urgent' ? 'bg-red-500' :
                    priority === 'high' ? 'bg-orange-500' :
                    priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <Label>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Label>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => 
                    handlePriorityChange(priority as keyof NotificationPreferences["priorities"], checked)
                  }
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}