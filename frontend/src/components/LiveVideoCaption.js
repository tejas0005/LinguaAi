// src/components/LiveVideoCaption.js
import React, { useEffect, useRef, useState } from "react";
import "./LiveVideoCaption.css";

const LiveVideoCaption = () => {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // Track user intent

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [caption, setCaption] = useState("Press 'Start Captioning' to begin.");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  // --- Core Function: Start Recognition ---
  const startRecognition = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not available.");
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Ignore common "already started" error during fast restarts
      if (err.name !== "InvalidStateError") {
        console.error("Recognition Start Error:", err);
      }
    }
  };

  // --- Camera Logic ---
  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Camera/Microphone access denied. Check permissions and use HTTPS.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // --- Speech Recognition Init ---
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Browser not supported. Use desktop Google Chrome for Web Speech API.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // --- Event: Result ---
    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalText += transcriptText;
        } else {
          interimText += transcriptText;
        }
      }

      if (finalText) {
        setTranscript((prev) => (prev ? `${prev} ${finalText}.` : `${finalText}.`));
      }

      setCaption(interimText || finalText.trim() || "Listening...");
    };

    // --- Event: End ---
    recognition.onend = () => {
      setIsListening(false);
      if (isListeningRef.current) {
        console.log("Recognition ended unexpectedly, restarting...");
        startRecognition();
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      if (event.error !== "no-speech") {
        setError(`Speech error: ${event.error}. Restarting...`);
      }
      if (isListeningRef.current && event.error !== "not-allowed") {
        startRecognition();
      } else {
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    // Cleanup
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // --- Controls ---
  const toggleListening = () => {
    if (isListening) {
      // Manual Stop
      isListeningRef.current = false;
      recognitionRef.current && recognitionRef.current.stop();
      setCaption("Captioning stopped.");
    } else {
      // Manual Start
      setError("");
      setTranscript("");
      setCaption("Listening...");
      isListeningRef.current = true;
      startRecognition();
    }
  };

  const handleClearTranscript = () => {
    setTranscript("");
    setCaption("Press 'Start Captioning' to begin.");
  };

  return (
    <div className="live-caption-container">
      <h2>Live Captioning</h2>

      {error && <div className="error-banner">{error}</div>}

      <div className="controls">
        <button
          onClick={isCameraOn ? stopCamera : startCamera}
          className={`btn ${isCameraOn ? "btn-stop-cam" : "btn-start-cam"}`}
        >
          {isCameraOn ? "🔴 Stop Camera" : "📸 Start Camera"}
        </button>

        <button
          onClick={toggleListening}
          className={`btn ${isListening ? "btn-recording" : "btn-start-rec"}`}
          disabled={!!error && error.includes("Browser not supported")}
        >
          {isListening ? "⏸️ Stop Captioning" : "🎤 Start Captioning"}
        </button>

        <button
          onClick={handleClearTranscript}
          className="btn btn-clear"
          disabled={!transcript}
        >
          🧹 Clear Transcript
        </button>
      </div>

      {/* Video Area with Overlay */}
      <div className="video-wrapper">
        {/* Always render the video so ref is never null */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video-feed"
        />

        {/* Placeholder overlay when camera is off */}
        {!isCameraOn && (
          <div className="video-placeholder">
            Camera Inactive
          </div>
        )}

        {/* Caption Overlay */}
        <div className="caption-overlay">
          <p>{caption}</p>
        </div>
      </div>

      {/* Transcript Box */}
      <div className="transcript-box">
        <h3>Full Transcript History</h3>
        <div className="transcript-content">
          {transcript || "Full transcript will appear here as you speak."}
        </div>
      </div>
    </div>
  );
};

export default LiveVideoCaption;
