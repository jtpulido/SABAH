import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Login from './pages/login/Login'

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route index path="/" element={<Login />} />
        </Routes>
    </BrowserRouter>
  )
}

