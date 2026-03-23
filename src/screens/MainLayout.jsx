import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const MainLayout = () => {
  const location = useLocation()
  const hideBottomNav = location.pathname.startsWith('/product/') || location.pathname === '/cart'

  return (
    <div className={`min-h-screen relative bg-background ${hideBottomNav ? 'pb-0' : 'pb-24'}`}>
      <Outlet />
      {!hideBottomNav && <BottomNav />}
    </div>
  )
}

export default MainLayout

