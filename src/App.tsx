import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppRouter from "./router/AppRouter";
import MCLoadingSpinner from "@/shared/components/MCLoadingSpinner";
import { queryClient } from "@/lib/react-query/config";
import MCToast from "@/shared/components/MCToast";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MCLoadingSpinner />
      <AppRouter />
      <MCToast />
      {/* React Query Devtools solo en desarrollo */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
