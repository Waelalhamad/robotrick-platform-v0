import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
} from 'lucide-react';
import { useTrainerQuizzes } from '../hooks';
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
  Input,
} from '../components/ui';

export default function TrainerQuizzes() {
  const navigate = useNavigate();
  const { quizzes, isLoading, error, fetchQuizzes, deleteQuiz } = useTrainerQuizzes();

  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'all' || quiz.course._id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  // Get unique courses for filter
  const courses = Array.from(new Set(quizzes.map(q => q.course._id)))
    .map(id => quizzes.find(q => q.course._id === id)?.course)
    .filter(Boolean);

  const handleDelete = async (quizId: string, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${quizTitle}"?`)) return;

    const success = await deleteQuiz(quizId);
    if (success) {
      // Show success message (you can use a toast here)
      alert('Quiz deleted successfully');
    }
  };

  // Show loading state
  if (isLoading && quizzes.length === 0) {
    return <LoadingState type="skeleton" text="Loading quizzes..." />;
  }

  // Show error state
  if (error && quizzes.length === 0) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load quizzes</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchQuizzes}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
          <p className="text-gray-600 mt-1">Create and manage course quizzes</p>
        </div>
        <Link to="/trainer/quizzes/new">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Create Quiz
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Courses</option>
          {courses.map(course => course && (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardComponent variant="default">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{quizzes.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="default">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {quizzes.reduce((sum, q) => sum + q.questions.length, 0)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardBody>
        </CardComponent>

        <CardComponent variant="default">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Courses</p>
                <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-accent" />
            </div>
          </CardBody>
        </CardComponent>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length > 0 ? (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <CardComponent key={quiz._id} variant="default" hover>
              <CardBody>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-900">{quiz.title}</h3>
                      <Badge variant="secondary" size="sm">
                        {quiz.course.title}
                      </Badge>
                    </div>

                    {quiz.description && (
                      <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {quiz.questions.length} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.timeLimit ? `${quiz.timeLimit} mins` : 'No limit'}
                      </span>
                      <span className="flex items-center gap-1">
                        Passing: {quiz.passingScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        Max Attempts: {quiz.maxAttempts}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/trainer/quizzes/${quiz._id}/edit`)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quiz._id, quiz.title)}
                      className="text-error hover:text-error"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </CardComponent>
          ))}
        </div>
      ) : (
        <CardComponent variant="default">
          <CardBody className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || courseFilter !== 'all' ? 'No quizzes found' : 'No quizzes yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || courseFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first quiz to get started'}
            </p>
            {!searchQuery && courseFilter === 'all' && (
              <Link to="/trainer/quizzes/new">
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Create Quiz
                </Button>
              </Link>
            )}
          </CardBody>
        </CardComponent>
      )}
    </motion.div>
  );
}
