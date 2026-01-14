import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Edit,
  Trash2,
} from "lucide-react";
import { useTrainerSessions } from "../hooks/useTrainerSessions";
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
} from "../components/ui";

export default function TrainerSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSessionById, deleteSession } = useTrainerSessions();

  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch session details
  const fetchSessionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!sessionId) {
        throw new Error("Session ID is required");
      }

      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch session data");
      console.error("Error fetching session data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  // Handle delete session
  const handleDeleteSession = async () => {
    if (!sessionId) return;
    if (!confirm("Are you sure you want to delete this session? This will permanently delete the session and all related records (attendance, evaluations, etc.). This action cannot be undone.")) return;

    try {
      setIsUpdating(true);
      const success = await deleteSession(sessionId, true); // permanent delete
      if (success) {
        navigate("/trainer/sessions");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete session");
    } finally {
      setIsUpdating(false);
    }
  };

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "primary";
      case "scheduled":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "primary";
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading session details..." />;
  }

  // Show error state
  if (error || !session) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load session</p>
              <p className="text-sm opacity-90">{error || "Session not found"}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchSessionData}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </div>
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
        <Link to="/trainer/sessions">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Sessions
          </Button>
        </Link>

        <div className="flex items-start justify-between mt-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{session.title}</h1>
              <Badge variant={getStatusColor(session.status) as any}>
                {session.status.replace("_", " ")}
              </Badge>
              <Badge variant="secondary" size="sm">
                {session.type}
              </Badge>
            </div>
            {session.description && (
              <p className="text-white/70 mt-2">{session.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            {session.status === "scheduled" && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Edit className="w-4 h-4" />}
                  onClick={() => navigate(`/trainer/sessions/${sessionId}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={handleDeleteSession}
                  disabled={isUpdating}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date & Time */}
        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-white/60 mb-1">Date & Time</p>
                <p className="font-medium">
                  {new Date(session.scheduledDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-white/80">
                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {session.duration} minutes
                </p>
              </div>
            </div>
          </CardBody>
        </CardComponent>

        {/* Group */}
        <CardComponent variant="glass" hover>
          <CardBody>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-white/60 mb-1">Group</p>
                <Link
                  to={`/trainer/groups/${session.groupId?._id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {session.groupId?.name || "Unknown"}
                </Link>
                <p className="text-sm text-white/80">
                  {session.groupId?.students?.length || 0} students
                </p>
              </div>
            </div>
          </CardBody>
        </CardComponent>

      </div>

      {/* Lesson Plan */}
      {session.lessonPlan && (
        <CardComponent variant="glass">
          <CardBody>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Lesson Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Learning Objectives */}
              {session.lessonPlan.objectives && session.lessonPlan.objectives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Learning Objectives</h3>
                  <ul className="space-y-2">
                    {session.lessonPlan.objectives.map((objective: string, idx: number) => (
                      <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Activities */}
              {session.lessonPlan.activities && session.lessonPlan.activities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Activities</h3>
                  <ul className="space-y-2">
                    {session.lessonPlan.activities.map((activity: string, idx: number) => (
                      <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              {session.lessonPlan.resources && session.lessonPlan.resources.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Resources/Materials</h3>
                  <ul className="space-y-2">
                    {session.lessonPlan.resources.map((resource: string, idx: number) => (
                      <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-secondary mt-1">•</span>
                        <span>{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardBody>
        </CardComponent>
      )}

      {/* Quick Actions */}
      <CardComponent variant="glass">
        <CardBody>
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={`/trainer/attendance?session=${sessionId}`}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cursor-pointer">
                <Button variant="outline" fullWidth className="justify-start cursor-pointer">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Take Attendance
                </Button>
              </motion.div>
            </Link>

            <Link to={`/trainer/session/${sessionId}/evaluations`}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cursor-pointer">
                <Button variant="outline" fullWidth className="justify-start cursor-pointer">
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Evaluations
                </Button>
              </motion.div>
            </Link>

            <Link to={`/trainer/groups/${session.groupId?._id}`}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cursor-pointer">
                <Button variant="outline" fullWidth className="justify-start cursor-pointer">
                  <Users className="w-5 h-5 mr-2" />
                  View Group
                </Button>
              </motion.div>
            </Link>
          </div>
        </CardBody>
      </CardComponent>

      {/* Status Info */}
      {session.status === "completed" && (
        <Alert variant="success">
          <CheckCircle className="w-5 h-5" />
          <span>This session has been completed</span>
        </Alert>
      )}

      {session.status === "cancelled" && (
        <Alert variant="error">
          <AlertCircle className="w-5 h-5" />
          <span>This session has been cancelled</span>
        </Alert>
      )}
    </motion.div>
  );
}
