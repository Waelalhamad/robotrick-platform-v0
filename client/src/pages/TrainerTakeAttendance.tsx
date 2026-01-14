import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Save,
  ArrowLeft,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { api } from "../lib/api";
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
} from "../components/ui";

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface AttendanceRecord {
  student: string;
  status: "present" | "absent" | "late" | "excused";
  checkInTime?: string;
  notes?: string;
}

export default function TrainerTakeAttendance() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session");
  const groupId = searchParams.get("group");

  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session and students data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!sessionId && !groupId) {
          throw new Error("Session ID or Group ID is required");
        }

        let fetchedStudents: Student[] = [];

        // Fetch session info if sessionId provided
        if (sessionId) {
          const sessionRes = await api.get(`/trainer/sessions/${sessionId}`);
          setSessionInfo(sessionRes.data.data);

          // Fetch students from session's group
          const studentsRes = await api.get(
            `/trainer/groups/${sessionRes.data.data.groupId._id}/students`
          );
          fetchedStudents = studentsRes.data.data || [];
          setStudents(fetchedStudents);
        } else if (groupId) {
          // Fetch students directly from group
          const studentsRes = await api.get(`/trainer/groups/${groupId}/students`);
          fetchedStudents = studentsRes.data.data || [];
          setStudents(fetchedStudents);
        }

        // Check if attendance already exists for this session
        let existingAttendance = null;
        if (sessionId) {
          try {
            const attendanceRes = await api.get(`/trainer/attendance/session/${sessionId}`);
            existingAttendance = attendanceRes.data.data;
          } catch (err) {
            // No existing attendance, will create new
            console.log('No existing attendance found, creating new');
          }
        }

        // Initialize attendance map
        const initialAttendance = new Map();
        fetchedStudents.forEach((student: Student) => {
          // Check if this student has existing attendance record
          const existingRecord = existingAttendance?.records?.find(
            (r: any) => r.student._id === student._id || r.student === student._id
          );

          initialAttendance.set(student._id, {
            student: student._id,
            status: existingRecord?.status || "present",
            checkInTime: existingRecord?.checkInTime,
            notes: existingRecord?.notes,
          });
        });
        setAttendance(initialAttendance);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId, groupId]);

  // Update attendance status for a student
  const updateStatus = (studentId: string, status: AttendanceRecord["status"]) => {
    const newAttendance = new Map(attendance);
    const record = newAttendance.get(studentId) || { student: studentId, status: "present" };
    record.status = status;
    if (status === "present" || status === "late") {
      record.checkInTime = new Date().toISOString();
    }
    newAttendance.set(studentId, record);
    setAttendance(newAttendance);
  };

  // Save attendance
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const attendanceRecords = Array.from(attendance.values());

      // Save attendance via API
      await api.post(`/trainer/attendance`, {
        sessionId: sessionId || undefined,
        groupId: groupId || undefined,
        date: new Date().toISOString(),
        records: attendanceRecords,
      });

      alert("Attendance saved successfully!");
      navigate(-1); // Go back
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save attendance");
      console.error("Error saving attendance:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-400";
      case "late":
        return "text-yellow-400";
      case "excused":
        return "text-blue-400";
      case "absent":
        return "text-red-400";
      default:
        return "text-white/60";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5" />;
      case "late":
        return <Clock className="w-5 h-5" />;
      case "excused":
        return <AlertTriangle className="w-5 h-5" />;
      case "absent":
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading students..." />;
  }

  // Show error state
  if (error && students.length === 0) {
    return (
      <Alert variant="error">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Failed to load data</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      </Alert>
    );
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
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <div className="mt-4">
          <h1 className="text-3xl font-bold">Take Attendance</h1>
          {sessionInfo && (
            <div className="flex items-center gap-4 mt-2 text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {sessionInfo.title}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {sessionInfo.groupId.name}
              </span>
              <span>
                {new Date(sessionInfo.scheduledDate).toLocaleDateString()} {sessionInfo.startTime}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["present", "late", "absent", "excused"].map((status) => {
          const count = Array.from(attendance.values()).filter((r) => r.status === status).length;
          return (
            <CardComponent key={status} variant="glass">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 capitalize">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className={getStatusColor(status)}>{getStatusIcon(status)}</div>
                </div>
              </CardBody>
            </CardComponent>
          );
        })}
      </div>

      {/* Students List */}
      <CardComponent variant="glass">
        <CardBody>
          <h2 className="text-xl font-semibold mb-6">
            Mark Attendance ({students.length} students)
          </h2>

          <div className="space-y-3">
            {students.map((student, index) => {
              const record = attendance.get(student._id);
              const status = record?.status || "present";

              return (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-white/60">{student.email}</p>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant={status === "present" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(student._id, "present")}
                      className={status === "present" ? "" : ""}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      variant={status === "late" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(student._id, "late")}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Late
                    </Button>
                    <Button
                      variant={status === "absent" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(student._id, "absent")}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Absent
                    </Button>
                    <Button
                      variant={status === "excused" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(student._id, "excused")}
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Excused
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardBody>
      </CardComponent>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          leftIcon={<Save className="w-5 h-5" />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Attendance"}
        </Button>
      </div>

      {error && (
        <Alert variant="error">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </Alert>
      )}
    </motion.div>
  );
}
