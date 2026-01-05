import "./global.css";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/components/Darkmode";

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}