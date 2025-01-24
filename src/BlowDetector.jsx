import React, { useEffect, useRef, useState } from 'react';
const BlowDetector = () => {
  const [isBlowing, setIsBlowing] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);
  useEffect(() => {
    const initBlowDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        microphoneRef.current = microphone;
        microphone.connect(analyser);
        detectBlow();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    const detectBlow = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let lowFrequencyEnergy = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          if (i < 100) { 
            lowFrequencyEnergy += dataArrayRef.current[i];
          }
        }
        console.log(lowFrequencyEnergy)

        const blowThreshold = 5000;
        setIsBlowing(lowFrequencyEnergy > blowThreshold);
      }

      animationFrameRef.current = requestAnimationFrame(detectBlow);
    };

    initBlowDetection();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div>
      <h1>Blow Detector</h1>
      <p>Status: {isBlowing ? "Blowing detected!" : "No blowing detected."}</p>
    </div>
  );
};

export default BlowDetector;

