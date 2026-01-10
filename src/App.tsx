import AppRouter from "./router/AppRouter";
import MCLoadingSpinner from "@/shared/components/MCLoadingSpinner"; // importa el spinner

function App() {
  return (
    <>
      <MCLoadingSpinner />
      <AppRouter />
    </>
  );
}

export default App;
