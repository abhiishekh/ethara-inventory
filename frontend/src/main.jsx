import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181c23',
            color: '#e8eaf0',
            border: '1px solid #1e2330',
            fontSize: '0.85rem',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#181c23' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#181c23' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
