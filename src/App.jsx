import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, Trash2, Languages, ArrowDownUp, Sparkles, Check, Volume2 } from 'lucide-react';

const translatorMapping = {
  'A': '£', 'B': '✓', 'C': '®', 'D': '€', 'E': '|', 'F': '¥', 'G': '^',
  'H': '°', 'I': '×', 'J': '=', 'K': '{', 'L': '}', 'M': ']', 'N': '[',
  'O': '§', 'P': '∆', 'Q': '~', 'R': '•', 'S': '¢', 'T': '√', 'U': '÷',
  'V': '™', 'W': '`', 'X': '©', 'Y': 'π', 'Z': '%'
};

// Create reverse mapping
const reverseMapping = Object.fromEntries(
  Object.entries(translatorMapping).map(([k, v]) => [v, k])
);

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isEnglishToExperimental, setIsEnglishToExperimental] = useState(true);
  const [sourceCopied, setSourceCopied] = useState(false);
  const [targetCopied, setTargetCopied] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [normalLang, setNormalLang] = useState('Español');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    translate(sourceText, isEnglishToExperimental);
  }, [sourceText, isEnglishToExperimental]);

  const translate = (text, toExperimental) => {
    if (!text) {
      setTranslatedText('');
      return;
    }

    let result = '';
    for (let char of text) {
      if (toExperimental) {
        const upperChar = char.toUpperCase();
        if (translatorMapping[upperChar]) {
          result += translatorMapping[upperChar];
        } else {
          result += char; // Leave spaces and unknown characters as is
        }
      } else {
        // Experimental to English
        if (reverseMapping[char]) {
          result += reverseMapping[char];
        } else {
          result += char;
        }
      }
    }
    
    setTranslatedText(result);
  };

  const handleSwap = () => {
    setIsEnglishToExperimental(!isEnglishToExperimental);
    setSourceText(translatedText);
  };

  const handleCopy = (text, setCopiedState) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    }
  };

  const handleSpeech = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = normalLang === 'Español' ? 'es-ES' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleClear = () => {
    setSourceText('');
  };

  const renderLanguageSelector = (isSource) => {
    const isNormal = (isSource && isEnglishToExperimental) || (!isSource && !isEnglishToExperimental);
    
    if (isNormal) {
      return (
        <select 
          className="language-dropdown" 
          value={normalLang} 
          onChange={(e) => setNormalLang(e.target.value)}
        >
          <option value="Español">Español</option>
          <option value="English">English</option>
        </select>
      );
    }
    
    return (
      <span className="language-selector" style={!isSource ? { display: 'flex', alignItems: 'center', gap: '0.5rem' } : {}}>
        {!isSource && <Sparkles size={18} />}
        Experimental
      </span>
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <Languages className="logo-icon" size={36} />
        <h1>Arnou Translator</h1>
      </header>

      <main className="translator-grid">
        {/* Source Panel */}
        <div className="panel">
          <div className="panel-header">
            {renderLanguageSelector(true)}
            <div className="controls-bar" style={{ padding: 0 }}>
               {sourceText && (
                <button className="icon-btn" onClick={handleClear} title="Clear text">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
          <textarea
            className={`text-area ${!isEnglishToExperimental ? 'experimental' : ''}`}
            placeholder="Enter text..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            autoFocus
          ></textarea>
          <div className="controls-bar">
            <button className="icon-btn" onClick={() => handleSpeech(sourceText)} title="Listen">
              <Volume2 size={20} />
            </button>
            <button className="icon-btn" onClick={() => handleCopy(sourceText, setSourceCopied)} title="Copy text">
              {sourceCopied ? <Check size={20} className="logo-icon" /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="swap-container">
          <button className="swap-btn" onClick={handleSwap} title="Swap languages">
            {windowWidth > 768 ? <ArrowRightLeft size={24} /> : <ArrowDownUp size={24} />}
          </button>
        </div>

        {/* Target Panel */}
        <div className="panel">
          <div className="panel-header">
            {renderLanguageSelector(false)}
          </div>
          <textarea
            className={`text-area ${isEnglishToExperimental ? 'experimental' : ''}`}
            placeholder="Translation"
            value={translatedText}
            readOnly
          ></textarea>
          <div className="controls-bar">
            <button className="icon-btn" onClick={() => handleSpeech(translatedText)} title="Listen">
              <Volume2 size={20} />
            </button>
            <button className="icon-btn" onClick={() => handleCopy(translatedText, setTargetCopied)} title="Copy translation">
              {targetCopied ? <Check size={20} className="logo-icon" /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </main>

      <section className="alphabet-section">
        <h2>Alfabeto / Alphabet</h2>
        <div className="alphabet-grid">
          {Object.entries(translatorMapping).map(([letter, symbol]) => (
            <div key={letter} className="alphabet-item">
              <span className="normal-letter">{letter}</span>
              <span className="experimental-symbol">{symbol}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
