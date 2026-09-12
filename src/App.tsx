import { createBrowserRouter, RouterProvider } from 'react-router'
import Demo from './pages/Demo.tsx'
import Landing from './pages/Landing.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/demo/:meetingId', element: <Demo /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
