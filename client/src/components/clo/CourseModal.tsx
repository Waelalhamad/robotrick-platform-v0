import { useState, useEffect } from "react";
import { BookOpen, FileText, Tag, BarChart3, Clock, DollarSign } from "lucide-react";
import Modal from "../ui/Modal";
import { Button, Input } from "../ui";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
  course?: Course | null;
  isLoading?: boolean;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  price: number;
  objectives?: string[];
  prerequisites?: string[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  price: number;
  objectives?: string[];
  prerequisites?: string[];
  status?: string;
}

export default function CourseModal({
  isOpen,
  onClose,
  onSubmit,
  course,
  isLoading = false,
}: CourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    duration: 0,
    price: 0,
    objectives: [],
    prerequisites: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or course changes
  useEffect(() => {
    if (isOpen) {
      if (course) {
        // Editing existing course
        setFormData({
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level || "beginner",
          duration: course.duration || 0,
          price: course.price || 0,
          objectives: course.objectives || [],
          prerequisites: course.prerequisites || [],
        });
      } else {
        // Creating new course
        setFormData({
          title: "",
          description: "",
          category: "",
          level: "beginner",
          duration: 0,
          price: 0,
          objectives: [],
          prerequisites: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, course]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (formData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? "Edit Course" : "Create New Course"}
      description={
        course ? "Update course information" : "Add a new course to the system"
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Introduction to Robotics"
              leftIcon={<BookOpen className="w-4 h-4" />}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="e.g., Robotics, AI, Programming"
              leftIcon={<Tag className="w-4 h-4" />}
              disabled={isLoading}
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Level <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#003300]/40" />
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="w-full pl-10 px-4 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                disabled={isLoading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Duration (hours) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: parseInt(e.target.value) || 0,
                })
              }
              placeholder="40"
              min="0"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={isLoading}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="299.99"
              min="0"
              step="0.01"
              leftIcon={<DollarSign className="w-4 h-4" />}
              disabled={isLoading}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#003300] mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide a detailed description of the course..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-[#003300]/20 bg-white text-[#003300] placeholder:text-[#003300]/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
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
              : course
              ? "Update Course"
              : "Create Course"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
