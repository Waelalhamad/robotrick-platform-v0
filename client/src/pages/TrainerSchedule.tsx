/**
 * TrainerSchedule Page
 *
 * Interactive calendar view for managing trainer sessions.
 * Features:
 * - Day/Week/Month views
 * - Color-coded sessions by group
 * - Session detail modal
 * - Quick actions (create, edit, delete)
 * - Filter by group and status
 *
 * @page TrainerSchedule
 * @version 1.0.0
 */

import { useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Video,
  Edit,
  Trash2,
  Play,
  Square,
  X,
  AlertCircle
} from 'lucide-react';
import { useTrainerSessions, useTrainerGroups } from '../hooks';
import {
  Button,
  Badge,
  CardComponent,
  CardBody,
  LoadingState,
  Alert
} from '../components/ui';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './TrainerSchedule.css'; // Custom styles for calendar

// Setup moment localizer for calendar
const localizer = momentLocalizer(moment);

/**
 * Session detail modal component
 */
interface SessionDetailModalProps {
  session: any;
  onClose: () => void;
  onEdit: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onStart: (sessionId: string) => void;
  onEnd: (sessionId: string) => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  onEdit,
  onDelete,
  onStart,
  onEnd
}) => {
  if (!session) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'scheduled': return 'warning';
      case 'cancelled': return 'error';
      default: return 'primary';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardComponent variant="glass">
          <CardBody>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{session.title}</h2>
                  <Badge variant={getStatusColor(session.status) as any}>
                    {session.status}
                  </Badge>
                </div>
                {session.description && (
                  <p className="text-white/60">{session.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Session Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Date & Time */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <CalendarIcon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-white/60 mb-1">Date & Time</p>
                  <p className="font-medium">
                    {moment(session.scheduledDate).format('MMM DD, YYYY')}
                  </p>
                  <p className="text-sm text-white/80">
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    {session.duration} minutes
                  </p>
                </div>
              </div>

              {/* Group */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <Users className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-white/60 mb-1">Group</p>
                  <p className="font-medium">{session.groupId?.name || 'Unknown'}</p>
                  <p className="text-sm text-white/80">
                    {session.studentsCount || 0} students
                  </p>
                </div>
              </div>

              {/* Location */}
              {(session.location || session.isOnline) && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  {session.isOnline ? (
                    <Video className="w-5 h-5 text-secondary mt-0.5" />
                  ) : (
                    <MapPin className="w-5 h-5 text-green-400 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-white/60 mb-1">Location</p>
                    {session.isOnline ? (
                      <>
                        <p className="font-medium">Online Session</p>
                        {session.meetingLink && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Join Meeting
                          </a>
                        )}
                      </>
                    ) : (
                      <p className="font-medium">{session.location}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Type */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white/60 mb-1">Type</p>
                  <p className="font-medium capitalize">{session.type}</p>
                  {session.sessionNumber && (
                    <p className="text-sm text-white/60">
                      Session #{session.sessionNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Lesson Plan Preview */}
            {session.lessonPlan && session.lessonPlan.objectives && session.lessonPlan.objectives.length > 0 && (
              <div className="mb-6 p-4 rounded-lg bg-white/5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>Learning Objectives</span>
                </h3>
                <ul className="space-y-2">
                  {session.lessonPlan.objectives.slice(0, 3).map((objective: string, idx: number) => (
                    <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                  {session.lessonPlan.objectives.length > 3 && (
                    <li className="text-sm text-white/60">
                      +{session.lessonPlan.objectives.length - 3} more objectives
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              {/* Status-specific actions */}
              {session.status === 'scheduled' && (
                <>
                  <Button
                    variant="primary"
                    leftIcon={<Play className="w-4 h-4" />}
                    onClick={() => onStart(session._id)}
                  >
                    Start Session
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Edit className="w-4 h-4" />}
                    onClick={() => onEdit(session._id)}
                  >
                    Edit
                  </Button>
                </>
              )}

              {session.status === 'in_progress' && (
                <Button
                  variant="primary"
                  leftIcon={<Square className="w-4 h-4" />}
                  onClick={() => onEnd(session._id)}
                >
                  End Session
                </Button>
              )}

              {session.status === 'completed' && (
                <div className="flex items-center gap-2 text-green-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Session completed</span>
                </div>
              )}

              {/* Delete button (always visible for non-completed) */}
              {session.status !== 'completed' && (
                <Button
                  variant="ghost"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => onDelete(session._id)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardBody>
        </CardComponent>
      </motion.div>
    </motion.div>
  );
};

/**
 * Main TrainerSchedule component
 */
export default function TrainerSchedule() {
  // State
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Hooks
  const { groups } = useTrainerGroups({ status: 'active' });
  const {
    sessions,
    isLoading,
    error,
    refetch,
    startSession,
    endSession,
    deleteSession
  } = useTrainerSessions({
    groupId: selectedGroup || undefined,
    status: selectedStatus as any || undefined
  });

  /**
   * Format sessions for calendar display
   */
  const calendarEvents = useMemo(() => {
    return sessions.map(session => {
      const start = new Date(session.scheduledDate);
      const [startHours, startMinutes] = session.startTime.split(':').map(Number);
      start.setHours(startHours, startMinutes, 0, 0);

      const end = new Date(session.scheduledDate);
      const [endHours, endMinutes] = session.endTime.split(':').map(Number);
      end.setHours(endHours, endMinutes, 0, 0);

      return {
        id: session._id,
        title: session.title,
        start,
        end,
        resource: session,
        // Custom styling based on group color and status
        style: {
          backgroundColor: session.groupId?.color || '#30c59b',
          opacity: session.status === 'cancelled' ? 0.5 : 1
        }
      };
    });
  }, [sessions]);

  /**
   * Handle event selection
   */
  const handleSelectEvent = useCallback((event: any) => {
    setSelectedSession(event.resource);
  }, []);

  /**
   * Handle navigation
   */
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  /**
   * Handle view change
   */
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  /**
   * Handle session actions
   */
  const handleStartSession = async (sessionId: string) => {
    const success = await startSession(sessionId);
    if (success) {
      setSelectedSession(null);
      refetch();
    }
  };

  const handleEndSession = async (sessionId: string) => {
    const success = await endSession(sessionId);
    if (success) {
      setSelectedSession(null);
      refetch();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;

    const success = await deleteSession(sessionId, false, 'Cancelled by trainer');
    if (success) {
      setSelectedSession(null);
      refetch();
    }
  };

  const handleEditSession = (sessionId: string) => {
    // Navigate to edit page (will be implemented in next phase)
    console.log('Edit session:', sessionId);
    setSelectedSession(null);
  };

  /**
   * Custom calendar toolbar
   */
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('PREV')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 text-white/80" />
          </button>
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 font-semibold text-sm hover:from-primary/30 hover:to-accent/30 transition-all duration-300 hover:scale-105"
          >
            Today
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Date Label */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          {label}
        </h2>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 hover:border-primary/50 transition-all duration-300 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm w-fit">
        {['month', 'week', 'day'].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-6 py-2.5 text-sm font-semibold transition-all duration-300 relative ${
              view === v
                ? 'text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {view === v && (
              <motion.div
                layoutId="activeView"
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 uppercase tracking-wide">
              {v}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return <LoadingState type="spinner" text="Loading schedule..." />;
  }

  // Error state
  if (error) {
    return (
      <Alert variant="error">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Failed to load schedule</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            My Schedule
          </h1>
          <p className="mt-2 text-white/60">
            Manage your teaching sessions and calendar
          </p>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <CardComponent variant="glass">
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Filter Options
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedGroup('');
                      setSelectedStatus('');
                    }}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Group Filter */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      Filter by Group
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm hover:bg-white/10"
                    >
                      <option value="" className="bg-zinc-900">All Groups</option>
                      {groups.map(group => (
                        <option key={group._id} value={group._id} className="bg-zinc-900">
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-secondary" />
                      Filter by Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm hover:bg-white/10"
                    >
                      <option value="" className="bg-zinc-900">All Statuses</option>
                      <option value="scheduled" className="bg-zinc-900">📅 Scheduled</option>
                      <option value="in_progress" className="bg-zinc-900">▶️ In Progress</option>
                      <option value="completed" className="bg-zinc-900">✅ Completed</option>
                      <option value="cancelled" className="bg-zinc-900">❌ Cancelled</option>
                    </select>
                  </div>
                </div>
              </CardBody>
            </CardComponent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <CardComponent variant="glass">
        <CardBody className="p-8">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            components={{
              toolbar: CustomToolbar
            }}
            style={{ height: 'calc(100vh - 400px)', minHeight: 650 }}
            eventPropGetter={(event) => ({
              style: event.style
            })}
            messages={{
              today: 'Today',
              previous: 'Previous',
              next: 'Next',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              agenda: 'Agenda',
              date: 'Date',
              time: 'Time',
              event: 'Session',
              noEventsInRange: 'No sessions scheduled for this period.',
              showMore: (total) => `+${total} more`
            }}
          />
        </CardBody>
      </CardComponent>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionDetailModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onEdit={handleEditSession}
            onDelete={handleDeleteSession}
            onStart={handleStartSession}
            onEnd={handleEndSession}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
