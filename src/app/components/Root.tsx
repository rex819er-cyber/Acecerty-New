import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MouseFollower } from './MouseFollower';

export function Root() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login';
  const isExam = location.pathname.startsWith('/practice-exams/');

  return (
    <div style={{ fontFamily: 'var(--ace-font)', cursor: 'none' }}>
      <MouseFollower />
      <Header />
      <main>
        <Outlet />
      </main>
      {!hideFooter && !isExam && <Footer />}
      <CartDrawer />
    </div>
  );
}
