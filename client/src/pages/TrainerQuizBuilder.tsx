import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { useTrainerQuizzes } from '../hooks/useTrainerQuizzes';
import type { QuizQuestion } from '../hooks/useTrainerQuizzes';
import { useTrainerGroups } from '../hooks/useTrainerGroups';
import QuestionEditor from '../components/trainer/QuestionEditor';
import { Button, Input, LoadingState, Alert, CardComponent, CardBody } from '../components/ui';
import { api } from '../lib/api';

export default function TrainerQuizBuilder() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const isEditing = !!quizId;

  const { getQuizById, createQuiz, updateQuiz } = useTrainerQuizzes();
  const { groups } = useTrainerGroups({});

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [courseId, setCourseId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: '',
      type: 'single',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      points: 1,
      explanation: '',
    },
  ]);

  // Get unique courses from groups
  const courses = Array.from(
    new Map(
      groups
        .filter(g => g.courseId && g.courseId._id) // Filter out null/undefined courseId
        .map(g => [g.courseId._id, g.courseId])
    ).values()
  );

  // Load quiz data if editing
  useEffect(() => {
    if (isEditing && quizId) {
      loadQuiz();
    }
  }, [quizId]);

  // Load sessions when group is selected
  useEffect(() => {
    if (groupId) {
      loadSessions();
    } else {
      setSessions([]);
      setSessionId('');
    }
  }, [groupId]);

  const loadSessions = async () => {
    try {
      const response = await api.get(`/trainer/sessions?groupId=${groupId}`);
      setSessions(response.data.data || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setSessions([]);
    }
  };

  const loadQuiz = async () => {
    if (!quizId) return;

    try {
      setIsLoading(true);
      const quiz = await getQuizById(quizId);
      if (quiz) {
        setTitle(quiz.title);
        setDescription(quiz.description || '');
        setInstructions(quiz.instructions || '');
        setCourseId(quiz.course._id);
        setPassingScore(quiz.passingScore);
        setTimeLimit(quiz.timeLimit || '');
        setMaxAttempts(quiz.maxAttempts);
        setShuffleQuestions(quiz.shuffleQuestions);
        setShuffleOptions(quiz.shuffleOptions);
        setShowFeedback(quiz.showFeedback);
        setQuestions(quiz.questions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type: 'single',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        points: 1,
        explanation: '',
      },
    ]);
  };

  const updateQuestion = (index: number, updatedQuestion: QuizQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('A quiz must have at least one question');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Quiz title is required';
    if (!courseId) return 'Please select a course';
    if (!groupId) return 'Please select a group';
    if (!sessionId) return 'Please select a session';
    if (questions.length === 0) return 'Add at least one question';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1}: Question text is required`;
      if (q.options.length < 2) return `Question ${i + 1}: At least 2 options required`;

      const hasCorrect = q.options.some(opt => opt.isCorrect);
      if (!hasCorrect) return `Question ${i + 1}: Mark at least one correct answer`;

      const hasEmptyOption = q.options.some(opt => !opt.text.trim());
      if (hasEmptyOption) return `Question ${i + 1}: All option texts are required`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    const quizData = {
      courseId,
      groupId,
      sessionId,
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      passingScore,
      timeLimit: timeLimit || undefined,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
      showFeedback,
      questions: questions.map(q => ({
        ...q,
        question: q.question.trim(),
        options: q.options.map(opt => ({
          ...opt,
          text: opt.text.trim(),
        })),
      })),
    };

    try {
      if (isEditing && quizId) {
        await updateQuiz(quizId, quizData);
      } else {
        await createQuiz(quizData);
      }
      navigate('/trainer/quizzes');
    } catch (err: any) {
      setError(err.message || 'Failed to save quiz');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading quiz..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/trainer/quizzes')}
        >
          Back to Quizzes
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
          <p className="text-gray-600 mt-1">Design your quiz with multiple-choice questions</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Settings */}
        <CardComponent variant="default">
          <CardBody>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group *
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                  required
                >
                  <option value="">Select a group</option>
                  {groups
                    .filter(g => !courseId || g.courseId?._id === courseId)
                    .map(group => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Session Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session *
                </label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                  disabled={!groupId}
                  required
                >
                  <option value="">Select a session</option>
                  {sessions.map(session => (
                    <option key={session._id} value={session._id}>
                      {session.title} - {new Date(session.scheduledDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {!groupId && (
                  <p className="text-sm text-gray-500 mt-1">Select a group first to see sessions</p>
                )}
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to Robotics - Quiz 1"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the quiz..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Instructions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions for students..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Passing Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <Input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                  min="0"
                  max="100"
                  required
                />
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="No limit"
                  min="1"
                />
              </div>

              {/* Max Attempts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Attempts
                </label>
                <Input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  required
                />
              </div>

              {/* Options */}
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Shuffle Questions</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Shuffle Answer Options</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFeedback}
                    onChange={(e) => setShowFeedback(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-gray-700">Show Feedback After Submission</span>
                </label>
              </div>
            </div>
          </CardBody>
        </CardComponent>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions ({questions.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </div>

          <AnimatePresence>
            {questions.map((question, index) => (
              <QuestionEditor
                key={index}
                question={question}
                index={index}
                onChange={(updated) => updateQuestion(index, updated)}
                onDelete={() => deleteQuestion(index)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/trainer/quizzes')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
