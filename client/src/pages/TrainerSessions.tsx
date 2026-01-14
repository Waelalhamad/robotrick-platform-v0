import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  AlertCircle,
  RefreshCw,
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

export default function TrainerSessions() {
  const navigate = useNavigate();
  const { sessions, isLoading, error, refetch, deleteSession } = useTrainerSessions();

  // Handle delete
  const handleDelete = async (sessionId: string, sessionTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${sessionTitle}"? This will permanently delete the session and all related records (attendance, evaluations, etc.). This action cannot be undone.`)) {
      return;
    }

    const success = await deleteSession(sessionId, true); // permanent delete
    if (success) {
      refetch(); // Refresh the list
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading sessions..." />;
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="error">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Failed to load sessions</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
          >
            Retry
          </Button>
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Training Sessions
          </h1>
          <p className="mt-2 text-white/60">Manage your training sessions and schedules</p>
        </div>
        <Link to="/trainer/sessions/new" className="group cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Session
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Sessions List */}
      {sessions.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="space-y-5"
        >
          {sessions.map((session, index) => (
            <motion.div
              key={session._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <Link to={`/trainer/sessions/${session._id}`} className="block">
                <CardComponent variant="glass" hover>
                  <CardBody>
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${session.groupId.color}33, ${session.groupId.color}11)`,
                          border: `1px solid ${session.groupId.color}44`
                        }}
                      >
                        <Calendar className="w-6 h-6" style={{ color: session.groupId.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-white">{session.title}</h3>
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "success"
                                : session.status === "in_progress"
                                ? "warning"
                                : session.status === "cancelled"
                                ? "error"
                                : "primary"
                            }
                            size="sm"
                          >
                            {session.status.replace("_", " ")}
                          </Badge>
                          {session.sessionNumber && (
                            <Badge variant="secondary" size="sm">
                              #{session.sessionNumber}
                            </Badge>
                          )}
                        </div>

                        {session.description && (
                          <p className="text-sm text-white/60 mb-3">{session.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.groupId.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(session.scheduledDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.startTime} - {session.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            Duration: {session.duration} mins
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/trainer/sessions/${session._id}/edit`);
                          }}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(session._id, session.title, e)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </CardComponent>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CardComponent variant="glass">
            <CardBody className="text-center py-20">
              {/* Animated Icon Container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-24 h-24 mx-auto mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center border border-primary/30">
                  <Calendar className="w-12 h-12 text-primary" />
                </div>
              </motion.div>

              {/* Message */}
              <h3 className="text-2xl font-bold text-white mb-3">
                No Sessions Yet
              </h3>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Get started by creating your first training session. Schedule classes, manage attendance, and track student progress.
              </p>

              {/* Action Button */}
              <Link to="/trainer/sessions/new" className="inline-block group cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden"
                >
                  <div className="relative px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex items-center gap-3">
                    <Plus className="w-5 h-5" />
                    Create First Session
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              </Link>
            </CardBody>
          </CardComponent>
        </motion.div>
      )}
    </motion.div>
  );
}
