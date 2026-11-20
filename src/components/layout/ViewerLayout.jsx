import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ViewerSidebar from './ViewerSidebar'
import Topbar from './Topbar'

export default function ViewerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <ViewerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:mr-64 transition-all">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}