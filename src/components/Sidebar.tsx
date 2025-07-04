import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Shield, 
  FileText,
  Activity,
} from 'lucide-react'

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/vmess',
    label: 'VMess',
    icon: Shield,
  },
  {
    to: '/system',
    label: 'System',
    icon: Activity,
  },
  {
    to: '/config',
    label: 'Config',
    icon: FileText,
  },
]

export const Sidebar = () => {
  return (
    <div className="relative w-64 bg-gray-900 border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">BadProxy</h1>
        <p className="text-gray-400 text-sm mt-1">VMess Management</p>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                isActive ? 'bg-gray-800 text-white border-r-2 border-white' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          <p>Version 1.0.0</p>
          <p>© 2025 BadProxy</p>
        </div>
      </div>
    </div>
  )
}