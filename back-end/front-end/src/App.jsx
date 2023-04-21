
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter >
    </QueryClientProvider>
  )
}

