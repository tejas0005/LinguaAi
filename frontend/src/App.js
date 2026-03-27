import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/loginpage"; 
import AudioUploader from "./components/AudioUploader"; // example feature page
import TextTranslator from "./components/TextTranslator";
import TextToSpeech from "./components/TextToSpeech";
import SpeechToSpeech from "./components/SpeechToSpeech";
import SignLanguageTranslator from "./components/SignTranslator";
import LiveVideoCaption from "./components/LiveVideoCaption";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LoginPage />} />

          {/* Features */}
          <Route path="/speech-to-text" element={<AudioUploader />} />
          <Route path="/text-to-text" element={<TextTranslator />} />
          <Route path="/text-to-speech" element={<TextToSpeech />} />
          <Route path="/speech-to-speech" element={<SpeechToSpeech/>} />
          <Route path="/sign-language" element={<SignLanguageTranslator/>}/>
          <Route path="/live-caption" element={<LiveVideoCaption/>}/>
          {/* later you can add:
              <Route path="/text-to-text" element={<TextToText />} />
              <Route path="/text-to-speech" element={<TextToSpeech />} />
              <Route path="/speech-to-speech" element={<SpeechToSpeech />} />
              <Route path="/sign-language" element={<SignLanguage />} />
              <Route path="/captioning" element={<Captioning />} />
          */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
