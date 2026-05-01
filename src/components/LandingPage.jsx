import React from 'react';
import './LandingPage.css';
import GridScan from './GridScan';

const LandingPage = ({ onEnter }) => {
  return (
    <div className="landing-wrapper">
      <div className="bg-scan-container">
        <GridScan 
          linesColor="#400000"
          scanColor="#ff0000"
          gridScale={0.12}
          lineThickness={1.5}
          scanOpacity={0.5}
          bloomIntensity={0.8}
          noiseIntensity={0.02}
          scanDuration={3}
          scanDelay={1}
          sensitivity={0.8}
        />
      </div>
      <div className="fixed inset-0 grain-noise z-50"></div>
      <div className="fixed inset-0 vignette-overlay z-40 pointer-events-none"></div>
      
      {/* Blood Stains Effect */}
      <div className="blood-stain top-left"></div>
      <div className="blood-stain bottom-right"></div>

      <nav className="ritual-nav">
        <div className="ritual-logo glitch-text">THE LAST WISH</div>
        <div className="nav-actions">
          <button className="nav-offer-btn heartbeat" onClick={onEnter}>
            OFFER YOURSELF
          </button>
          <div className="nav-icon">
            <span className="material-symbols-outlined">warning</span>
          </div>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-container">
            <h1 className="flicker title">THE LAST WISH</h1>
            <p className="subtitle">YOUR FINAL TESTAMENT AWAITS.</p>
          </div>

          <div className="ritual-image-frame">
            <img 
              src="/pic.png" 
              alt="Ritual Hands" 
              className="ritual-img"
            />
            <div className="image-overlay"></div>
            <div className="cross-mark">✕</div>
          </div>

          <div className="warning-box">
            <p className="warning-text">
              THIS IS NOT A GAME. PROCEED ONLY IF YOU ARE PREPARED FOR THE CONSEQUENCES. 
              FOR ENTERTAINMENT? PERHAPS. FOR THE SOUL? DEFINITELY NOT.
              <br/><br/>
              <span className="fun-disclaimer">NOTE: THIS APPLICATION IS BUILT FOR ENTERTAINMENT PURPOSES ONLY.</span>
            </p>
          </div>
        </section>

        <section className="covenant-section">
          <h2 className="section-title">THE COVENANT'S TERMS</h2>
          <ul className="rules-list">
            <li>
              <span className="material-symbols-outlined icon">edit</span>
              <span className="rule-text">Do not look away.</span>
            </li>
            <li>
              <span className="material-symbols-outlined icon">close</span>
              <span className="rule-text">The silence is your only protection.</span>
            </li>
            <li>
              <span className="material-symbols-outlined icon">lock</span>
              <span className="rule-text">Once the ritual begins, the door is locked from the outside.</span>
            </li>
          </ul>
        </section>

        <div className="cta-container">
          <button className="offer-btn heartbeat" onClick={onEnter}>
            <span className="btn-normal">OFFER YOURSELF</span>
            <span className="btn-hover glitch-text">HELP ME</span>
          </button>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="footer-links">
          <span>DO_NOT_READ</span>
          <span>THE_COVENANT</span>
          <span>PUNISHMENT_TERMS</span>
        </div>
        <p className="footer-note">© NO RETURN. ALL SOULS FORFEIT.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
