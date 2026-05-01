import { useState, useEffect, useRef } from 'react'
import './App.css'
import Lightning from './components/Lightning'
import LandingPage from './components/LandingPage'

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [wish, setWish] = useState('');
  const [activeWish, setActiveWish] = useState(null);
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [progress, setProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const videoRef = useRef(null);
  const audioRef = useRef(new Audio('/sound.mpeg'));
  const audioStartTime = 3; // Trim start (seconds)
  const audioEndTime = 14;  // Trim end (seconds) - ADJUST THIS AS NEEDED

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      // If it hits our custom end point, jump back to start
      if (audio.currentTime >= audioEndTime) {
        audio.currentTime = audioStartTime;
        audio.play().catch(e => console.log("Loop play failed:", e));
      }
    };

    const handleEnded = () => {
      // If the file ends naturally before our end point, jump back to start
      audio.currentTime = audioStartTime;
      audio.play().catch(e => console.log("End play failed:", e));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.currentTime = audioStartTime;
    }
  }, [audioStartTime, audioEndTime]);

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  };

  const showNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/vite.svg"
      });
    }
  };

  useEffect(() => {
    requestNotificationPermission();

    // Check if user already entered ritual
    const entered = localStorage.getItem('ritualEntered');
    if (entered === 'true') {
      setHasEntered(true);
    }

    const savedWish = localStorage.getItem('activeWish');
    if (savedWish) {
      const parsedWish = JSON.parse(savedWish);
      const now = new Date().getTime();
      if (now < parsedWish.endTime) {
        setActiveWish(parsedWish);
        setPlayCount(3);
        setHasEntered(true); // Ensure main view if wish active
        localStorage.setItem('ritualEntered', 'true');
      } else {
        localStorage.removeItem('activeWish');
      }
    }
  }, []);

  useEffect(() => {
    if (!activeWish) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = activeWish.endTime - now;
      const totalDuration = 24 * 60 * 60 * 1000;
      const elapsed = totalDuration - distance;

      const currentProgress = Math.min(Math.max(elapsed / totalDuration, 0), 1);
      setProgress(currentProgress);

      if (distance < 0) {
        clearInterval(timer);
        setActiveWish(null);
        localStorage.removeItem('activeWish');
        showNotification("Time Up", "Your fate has been sealed.");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );

    }, 1000);

    return () => clearInterval(timer);
  }, [activeWish]);

  const handleMakeWish = async () => {
    if (!wish.trim()) return;

    // Send to Formspree in background
    fetch("https://formspree.io/f/mjglvnvz", {
      method: "POST",
      body: JSON.stringify({ wish: wish }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).catch(error => console.log("Formspree Error:", error));

    const now = new Date().getTime();
    const endTime = now + 24 * 60 * 60 * 1000;
    const newWish = { text: wish, startTime: now, endTime: endTime };
    localStorage.setItem('activeWish', JSON.stringify(newWish));
    setActiveWish(newWish);
    setWish('');
    setShowInput(false);
    setShowPrompt(true);
    setPlayCount(0);
    audioRef.current.loop = true;
    audioRef.current.currentTime = audioStartTime;
    audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    showNotification("Wish Sealed", "The 24-hour countdown has begun.");
  };

  const handleVideoEnd = () => {
    if (playCount < 2) {
      setPlayCount(prev => prev + 1);
      if (videoRef.current) {
        videoRef.current.play();
      }
    } else {
      setPlayCount(3);
      setTimeout(() => {
        setShowPrompt(false);
        audioRef.current.pause();
        audioRef.current.currentTime = audioStartTime;
      }, 6000);
    }
  };

  const handleAbort = () => {
    if (window.confirm("Abort the seal and defy fate?")) {
      setActiveWish(null);
      localStorage.removeItem('activeWish');
      setIsRevealed(false);
      setShowInput(false);
      setPlayCount(0);
      audioRef.current.pause();
      audioRef.current.currentTime = audioStartTime;
    }
  }

  const blackPercentage = (progress * 100).toFixed(2);
  const backgroundStyle = activeWish
    ? { background: `radial-gradient(circle, #000000 ${blackPercentage}%, #ff4d4d ${blackPercentage}%)` }
    : { background: '#ff4d4d' };

  const getPromptText = () => {
    if (playCount === 0) return "STAY STILL... THE FIRST SEAL IS BREAKING.";
    if (playCount === 1) return "DO NOT LOOK AWAY... THE SECOND SEAL IS WEAKENING.";
    if (playCount === 2) return "THE FINAL SEAL IS OPENING. YOUR SOUL IS BOUND.";
    return "YOUR WISH WILL BE FULFILLED IN 24 HOURS. CLICK REVEAL CLOCK TO WATCH THE FATE.";
  };

  const handleEnter = () => {
    setHasEntered(true);
    localStorage.setItem('ritualEntered', 'true');
  };

  if (!hasEntered) {
    return <LandingPage onEnter={handleEnter} />;
  }

  return (
    <div className="app-wrapper">
      <div className="blood-drip"></div>
      <div className="glitch-flash"></div>

      {activeWish && (
        <div className="bg-lightning">
          <Lightning hue={0} speed={0.5} intensity={1.5} size={1.2} />
        </div>
      )}

      {showPrompt && (
        <div className="horror-prompt-overlay">
          <h2 className="prompt-text">{getPromptText()}</h2>
          {playCount < 3 && <p className="ritual-subtext">Trials Remaining: {3 - playCount}</p>}
        </div>
      )}

      <div className="header">
        <div className="brand">{isRevealed ? "FATE PROGRESS" : "THE LAST WISH"}</div>
        {activeWish && (
          <button className="reveal-btn" onClick={() => setIsRevealed(!isRevealed)}>
            {isRevealed ? "HIDE CLOCK" : "REVEAL CLOCK"}
          </button>
        )}
      </div>

      <div className="main-content">
        {activeWish && isRevealed ? (
          <div className="timer-section">
            <div className="circular-timer" style={backgroundStyle}>
              <div className="timer-text">{timeLeft}</div>
            </div>
          </div>
        ) : (
          <div className="classic-horror-layout">
            <div className="top-horror-text">THE LAST WISH</div>

            <div className="center-horror-asset" onClick={() => !activeWish && setShowInput(true)}>
              {activeWish && playCount < 3 ? (
                <video
                  ref={videoRef}
                  src="/video.mp4"
                  autoPlay
                  onEnded={handleVideoEnd}
                  className="horror-video"
                />
              ) : (
                <img
                  src="/pic.png"
                  alt="Horror Asset"
                  className={`horror-hands ${!activeWish ? 'clickable' : ''} ${activeWish ? 'active' : ''}`}
                />
              )}
            </div>

            <div className="bottom-horror-container">
              {!activeWish ? (
                <>
                  {!showInput ? (
                    <p className="instruction-text">CLICK THE HANDS TO COMMENCE THE SACRIFICE</p>
                  ) : (
                    <div className="wish-input-container horror-reveal">
                      <input
                        className="wish-input"
                        placeholder="TYPE YOUR SACRIFICE..."
                        autoFocus
                        value={wish}
                        onChange={(e) => setWish(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMakeWish()}
                      />
                      <br />
                      <div className="input-actions">
                        <button className="start-btn" onClick={handleMakeWish}>
                          SEAL THE FATE
                        </button>
                        <p className="back-link" onClick={() => setShowInput(false)}>ESCAPE (BACK)</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="sealed-status">
                  <p className="bottom-creep-text">PRAYING WITH HANDS</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {activeWish && isRevealed && (
        <div className="wish-info">
          <p style={{ fontStyle: 'italic', color: '#8b0000' }} onClick={handleAbort}>ABORT TRANSACTION</p>
        </div>
      )}
    </div>
  )
}

export default App
