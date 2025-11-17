
'use client';

import { useEffect, useCallback } from 'react';

// This function creates and plays a simple tone.
// It's self-contained and doesn't require any external audio files.
const playNotificationSound = () => {
    // Check if window and AudioContext are available
    if (typeof window === 'undefined' || !window.AudioContext) {
        console.log("AudioContext not supported on this browser.");
        return;
    }

    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Sound parameters
    oscillator.type = 'sine'; // A smooth, clean tone
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Set volume

    // Start and stop the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3); // Play for 0.3 seconds
};


export function useBusArrivalNotification(hasArrived: boolean) {
    const playSound = useCallback(() => {
        playNotificationSound();
    }, []);

    useEffect(() => {
        if (hasArrived) {
            playSound();
        }
    }, [hasArrived, playSound]);
}
