/**
 * TrainerSessionEvaluations Page
 *
 * Page for evaluating all students in a specific session
 * Displays evaluated and unevaluated students with quick evaluation functionality
 *
 * @page TrainerSessionEvaluations
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Plus,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useStudentEvaluations } from '../hooks';
import { QuickEvaluationForm, EvaluationCard } from '../components/evaluation';
import { LoadingState, Alert, CardComponent, CardBody, Button } from '../components/ui';
import type { StudentRef, QuickEvaluationInput } from '../shared/types/evaluation.types';

export default function TrainerSessionEvaluations() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    getSessionEvaluations,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    isLoading,
    error
  } = useStudentEvaluations();

  const [sessionData, setSessionData] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentRef | null>(null);
  const [showQuickEval, setShowQuickEval] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch session evaluations
  useEffect(() => {
    if (sessionId) {
      loadSessionEvaluations();
    }
  }, [sessionId, refreshTrigger]);

  const loadSessionEvaluations = async () => {
    if (!sessionId) return;

    const data = await getSessionEvaluations(sessionId);
    if (data) {
      console.log('Session data loaded:', data); // Debug log
      setSessionData(data);
    }
  };

  const handleQuickEvaluate = (student: StudentRef) => {
    setSelectedStudent(student);
    setShowQuickEval(true);
  };

  const handleSubmitEvaluation = async (data: QuickEvaluationInput) => {
    // If editing, update the evaluation; otherwise create new
    const result = editingEvaluation
      ? await updateEvaluation(editingEvaluation._id, data)
      : await createEvaluation(data);

    if (result) {
      setShowQuickEval(false);
      setSelectedStudent(null);
      setEditingEvaluation(null);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleEditEvaluation = async (id: string) => {
    const evaluation = evaluations.find((e: any) => e._id === id);
    if (evaluation) {
      // Set up student data for QuickEvaluationForm
      const studentData: StudentRef = {
        _id: evaluation.studentId?._id || evaluation.studentId,
        name: evaluation.studentId?.name || 'Student',
        email: evaluation.studentId?.email || ''
      };
      setSelectedStudent(studentData);
      setEditingEvaluation(evaluation);
      setShowQuickEval(true);
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;

    const success = await deleteEvaluation(id);
    if (success) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  if (isLoading && !sessionData) {
    return <LoadingState type="spinner" text="Loading session evaluations..." />;
  }

  if (error && !sessionData) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Failed to load evaluations</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </Alert>
        <button
          onClick={() => navigate('/trainer/schedule')}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  if (!sessionData) return null;

  const { evaluations = [], unevaluatedStudents = [], stats = {} } = sessionData;
  const completionRate = stats.totalStudents > 0
    ? Math.round((stats.evaluated / stats.totalStudents) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <Link to={`/trainer/sessions/${sessionId}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Session
          </Button>
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-bold">Session Evaluations</h1>
          <p className="mt-2 text-white/60">
            Evaluate student performance for this session
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardComponent variant="glass">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/10">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Students</p>
                <p className="text-2xl font-bold text-white">{stats.totalStudents || 0}</p>
              </div>
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="glass">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/10">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Evaluated</p>
                <p className="text-2xl font-bold text-white">{stats.evaluated || 0}</p>
              </div>
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="glass">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/10">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending || 0}</p>
              </div>
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="glass">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/10">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/60">Completion</p>
                <p className="text-2xl font-bold text-white">{completionRate}%</p>
              </div>
            </div>
          </CardBody>
        </CardComponent>
      </div>

      {/* Progress Bar */}
      {stats.totalStudents > 0 && (
        <CardComponent variant="glass">
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/80">
                  Evaluation Progress
                </span>
                <span className="text-sm font-bold text-white">
                  {stats.evaluated} / {stats.totalStudents}
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
            </div>
          </CardBody>
        </CardComponent>
      )}

      {/* Unevaluated Students */}
      {unevaluatedStudents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Students to Evaluate
            </h2>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold">
              {unevaluatedStudents.length} pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unevaluatedStudents.map((student) => (
              <CardComponent key={student._id} variant="glass">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {student.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{student.name}</p>
                        <p className="text-sm text-white/60">{student.email}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickEvaluate(student)}
                    className="w-full mt-4 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Plus className="w-5 h-5" />
                    Quick Evaluate
                  </button>
                </CardBody>
              </CardComponent>
            ))}
          </div>
        </div>
      )}

      {/* Evaluated Students */}
      {evaluations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Completed Evaluations
            </h2>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold">
              {evaluations.length} completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation._id}
                evaluation={evaluation}
                onEdit={handleEditEvaluation}
                onDelete={handleDeleteEvaluation}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {evaluations.length === 0 && unevaluatedStudents.length === 0 && (
        <CardComponent variant="glass">
          <CardBody className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Students Found</h3>
            <p className="text-white/60">
              No students are enrolled in this session's group
            </p>
          </CardBody>
        </CardComponent>
      )}

      {/* Quick Evaluation Modal */}
      <AnimatePresence>
        {showQuickEval && selectedStudent && sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              setShowQuickEval(false);
              setSelectedStudent(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <QuickEvaluationForm
                studentId={selectedStudent._id}
                studentName={selectedStudent.name}
                sessionId={sessionId}
                groupId={sessionData.session?.groupId || ''}
                onSubmit={handleSubmitEvaluation}
                onCancel={() => {
                  setShowQuickEval(false);
                  setSelectedStudent(null);
                  setEditingEvaluation(null);
                }}
                initialData={editingEvaluation ? {
                  overallRating: editingEvaluation.overallRating,
                  parameters: editingEvaluation.parameters || {},
                  trainerNotes: typeof editingEvaluation.trainerNotes === 'string'
                    ? editingEvaluation.trainerNotes
                    : editingEvaluation.trainerNotes?.generalNotes || ''
                } : undefined}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      {stats.evaluated === stats.totalStudents && stats.totalStudents > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="success">
            <TrendingUp className="w-5 h-5" />
            <div>
              <p className="font-semibold">All students evaluated!</p>
              <p className="text-sm opacity-90">
                Great job! You've completed evaluations for all students in this session.
              </p>
            </div>
          </Alert>
        </motion.div>
      )}
    </motion.div>
  );
}
