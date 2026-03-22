import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen pb-24 relative bg-background">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
