import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import router from './routers/router'
import { Provider } from 'react-redux'
import { store } from './redux/store'

// 1. Import the AuthProvider we fixed
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* 2. Wrap your RouterProvider with the AuthProvider */}
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)