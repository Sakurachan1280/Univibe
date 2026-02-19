import "./global.css";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/components/ModalSetting/Darkmode";
import { MusicProvider } from "./src/context/MusicContext";
import { PlaybackProgressProvider } from "./src/context/PlaybackProgressContext";

export default function App() {
  return (
    <ThemeProvider>
      <PlaybackProgressProvider>
        <MusicProvider>
          <AppNavigator />
        </MusicProvider>
      </PlaybackProgressProvider>
    </ThemeProvider>
  );
}

