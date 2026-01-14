import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { useAuth } from "./providers/AuthProvider";
import { ROUTES } from "./shared/constants/routes.constants";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { UserRole } from "./shared/types/auth.types";
import MainLayout from "./layouts/MainLayout";
import { ScrollToTop } from "./components/layout/ScrollToTop";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home")); // This will be your landing page
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard")); // Create this as your authenticated home
const Orders = lazy(() => import("./pages/Orders"));
const Projects = lazy(() => import("./pages/Projects"));
const Competitions = lazy(() => import("./pages/Competitions"));
const Teams = lazy(() => import("./pages/Teams"));
const Posts = lazy(() => import("./pages/Posts"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Inventory = lazy(() => import("./pages/Inventory"));
const ComponentShowcase = lazy(() => import("./pages/ComponentShowcase"));

// Service pages
const TrainingPage = lazy(() => import("./pages/services/TrainingPage"));
const TechnicalProjectsPage = lazy(() => import("./pages/services/TechnicalProjectsPage"));
const ThreeDPrintingPage = lazy(() => import("./pages/services/ThreeDPrintingPage"));

// Gallery page
const GalleryPage = lazy(() => import("./pages/GalleryPage"));

// Student Dashboard pages
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentCourses = lazy(() => import("./pages/StudentCourses"));
const StudentCourseDetails = lazy(() => import("./pages/StudentCourseDetails"));
const StudentModuleViewer = lazy(() => import("./pages/StudentModuleViewer"));
const StudentQuiz = lazy(() => import("./pages/StudentQuiz"));
const StudentAssignment = lazy(() => import("./pages/StudentAssignment"));
const StudentAttendanceOverview = lazy(() => import("./pages/StudentAttendanceOverview"));
const StudentCourseAttendance = lazy(() => import("./pages/StudentCourseAttendance"));
const StudentPayments = lazy(() => import("./pages/StudentPayments"));

// Trainer Dashboard pages
const TrainerDashboard = lazy(() => import("./pages/TrainerDashboard"));
const TrainerSchedule = lazy(() => import("./pages/TrainerSchedule"));
const TrainerGroups = lazy(() => import("./pages/TrainerGroups"));
const TrainerGroupDetail = lazy(() => import("./pages/TrainerGroupDetail"));
const TrainerCreateGroup = lazy(() => import("./pages/TrainerCreateGroup"));
const TrainerSessions = lazy(() => import("./pages/TrainerSessions"));
const TrainerCreateSession = lazy(() => import("./pages/TrainerCreateSession"));
const TrainerEditSession = lazy(() => import("./pages/TrainerEditSession"));
const TrainerSessionDetail = lazy(() => import("./pages/TrainerSessionDetail"));
const TrainerTakeAttendance = lazy(() => import("./pages/TrainerTakeAttendance"));
const TrainerSessionEvaluations = lazy(() => import("./pages/TrainerSessionEvaluations"));
const TrainerQuizzes = lazy(() => import("./pages/TrainerQuizzes"));
const TrainerQuizBuilder = lazy(() => import("./pages/TrainerQuizBuilder"));

// Reception Dashboard pages
const ReceptionDashboard = lazy(() => import("./pages/ReceptionDashboard"));
const UserManagement = lazy(() => import("./pages/reception/UserManagement"));
const EnrollmentManagement = lazy(() => import("./pages/reception/EnrollmentManagement"));
const LeadManagement = lazy(() => import("./pages/reception/LeadManagement"));
const Schedule = lazy(() => import("./pages/reception/Schedule"));

// CLO pages
const CLODashboard = lazy(() => import("./pages/CLODashboard"));
const CLOTrainers = lazy(() => import("./pages/CLOTrainers"));
const CLOCourses = lazy(() => import("./pages/CLOCourses"));
const CLOGroups = lazy(() => import("./pages/CLOGroups"));
const CLOEvaluations = lazy(() => import("./pages/CLOEvaluations"));
const CLOEvaluationCriteria = lazy(() => import("./pages/CLOEvaluationCriteria"));
const CLOAttendance = lazy(() => import("./pages/CLOAttendance"));
const CLOInterests = lazy(() => import("./pages/CLOInterests"));

/**
 * Component to show while loading a page
 */
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

/**
 * Component to protect admin routes
 */
const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <Navigate to={ROUTES.DASHBOARD} state={{ from: location }} replace />
    );
  }

  return <Outlet />;
};

/**
 * Component to protect authenticated routes
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Redirect students to student dashboard if they try to access regular dashboard
  if (user?.role === UserRole.STUDENT && location.pathname === ROUTES.DASHBOARD) {
    return <Navigate to="/student" replace />;
  }

  // Redirect trainers/teachers to trainer dashboard if they try to access regular dashboard
  if ((user?.role === UserRole.TRAINER || user?.role === UserRole.TEACHER) && location.pathname === ROUTES.DASHBOARD) {
    return <Navigate to="/trainer" replace />;
  }

  // Redirect reception to reception dashboard if they try to access regular dashboard
  if (user?.role === UserRole.RECEPTION && location.pathname === ROUTES.DASHBOARD) {
    return <Navigate to="/reception" replace />;
  }

  // Redirect CLO to CLO dashboard if they try to access regular dashboard
  if (user?.role === UserRole.CLO && location.pathname === ROUTES.DASHBOARD) {
    return <Navigate to="/clo" replace />;
  }

  // Prevent students from accessing non-student routes
  if (user?.role === UserRole.STUDENT) {
    const studentRoutes = ['/student', '/posts', '/profile', '/notifications', '/settings'];
    const isStudentRoute = studentRoutes.some(route => location.pathname.startsWith(route));

    if (!isStudentRoute) {
      return <Navigate to="/student" replace />;
    }
  }

  // Prevent trainers from accessing non-trainer routes (except common routes)
  if (user?.role === UserRole.TRAINER || user?.role === UserRole.TEACHER) {
    const trainerRoutes = ['/trainer', '/posts', '/profile', '/notifications', '/settings'];
    const isTrainerRoute = trainerRoutes.some(route => location.pathname.startsWith(route));

    if (!isTrainerRoute) {
      return <Navigate to="/trainer" replace />;
    }
  }

  // Prevent reception from accessing non-reception routes (except common routes)
  if (user?.role === UserRole.RECEPTION) {
    const receptionRoutes = ['/reception', '/posts', '/profile', '/notifications', '/settings'];
    const isReceptionRoute = receptionRoutes.some(route => location.pathname.startsWith(route));

    if (!isReceptionRoute) {
      return <Navigate to="/reception" replace />;
    }
  }

  // Prevent CLO from accessing non-CLO routes (except common routes)
  if (user?.role === UserRole.CLO) {
    const cloRoutes = ['/clo', '/posts', '/profile', '/notifications', '/settings'];
    const isCLORoute = cloRoutes.some(route => location.pathname.startsWith(route));

    if (!isCLORoute) {
      return <Navigate to="/clo" replace />;
    }
  }

  return <Outlet />;
};

/**
 * Component to protect student routes
 */
const StudentRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user?.role !== UserRole.STUDENT) {
    return <Navigate to={ROUTES.DASHBOARD} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * Component to protect trainer routes
 */
const TrainerRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  // Accept both 'trainer' and 'teacher' roles
  if (user?.role !== UserRole.TRAINER && user?.role !== UserRole.TEACHER) {
    return <Navigate to={ROUTES.DASHBOARD} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * Component to protect reception routes
 * Reception staff can manage accounts, enrollments, and schedules
 */
const ReceptionRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  // Accept 'reception', 'admin', and 'superadmin' roles
  if (user?.role !== UserRole.RECEPTION && user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPERADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * Component to protect CLO routes
 * CLO (Chief Learning Officer) manages trainers, courses, groups, and analytics
 */
const CLORoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  // Accept 'clo', 'admin', and 'superadmin' roles
  if (user?.role !== UserRole.CLO && user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPERADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * Main App component that sets up routing
 */
const App = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes - NO MainLayout (no sidebar/navbar) */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          {/* Register route hidden - only admins can create accounts via user management */}
          {/* <Route path={ROUTES.REGISTER} element={<Register />} /> */}
          <Route path="/showcase" element={<ComponentShowcase />} />

          {/* Service pages */}
          <Route path="/services/training" element={<TrainingPage />} />
          <Route path="/services/technical-projects" element={<TechnicalProjectsPage />} />
          <Route path="/services/3d-printing" element={<ThreeDPrintingPage />} />

          {/* Gallery page */}
          <Route path="/gallery" element={<GalleryPage />} />

          {/* Protected routes - WITH MainLayout (includes sidebar/navbar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Regular Dashboard (Non-students) */}
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.ORDERS} element={<Orders />} />
              <Route path={ROUTES.PROJECTS} element={<Projects />} />
              <Route path={ROUTES.COMPETITIONS} element={<Competitions />} />
              <Route path={ROUTES.TEAMS} element={<Teams />} />
              <Route path={ROUTES.POSTS} element={<Posts />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />
              <Route path={ROUTES.SETTINGS} element={<Settings />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
              <Route path={ROUTES.INVENTORY} element={<Inventory />} />

              {/* Student Dashboard routes (Student role only) */}
              <Route element={<StudentRoute />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/courses" element={<StudentCourses />} />
                <Route path="/student/courses/:courseId" element={<StudentCourseDetails />} />
                <Route path="/student/modules/:moduleId" element={<StudentModuleViewer />} />
                <Route path="/student/quizzes/:quizId" element={<StudentQuiz />} />
                <Route path="/student/assignments/:assignmentId" element={<StudentAssignment />} />
                <Route path="/student/attendance" element={<StudentAttendanceOverview />} />
                <Route path="/student/attendance/:courseId" element={<StudentCourseAttendance />} />
                <Route path="/student/payments" element={<StudentPayments />} />
                <Route path="/student/payments/:courseId" element={<StudentPayments />} />
              </Route>

              {/* Trainer Dashboard routes (Trainer role only) */}
              <Route element={<TrainerRoute />}>
                <Route path="/trainer" element={<TrainerDashboard />} />
                <Route path="/trainer/schedule" element={<TrainerSchedule />} />
                <Route path="/trainer/groups" element={<TrainerGroups />} />
                {/* Group creation removed - now CLO only */}
                <Route path="/trainer/groups/:groupId" element={<TrainerGroupDetail />} />
                <Route path="/trainer/sessions" element={<TrainerSessions />} />
                <Route path="/trainer/sessions/new" element={<TrainerCreateSession />} />
                <Route path="/trainer/sessions/:sessionId/edit" element={<TrainerEditSession />} />
                <Route path="/trainer/sessions/:sessionId" element={<TrainerSessionDetail />} />
                <Route path="/trainer/attendance" element={<TrainerTakeAttendance />} />
                <Route path="/trainer/session/:sessionId/evaluations" element={<TrainerSessionEvaluations />} />
                <Route path="/trainer/quizzes" element={<TrainerQuizzes />} />
                <Route path="/trainer/quizzes/new" element={<TrainerQuizBuilder />} />
                <Route path="/trainer/quizzes/:quizId/edit" element={<TrainerQuizBuilder />} />
              </Route>

              {/* Reception Dashboard routes (Reception role only) */}
              <Route element={<ReceptionRoute />}>
                <Route path="/reception" element={<ReceptionDashboard />} />
                <Route path="/reception/users" element={<UserManagement />} />
                <Route path="/reception/enrollments" element={<EnrollmentManagement />} />
                <Route path="/reception/leads" element={<LeadManagement />} />
                <Route path="/reception/schedule" element={<Schedule />} />
              </Route>

              {/* CLO routes (Chief Learning Officer role only) */}
              <Route element={<CLORoute />}>
                <Route path="/clo" element={<CLODashboard />} />
                <Route path="/clo/trainers" element={<CLOTrainers />} />
                <Route path="/clo/courses" element={<CLOCourses />} />
                <Route path="/clo/groups" element={<CLOGroups />} />
                <Route path="/clo/evaluations" element={<CLOEvaluations />} />
                <Route path="/clo/evaluation-criteria" element={<CLOEvaluationCriteria />} />
                <Route path="/clo/attendance" element={<CLOAttendance />} />
                <Route path="/clo/interests" element={<CLOInterests />} />
              </Route>

              {/* Admin-only routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
