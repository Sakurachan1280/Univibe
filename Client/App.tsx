import "./global.css";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/components/ModalSetting/Darkmode";
import { MusicProvider } from "./src/context/MusicContext";

export default function App() {
  return (
    <ThemeProvider>
      <MusicProvider>
        <AppNavigator />
      </MusicProvider>
    </ThemeProvider>
  );
}

