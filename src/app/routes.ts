import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';
import HomePage from './pages/HomePage';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ExamVouchersPage from './pages/ExamVouchersPage';
import TrainingPage from './pages/TrainingPage';
import FAQPage from './pages/FAQPage';
import PracticeExamsPage from './pages/PracticeExamsPage';
import ExamInterfacePage from './pages/ExamInterfacePage';
import HostACoursePage from './pages/HostACoursePage';
import StudentDashboardPage from './pages/StudentDashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'courses', Component: CourseCatalog },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'exam-vouchers', Component: ExamVouchersPage },
      { path: 'training', Component: TrainingPage },
      { path: 'faq', Component: FAQPage },
      { path: 'practice-exams', Component: PracticeExamsPage },
      { path: 'practice-exams/:id', Component: ExamInterfacePage },
      { path: 'host-a-course', Component: HostACoursePage },
      { path: 'login', Component: LoginPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'dashboard', Component: StudentDashboardPage },
    ],
  },
]);
