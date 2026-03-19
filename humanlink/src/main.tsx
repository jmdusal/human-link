import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
// import Dashboard from './pages/Dashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* <Dashboard /> */}
  </StrictMode>,
)
