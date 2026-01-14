import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { useQuiz } from "../hooks";
import {
  CardComponent,
  CardBody,
  Button,
  Badge,
  LoadingState,
  Alert,
  Modal,
} from "../components/ui";

export default function StudentQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const {
    quiz,
    currentQuestion,
    answers,
    timeRemaining,
    attempts,
    isLoading,
    error,
    setCurrentQuestion,
    selectOption,
    submitQuiz,
    startQuiz,
    fetchQuiz,
  } = useQuiz(quizId!);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (quiz && attempts.length > 0) {
      const latestAttempt = attempts[0];
      if (!latestAttempt.submittedAt) {
        setAttemptId(latestAttempt._id);
        setQuizStarted(true);
      }
    }
  }, [quiz, attempts]);

  const handleStartQuiz = async () => {
    const newAttemptId = await startQuiz();
    if (newAttemptId) {
      setAttemptId(newAttemptId);
      setQuizStarted(true);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;

    try {
      setIsSubmitting(true);
      const result = await submitQuiz(attemptId);
      setResults(result);
      setShowSubmitModal(false);
      setQuizStarted(false);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getTotalQuestions = () => {
    return quiz?.questions.length || 0;
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState type="skeleton" text="Loading quiz..." />;
  }

  // Show error state
  if (error || !quiz) {
    return (
      <div className="space-y-8">
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load quiz</p>
              <p className="text-sm opacity-90">{error || "Quiz not found"}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchQuiz}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Show results
  if (results) {
    const scorePercentage = Math.round(results.score);
    const isPassed = results.passed;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto"
      >
        <CardComponent variant="glass">
          <CardBody className="p-8 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${
                isPassed
                  ? "bg-gradient-to-br from-success/20 to-success/5 border-2 border-success/30"
                  : "bg-gradient-to-br from-error/20 to-error/5 border-2 border-error/30"
              }`}
            >
              {isPassed ? (
                <Trophy className="w-10 h-10 text-success" />
              ) : (
                <XCircle className="w-10 h-10 text-error" />
              )}
            </motion.div>

            {/* Message */}
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {isPassed ? "Congratulations!" : "Keep Trying!"}
            </h2>
            <p className="text-white/60 mb-8">
              {isPassed
                ? "You've passed the quiz successfully!"
                : "You didn't pass this time, but you can try again."}
            </p>

            {/* Score */}
            <div className="mb-8">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-2xl ${
                isPassed
                  ? "bg-gradient-to-br from-success/20 to-success/5 border-2 border-success/40"
                  : "bg-gradient-to-br from-error/20 to-error/5 border-2 border-error/40"
              }`}>
                <div>
                  <div className={`text-5xl font-bold ${isPassed ? "text-success" : "text-error"}`}>
                    {scorePercentage}%
                  </div>
                  <div className="text-xs text-white/50 mt-1">Passing: {quiz.passingScore}%</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-xs text-primary mb-1">Points</p>
                <p className="text-lg font-bold text-primary">
                  {results.earnedPoints}<span className="text-sm text-white/40">/{results.totalPoints}</span>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <p className="text-xs text-accent mb-1">Time</p>
                <p className="text-lg font-bold text-accent">
                  {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/50 mb-1">Attempts</p>
                <p className="text-lg font-bold text-white/80">
                  {attempts.length}<span className="text-sm text-white/40">/{quiz.maxAttempts}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link to={`/student/courses/${quiz.course}`} className="flex-1">
                <Button variant="outline" size="lg" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Course
                </Button>
              </Link>
              {!isPassed && scorePercentage < 100 && attempts.length < quiz.maxAttempts && (
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => {
                    setResults(null);
                    setQuizStarted(false);
                  }}
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardBody>
        </CardComponent>
      </motion.div>
    );
  }

  // Show quiz start screen
  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-4"
      >
        <Link to={`/student/courses/${quiz.course}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Course
          </Button>
        </Link>

        <CardComponent variant="glass">
          <CardBody className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-white/60">{quiz.description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
                <p className="text-xs text-primary mb-1">Questions</p>
                <p className="text-2xl font-bold text-primary">{quiz.questions.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 text-center">
                <p className="text-xs text-accent mb-1">Time</p>
                <p className="text-2xl font-bold text-accent">
                  {quiz.timeLimit ? `${quiz.timeLimit}m` : "∞"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 text-center">
                <p className="text-xs text-success mb-1">Pass</p>
                <p className="text-2xl font-bold text-success">{quiz.passingScore}%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/50 mb-1">Attempts</p>
                <p className="text-2xl font-bold text-white/80">
                  {attempts.length}<span className="text-sm text-white/40">/{quiz.maxAttempts}</span>
                </p>
              </div>
            </div>

            {/* Previous Attempts */}
            {attempts.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-white/60 mb-3 font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Previous Attempts
                </p>
                <div className="space-y-2">
                  {attempts.slice(0, 3).map((attempt: any) => (
                    <div
                      key={attempt._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          #{attempt.attemptNumber}
                        </div>
                        <span className="text-sm text-white/70">
                          {new Date(attempt.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant={attempt.passed ? "success" : "error"} size="sm">
                        {Math.round(attempt.score)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            {attempts.length >= quiz.maxAttempts ? (
              <Alert variant="warning">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Maximum attempts reached</p>
                    <p className="text-xs opacity-80 mt-1">
                      You've used all {quiz.maxAttempts} attempts for this quiz.
                    </p>
                  </div>
                </div>
              </Alert>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<Trophy className="w-5 h-5" />}
                onClick={handleStartQuiz}
              >
                Start Quiz
              </Button>
            )}
          </CardBody>
        </CardComponent>
      </motion.div>
    );
  }

  // Show quiz questions
  const currentQ = quiz.questions[currentQuestion];
  const selectedAnswers = answers[currentQ._id] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">{quiz.title}</h1>
          <p className="text-sm text-white/50 mt-1">
            Question {currentQuestion + 1} of {getTotalQuestions()} • {getAnsweredCount()} answered
          </p>
        </div>
        {quiz.timeLimit && (
          <motion.div
            animate={timeRemaining < 60 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: timeRemaining < 60 ? Infinity : 0, duration: 1 }}
            className={`px-4 py-2 rounded-lg ${
              timeRemaining < 60
                ? "bg-error/20 text-error border border-error/30"
                : timeRemaining < 180
                ? "bg-warning/20 text-warning border border-warning/30"
                : "bg-primary/20 text-primary border border-primary/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-bold font-mono">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / getTotalQuestions()) * 100}%` }}
          className="h-full bg-gradient-to-r from-primary via-accent to-secondary"
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          <CardComponent variant="glass" hover>
            <CardBody className="p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                    {currentQuestion + 1}
                  </div>
                  <Badge variant={currentQ.type === "multiple" ? "warning" : "primary"} size="sm">
                    {currentQ.type === "multiple" ? "Multiple" : "Single"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/40">Points</div>
                  <div className="text-sm font-bold text-accent">{currentQ.points}</div>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-xl font-semibold mb-6 text-white/90 leading-relaxed">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((option: any, index: number) => {
                  const isSelected = selectedAnswers.includes(index);
                  const isMultiple = currentQ.type === "multiple";
                  const optionLabel = String.fromCharCode(65 + index);

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => selectOption(currentQ._id, index, isMultiple)}
                      className={`w-full p-4 rounded-xl transition-all text-left group ${
                        isSelected
                          ? "bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/50"
                          : "bg-white/5 border-2 border-white/10 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Option Label */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                            isSelected
                              ? "bg-gradient-to-br from-primary to-accent text-white"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {optionLabel}
                        </div>
                        {/* Option Text */}
                        <span className={`flex-1 ${
                          isSelected ? "text-white font-medium" : "text-white/70"
                        }`}>
                          {option.text}
                        </span>
                        {/* Checkbox/Radio */}
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary"
                              : "border-2 border-white/30"
                          } ${!isMultiple && "rounded-full"}`}
                        >
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Info */}
              {currentQ.type === "multiple" && (
                <Alert variant="info" className="mt-4">
                  <div className="flex items-center gap-2 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Multiple answers allowed</span>
                  </div>
                </Alert>
              )}
            </CardBody>
          </CardComponent>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <CardComponent variant="glass">
        <CardBody className="p-4">
          {/* Question Numbers Grid */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quiz.questions.map((_: any, index: number) => {
              const isAnswered = answers[quiz.questions[index]._id];
              const isCurrent = index === currentQuestion;

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                    isCurrent
                      ? "bg-gradient-to-br from-primary to-accent text-white shadow-glow"
                      : isAnswered
                      ? "bg-success/30 text-success border border-success/50"
                      : "bg-white/5 text-white/50 border border-white/10 hover:border-primary/30"
                  }`}
                >
                  {index + 1}
                </motion.button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex-1" />

            {currentQuestion < getTotalQuestions() - 1 ? (
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() =>
                  setCurrentQuestion(Math.min(getTotalQuestions() - 1, currentQuestion + 1))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                variant="success"
                size="md"
                rightIcon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setShowSubmitModal(true)}
                disabled={getAnsweredCount() < getTotalQuestions()}
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </CardBody>
      </CardComponent>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Quiz?"
      >
        <div className="p-6">
          <p className="text-white/80 mb-6">
            Are you ready to submit your quiz?
          </p>

          {/* Progress */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 text-center">
              <p className="text-xs text-success mb-1">Answered</p>
              <p className="text-2xl font-bold text-success">{getAnsweredCount()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xs text-white/50 mb-1">Total</p>
              <p className="text-2xl font-bold">{getTotalQuestions()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>Completion</span>
              <span>{Math.round((getAnsweredCount() / getTotalQuestions()) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary via-accent to-success rounded-full"
              />
            </div>
          </div>

          {/* Warning */}
          {getAnsweredCount() < getTotalQuestions() && (
            <Alert variant="warning" className="mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Incomplete Quiz</p>
                  <p className="text-xs opacity-80 mt-1">
                    {getTotalQuestions() - getAnsweredCount()} unanswered question{getTotalQuestions() - getAnsweredCount() > 1 ? 's' : ''} will be marked as incorrect.
                  </p>
                </div>
              </div>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setShowSubmitModal(false)}
              className="flex-1"
            >
              Review
            </Button>
            <Button
              variant="success"
              size="md"
              leftIcon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
            >
              Submit Quiz
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
