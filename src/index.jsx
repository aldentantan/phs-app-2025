import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)