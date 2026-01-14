import { useState, useEffect } from "react";
import { User, Mail, Lock, Phone, FileText } from "lucide-react";
import Modal from "../ui/Modal";
import { Button, Input } from "../ui";

interface TrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TrainerFormData) => Promise<void>;
  trainer?: Trainer | null;
  isLoading?: boolean;
}

export interface TrainerFormData {
  name: string;
  email: string;
  password?: string;
  profile?: {
    phone?: string;
    bio?: string;
    specialization?: string;
  };
}

interface Trainer {
  _id: string;
  name: string;
  email: string;
  profile?: {
    phone?: string;
    bio?: string;
    specialization?: string;
    isActive?: boolean;
  };
}

export default function TrainerModal({
  isOpen,
  onClose,
  onSubmit,
  trainer,
  isLoading = false,
}: TrainerModalProps) {
  const [formData, setFormData] = useState<TrainerFormData>({
    name: "",
    email: "",
    password: "",
    profile: {
      phone: "",
      bio: "",
      specialization: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or trainer changes
  useEffect(() => {
    if (isOpen) {
      if (trainer) {
        // Editing existing trainer
        setFormData({
          name: trainer.name,
          email: trainer.email,
          password: "", // Don't populate password for security
          profile: {
            phone: trainer.profile?.phone || "",
            bio: trainer.profile?.bio || "",
            specialization: trainer.profile?.specialization || "",
          },
        });
      } else {
        // Creating new trainer
        setFormData({
          name: "",
          email: "",
          password: "",
          profile: {
            phone: "",
            bio: "",
            specialization: "",
          },
        });
      }
      setErrors({});
    }
  }, [isOpen, trainer]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password is required only when creating new trainer
    if (!trainer && !formData.password) {
      newErrors.password = "Password is required for new trainers";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      // Remove password from update if it's empty
      const submitData = { ...formData };
      if (trainer && !submitData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={trainer ? "Edit Trainer" : "Add New Trainer"}
      description={
        trainer
          ? "Update trainer information"
          : "Create a new trainer account"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#003300] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="John Doe"
            leftIcon={<User className="w-4 h-4" />}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#003300] mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="john.doe@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-[#003300] mb-1">
            Password {!trainer && <span className="text-red-500">*</span>}
            {trainer && (
              <span className="text-xs text-[#003300]/60 ml-1">
                (Leave empty to keep current password)
              </span>
            )}
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder={trainer ? "Enter new password" : "At least 6 characters"}
            leftIcon={<Lock className="w-4 h-4" />}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-[#003300] mb-1">
            Phone Number
          </label>
          <Input
            type="tel"
            value={formData.profile?.phone || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                profile: { ...formData.profile, phone: e.target.value },
              })
            }
            placeholder="+1 (555) 123-4567"
            leftIcon={<Phone className="w-4 h-4" />}
            disabled={isLoading}
          />
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-[#003300] mb-1">
            Specialization
          </label>
          <Input
            type="text"
            value={formData.profile?.specialization || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                profile: {
                  ...formData.profile,
                  specialization: e.target.value,
                },
              })
            }
            placeholder="e.g., Robotics, AI, Programming"
            leftIcon={<FileText className="w-4 h-4" />}
            disabled={isLoading}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-[#003300] mb-1">
            Bio
          </label>
          <textarea
            value={formData.profile?.bio || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                profile: { ...formData.profile, bio: e.target.value },
              })
            }
            placeholder="Brief description about the trainer..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] placeholder:text-[#003300]/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#003300]/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : trainer
              ? "Update Trainer"
              : "Create Trainer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
