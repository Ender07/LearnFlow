import { useEffect, useState, useRef, useCallback } from 'react';

export default function useVoiceNavigation({ onNext, onPrev, stepInstruction, active }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log('Voice Command Received:', transcript);

        if (transcript.includes('next') || transcript.includes('advance') || transcript.includes('forward')) {
          onNext();
          speakText("Advancing to next step");
        } else if (transcript.includes('previous') || transcript.includes('back')) {
          onPrev();
          speakText("Returning to previous step");
        } else if (transcript.includes('read') || transcript.includes('instruction') || transcript.includes('speak')) {
          if (stepInstruction) {
            speakText(stepInstruction);
          }
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        if (e.error === 'no-speech') return;
        setListening(false);
      };

      rec.onend = () => {
        if (listening && active) {
          try {
            rec.start();
          } catch (err) {
            console.error('Failed to restart recognition:', err);
          }
        }
      };

      recognitionRef.current = rec;
    }
  }, [onNext, onPrev, stepInstruction, listening, active]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !listening && active) {
      try {
        recognitionRef.current.start();
        setListening(true);
        speakText("Voice control activated. You can say 'next step', 'previous step', or 'read instruction'.");
      } catch (err) {
        console.error(err);
      }
    }
  }, [listening, active]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
      speakText("Voice control deactivated.");
    }
  }, [listening]);

  useEffect(() => {
    if (!active && listening) {
      stopListening();
    }
  }, [active, listening, stopListening]);

  return {
    supported,
    listening,
    startListening,
    stopListening,
    speakText
  };
}
