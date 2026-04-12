import "./global.css";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/components/ModalSetting/Darkmode";
import { MusicProvider } from "./src/context/MusicContext";
import { PlaybackProgressProvider } from "./src/context/PlaybackProgressContext";
import { SocketProvider } from "./src/context/SocketContext";
import { JamInviteProvider } from "./src/context/JamInviteContext";

export default function App() {
  return (
    <ThemeProvider>
      <PlaybackProgressProvider>
        <MusicProvider>
          <SocketProvider>
            <JamInviteProvider>
              <AppNavigator />
            </JamInviteProvider>
          </SocketProvider>
        </MusicProvider>
      </PlaybackProgressProvider>
    </ThemeProvider>
  );
}

