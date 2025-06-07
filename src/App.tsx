import React from 'react'
import Dashboard from './components/Dashboard'
import { ThemeProvider } from './contexts/ThemeContext'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}

export default App