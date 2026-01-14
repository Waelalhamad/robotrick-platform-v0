import { useState } from "react";
import { User as UserIcon, Mail, Lock, Globe, MapPin, Phone, Save, Camera } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import {
  Tabs,
  Input,
  Button,
  CardComponent,
  Avatar,
  Badge,
  useToast,
  Alert
} from "../components/ui";

interface ProfileFormData {
  name: string;
  username: string;
  bio: string;
  phone: string;
  location: string;
  website: string;
}

interface EmailFormData {
  currentEmail: string;
  newEmail: string;
  confirmEmail: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();

  // Form states
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user?.name || "",
    username: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
  });

  const [emailData, setEmailData] = useState<EmailFormData>({
    currentEmail: user?.email || "",
    newEmail: "",
    confirmEmail: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Error states
  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setIsUpdatingProfile(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Profile updated!", "Your profile has been updated successfully");
      setIsUpdatingProfile(false);
    }, 1500);
  };

  // Handle email form submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (emailData.newEmail !== emailData.confirmEmail) {
      setEmailError("New email addresses do not match");
      return;
    }

    setIsUpdatingEmail(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Email updated!", "Your email has been updated successfully");
      setIsUpdatingEmail(false);
      setEmailData(prev => ({ ...prev, newEmail: "", confirmEmail: "" }));
    }, 1500);
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Password updated!", "Your password has been changed successfully");
      setIsUpdatingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }, 1500);
  };

  const tabItems = [
    {
      label: "Profile",
      icon: <UserIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 bg-[#f9fafb] border border-primary/10 rounded-xl">
            <div className="relative">
              <Avatar
                name={user?.name || "User"}
                size="2xl"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-primary to-[#004d00] rounded-full hover:shadow-lg transition-all shadow-md">
                <Camera className="w-4 h-4 text-[#ffffcc]" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#003300] mb-1">{user?.name || "User"}</h3>
              <p className="text-[#003300]/60 mb-2">{user?.email}</p>
              <Badge variant="primary">{user?.role || "User"}</Badge>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileError && (
              <Alert variant="error" onClose={() => setProfileError(null)}>
                {profileError}
              </Alert>
            )}

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              leftIcon={<UserIcon className="w-4 h-4" />}
              required
            />

            <Input
              label="Username"
              placeholder="Choose a username"
              value={profileData.username}
              onChange={(e) =>
                setProfileData({ ...profileData, username: e.target.value })
              }
              leftIcon={<UserIcon className="w-4 h-4" />}
              helperText="This will be your public display name"
            />

            <div>
              <label className="block text-sm font-medium text-[#003300] mb-2">
                Bio
              </label>
              <textarea
                className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-[#003300] placeholder:text-[#003300]/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 min-h-[100px]"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Location"
                placeholder="City, Country"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Website"
              type="url"
              placeholder="https://yourwebsite.com"
              value={profileData.website}
              onChange={(e) =>
                setProfileData({ ...profileData, website: e.target.value })
              }
              leftIcon={<Globe className="w-4 h-4" />}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                leftIcon={<Save className="w-5 h-5" />}
                isLoading={isUpdatingProfile}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      ),
    },
    {
      label: "Email",
      icon: <Mail className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-cyan-50 border border-cyan-200 rounded-xl">
            <h3 className="text-lg font-semibold text-cyan-900 mb-2">Change Email Address</h3>
            <p className="text-sm text-cyan-700">
              You'll need to verify your new email address before the change takes effect.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {emailError && (
              <Alert variant="error" onClose={() => setEmailError(null)}>
                {emailError}
              </Alert>
            )}

            <Input
              label="Current Email"
              type="email"
              value={emailData.currentEmail}
              leftIcon={<Mail className="w-4 h-4" />}
              disabled
            />

            <Input
              label="New Email"
              type="email"
              placeholder="Enter new email address"
              value={emailData.newEmail}
              onChange={(e) =>
                setEmailData({ ...emailData, newEmail: e.target.value })
              }
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm New Email"
              type="email"
              placeholder="Confirm new email address"
              value={emailData.confirmEmail}
              onChange={(e) =>
                setEmailData({ ...emailData, confirmEmail: e.target.value })
              }
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                leftIcon={<Save className="w-5 h-5" />}
                isLoading={isUpdatingEmail}
              >
                Update Email
              </Button>
            </div>
          </form>
        </div>
      ),
    },
    {
      label: "Password",
      icon: <Lock className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Change Password</h3>
            <p className="text-sm text-yellow-700">
              Make sure your new password is at least 6 characters long and includes a mix of letters and numbers.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <Alert variant="error" onClose={() => setPasswordError(null)}>
                {passwordError}
              </Alert>
            )}

            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              leftIcon={<Lock className="w-4 h-4" />}
              helperText="At least 6 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                leftIcon={<Save className="w-5 h-5" />}
                isLoading={isUpdatingPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
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
            <UserIcon className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#003300] mb-2">My Profile</h1>
            <p className="text-[#003300]/70 text-lg">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <CardComponent>
        <Tabs variant="pills" items={tabItems} />
      </CardComponent>
    </div>
  );
}
