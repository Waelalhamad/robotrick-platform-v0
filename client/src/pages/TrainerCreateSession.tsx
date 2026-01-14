import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { useTrainerGroups } from "../hooks/useTrainerGroups";
import { useTrainerSessions } from "../hooks/useTrainerSessions";
import {
  CardComponent,
  CardBody,
  Button,
  Input,
  LoadingState,
  Alert,
} from "../components/ui";

export default function TrainerCreateSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedGroupId = searchParams.get("groupId");

  const { groups, isLoading: isLoadingGroups } = useTrainerGroups({ status: "active" });
  const { createSession } = useTrainerSessions();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    groupId: preSelectedGroupId || "",
  });

  // Update selected group when groupId changes
  useEffect(() => {
    if (formData.groupId) {
      const group = groups.find(g => g._id === formData.groupId);
      setSelectedGroup(group || null);
    } else {
      setSelectedGroup(null);
    }
  }, [formData.groupId, groups]);

  const [objectives, setObjectives] = useState<string[]>([""]);
  const [materialsNeeded, setMaterialsNeeded] = useState<string[]>([""]);

  // Handle form input changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Add objective
  const addObjective = () => {
    setObjectives([...objectives, ""]);
  };

  // Remove objective
  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  // Update objective
  const updateObjective = (index: number, value: string) => {
    const updated = [...objectives];
    updated[index] = value;
    setObjectives(updated);
  };

  // Add material
  const addMaterial = () => {
    setMaterialsNeeded([...materialsNeeded, ""]);
  };

  // Remove material
  const removeMaterial = (index: number) => {
    setMaterialsNeeded(materialsNeeded.filter((_, i) => i !== index));
  };

  // Update material
  const updateMaterial = (index: number, value: string) => {
    const updated = [...materialsNeeded];
    updated[index] = value;
    setMaterialsNeeded(updated);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError("Session title is required");
      return;
    }

    if (!formData.groupId) {
      setError("Please select a group");
      return;
    }

    try {
      setIsSaving(true);

      const sessionData = {
        ...formData,
        lessonPlan: {
          objectives: objectives.filter((o) => o.trim()),
          materialsNeeded: materialsNeeded.filter((m) => m.trim()),
        },
      };

      const newSession = await createSession(sessionData);

      if (newSession) {
        // Navigate to sessions list
        navigate("/trainer/sessions");
      } else {
        setError("Failed to create session. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create session");
      console.error("Error creating session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (isLoadingGroups) {
    return <LoadingState type="skeleton" text="Loading groups..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/trainer/sessions")}
        >
          Back to Sessions
        </Button>

        <div className="mt-4">
          <h1 className="text-3xl font-bold">Create New Session</h1>
          <p className="mt-2 text-white/60">
            Schedule a new training session for your group
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <CardComponent variant="glass">
            <CardBody>
              <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

              <div className="space-y-4">
                {/* Session Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Session Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Introduction to Robotics Programming"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Brief description of this session..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    rows={3}
                  />
                </div>

                {/* Group Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Group <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => handleChange("groupId", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  >
                    <option value="" className="bg-zinc-900">
                      Select a group...
                    </option>
                    {groups.map((group) => (
                      <option
                        key={group._id}
                        value={group._id}
                        className="bg-zinc-900"
                      >
                        {group.name} ({group.students.length} students)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-Schedule Info */}
                {selectedGroup && selectedGroup.schedule && selectedGroup.schedule.length > 0 && (
                  <Alert variant="info">
                    <div className="space-y-2">
                      <p className="font-medium">📅 Automatic Scheduling Enabled</p>
                      <p className="text-sm text-white/70">
                        This session will be automatically scheduled based on the group's weekly plan:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedGroup.schedule.map((sched: any, idx: number) => (
                          <div
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs"
                          >
                            <span className="font-medium">{sched.day}</span>
                            <span className="text-white/60 ml-1">
                              {sched.startTime} - {sched.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-white/50 mt-2">
                        The date and time will be automatically assigned based on existing sessions for this group.
                      </p>
                    </div>
                  </Alert>
                )}

              </div>
            </CardBody>
          </CardComponent>

          {/* Lesson Plan (Optional) */}
          <CardComponent variant="glass">
            <CardBody>
              <h2 className="text-xl font-semibold mb-6">
                Lesson Plan <span className="text-sm text-white/40 font-normal">(Optional)</span>
              </h2>

              <div className="space-y-6">
                {/* Learning Objectives */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Learning Objectives</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={addObjective}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {objectives.map((objective, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={objective}
                          onChange={(e) => updateObjective(index, e.target.value)}
                          placeholder={`Objective ${index + 1}`}
                        />
                        {objectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeObjective(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials Needed */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Materials Needed</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={addMaterial}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {materialsNeeded.map((material, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={material}
                          onChange={(e) => updateMaterial(index, e.target.value)}
                          placeholder={`Material ${index + 1}`}
                        />
                        {materialsNeeded.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMaterial(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </CardComponent>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/trainer/sessions")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Save className="w-5 h-5" />}
              disabled={isSaving}
            >
              {isSaving ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
