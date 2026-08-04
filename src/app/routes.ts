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
import MentorshipPage from './pages/MentorshipPage';
import InternshipPage from './pages/InternshipPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import { AdminRoute } from './components/AdminRoute';
import LinkedInCallbackPage from './pages/LinkedInCallbackPage';
import CheckoutCallbackPage from './pages/CheckoutCallbackPage';

export const router = createBrowserRouter([
  /* Standalone admin portal — completely outside Root layout & student auth.
     /admin/login is public; everything else under /admin/* sits behind
     AdminRoute, which bounces tokenless visitors back to the login gateway. */
  { path: '/admin/login', Component: AdminLoginPage },
  {
    path: '/admin',
    Component: AdminRoute,
    children: [
      { index: true, Component: AdminDashboard },
    ],
  },

  /* LinkedIn OAuth return target — standalone so no chrome flashes while the
     authorization code is being exchanged. Must match the redirect_uri
     registered in the LinkedIn developer portal. */
  { path: '/auth/linkedin/callback', Component: LinkedInCallbackPage },

  /* Payment gateway return target — verifies the reference server-side before
     anything is treated as paid. Register this as the callback/redirect URL in
     the Paystack / Flutterwave / Stripe dashboards. */
  { path: '/checkout/callback', Component: CheckoutCallbackPage },

  /* Main student app */
  {
    path: '/',
    Component: Root,
    children: [
      { index: true,                    Component: HomePage            },
      { path: 'courses',                Component: CourseCatalog       },
      { path: 'courses/:id',            Component: CourseDetailPage    },
      { path: 'exam-vouchers',          Component: ExamVouchersPage    },
      { path: 'training',               Component: TrainingPage        },
      { path: 'faq',                    Component: FAQPage             },
      { path: 'practice-exams',         Component: PracticeExamsPage   },
      { path: 'practice-exams/:id',     Component: ExamInterfacePage   },
      { path: 'host-a-course',          Component: HostACoursePage     },
      { path: 'mentorship',             Component: MentorshipPage      },
      { path: 'internship',             Component: InternshipPage      },
      { path: 'login',                  Component: LoginPage           },
      { path: 'cart',                   Component: CartPage            },
      { path: 'checkout',               Component: CheckoutPage        },
      { path: 'dashboard',              Component: StudentDashboardPage },
    ],
  },
]);
