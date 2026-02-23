import React, { createContext, useContext, useState, useMemo } from "react";

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

    const value = useMemo(() => ({ currentTime, duration, setCurrentTime, setDuration }), [currentTime, duration]);

    return (
        <PlaybackProgressContext.Provider value={value}>
            {children}
        </PlaybackProgressContext.Provider>
    );
};

export const usePlaybackProgress = () => {
    const ctx = useContext(PlaybackProgressContext);
    if (!ctx) throw new Error("usePlaybackProgress must be used within PlaybackProgressProvider");
    return ctx;
};
