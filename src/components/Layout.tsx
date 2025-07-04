import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { EnhancedHeader } from './Header'


export const Layout = () => {
  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <EnhancedHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}