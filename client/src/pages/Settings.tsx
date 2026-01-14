import { useState } from "react";
import { Settings as SettingsIcon, Bell, Lock, Palette, User, Download, Save, Shield } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { Tabs, Switch, SwitchGroup, Button, CardComponent, Badge, useToast, Input } from "../components/ui";
import { useTheme } from "../providers/ThemeProvider";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  projectUpdates: boolean;
  teamInvitations: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "team-only";
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowSearchEngines: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  // Settings states
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    projectUpdates: true,
    teamInvitations: true,
    systemAlerts: false,
    weeklyDigest: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "team-only",
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowSearchEngines: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success("Settings saved!", "Your preferences have been updated");
      setIsSaving(false);
    }, 1000);
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
  };

  const handleExportData = () => {
    const data = JSON.stringify(
      {
        profile: user,
        settings: { notifications, privacy, theme },
      },
      null,
      2
    );

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "robotrick-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Data exported!", "Your data has been downloaded");
  };

  const tabItems = [
    {
      label: "General",
      icon: <User className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#003300] mb-2">General Settings</h2>
            <p className="text-[#003300]/70">Basic application preferences and account information.</p>
          </div>

          <CardComponent variant="outlined">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#003300] flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Account Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-[#003300]/60">Name</span>
                  <p className="text-[#003300] font-medium">{user?.name || "User"}</p>
                </div>
                <div>
                  <span className="text-sm text-[#003300]/60">Email</span>
                  <p className="text-[#003300] font-medium">{user?.email || "user@example.com"}</p>
                </div>
                <div>
                  <span className="text-sm text-[#003300]/60">Role</span>
                  <Badge variant="primary">{user?.role || "User"}</Badge>
                </div>
                <div>
                  <span className="text-sm text-[#003300]/60">Member Since</span>
                  <p className="text-[#003300] font-medium">January 2024</p>
                </div>
              </div>
            </div>
          </CardComponent>

          <CardComponent variant="outlined">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#003300]">Language & Region</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Language"
                  defaultValue="English"
                  disabled
                  helperText="Language selection coming soon"
                />
                <Input
                  label="Timezone"
                  defaultValue="Damascus (UTC+3)"
                  disabled
                  helperText="Timezone selection coming soon"
                />
              </div>
            </div>
          </CardComponent>
        </div>
      ),
    },
    {
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#003300] mb-2">Notification Settings</h2>
            <p className="text-[#003300]/70">Control when and how you receive notifications.</p>
          </div>

          <SwitchGroup title="Communication Preferences" description="Manage how we contact you">
            <Switch
              checked={notifications.emailNotifications}
              onChange={() => handleNotificationChange('emailNotifications')}
              label="Email Notifications"
              description="Receive updates via email"
            />
            <Switch
              checked={notifications.pushNotifications}
              onChange={() => handleNotificationChange('pushNotifications')}
              label="Push Notifications"
              description="Get push notifications in your browser"
            />
            <Switch
              checked={notifications.weeklyDigest}
              onChange={() => handleNotificationChange('weeklyDigest')}
              label="Weekly Digest"
              description="Receive a weekly summary email"
            />
          </SwitchGroup>

          <SwitchGroup title="Activity Notifications" description="Get notified about important events">
            <Switch
              checked={notifications.orderUpdates}
              onChange={() => handleNotificationChange('orderUpdates')}
              label="Order Updates"
              description="Status changes on your orders"
            />
            <Switch
              checked={notifications.projectUpdates}
              onChange={() => handleNotificationChange('projectUpdates')}
              label="Project Updates"
              description="Changes to your projects"
            />
            <Switch
              checked={notifications.teamInvitations}
              onChange={() => handleNotificationChange('teamInvitations')}
              label="Team Invitations"
              description="When someone invites you to a team"
            />
            <Switch
              checked={notifications.systemAlerts}
              onChange={() => handleNotificationChange('systemAlerts')}
              label="System Alerts"
              description="Important system notifications"
            />
          </SwitchGroup>
        </div>
      ),
    },
    {
      label: "Privacy",
      icon: <Lock className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#003300] mb-2">Privacy Settings</h2>
            <p className="text-[#003300]/70">Control your privacy and data sharing preferences.</p>
          </div>

          <SwitchGroup title="Profile Visibility" description="Control who can see your information">
            <Switch
              checked={privacy.showEmail}
              onChange={() => handlePrivacyChange('showEmail')}
              label="Show Email"
              description="Display email on your public profile"
            />
            <Switch
              checked={privacy.showPhone}
              onChange={() => handlePrivacyChange('showPhone')}
              label="Show Phone"
              description="Display phone number on profile"
            />
            <Switch
              checked={privacy.showLocation}
              onChange={() => handlePrivacyChange('showLocation')}
              label="Show Location"
              description="Display your location"
            />
            <Switch
              checked={privacy.allowSearchEngines}
              onChange={() => handlePrivacyChange('allowSearchEngines')}
              label="Allow Search Engines"
              description="Let search engines index your profile"
            />
          </SwitchGroup>
        </div>
      ),
    },
    {
      label: "Appearance",
      icon: <Palette className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#003300] mb-2">Appearance Settings</h2>
            <p className="text-[#003300]/70">The application is currently set to light mode only.</p>
          </div>

          <CardComponent variant="outlined">
            <div className="p-6 bg-cyan-50 border border-cyan-200 rounded-xl">
              <h3 className="text-lg font-semibold text-cyan-900 mb-2">Light Mode Enabled</h3>
              <p className="text-sm text-cyan-700">
                The application uses a consistent light mode design with brand colors for the best user experience.
              </p>
            </div>
          </CardComponent>
        </div>
      ),
    },
    {
      label: "Security",
      icon: <Shield className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#003300] mb-2">Security Settings</h2>
            <p className="text-[#003300]/70">Manage your account security and data.</p>
          </div>

          <CardComponent variant="outlined">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#003300]">Data Management</h3>
              <p className="text-sm text-[#003300]/70">
                Export or delete your account data
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={handleExportData}
                >
                  Export Data
                </Button>
                <Button
                  variant="danger"
                  onClick={() => toast.warning("Feature coming soon", "Account deletion will be available soon")}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardComponent>

          <CardComponent variant="outlined">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#003300]">Password</h3>
              <p className="text-sm text-[#003300]/70">
                Change your password to keep your account secure
              </p>
              <Button
                variant="secondary"
                onClick={() => toast.info("Feature coming soon", "Password change will be available soon")}
              >
                Change Password
              </Button>
            </div>
          </CardComponent>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#ffffcc] via-white to-[#f5f5dc] rounded-2xl p-8 border border-primary/20">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-[#004d00]/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
            <SettingsIcon className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#003300] mb-2">Settings</h1>
            <p className="text-[#003300]/70 text-lg">
              Customize your Robotrick experience
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <CardComponent>
        <Tabs variant="pills" items={tabItems} />
      </CardComponent>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Save className="w-5 h-5" />}
          onClick={handleSaveSettings}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
