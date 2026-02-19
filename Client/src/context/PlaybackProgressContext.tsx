import React, { createContext, useContext, useState } from "react";

interface PlaybackProgressContextType {
    currentTime: number;
    duration: number;
    setCurrentTime: (t: number) => void;
    setDuration: (d: number) => void;
}

const PlaybackProgressContext = createContext<PlaybackProgressContextType | undefined>(undefined);

export const PlaybackProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    return (
        <PlaybackProgressContext.Provider value={{ currentTime, duration, setCurrentTime, setDuration }}>
            {children}
        </PlaybackProgressContext.Provider>
    );
};

export const usePlaybackProgress = () => {
    const ctx = useContext(PlaybackProgressContext);
    if (!ctx) throw new Error("usePlaybackProgress must be used within PlaybackProgressProvider");
    return ctx;
};
