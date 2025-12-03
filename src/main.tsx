import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './routes'
import { useAuthListener } from './hooks/useAuthListener'
import './index.css'

const App = () => {
  useAuthListener();
  return <AppRoutes />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
