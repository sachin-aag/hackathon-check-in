import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Hackathon start date: January 24, 2026, 9:00 AM CET
const HACKATHON_START = new Date('2026-01-24T09:00:00+01:00');

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date();
    const difference = HACKATHON_START - now;
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isLive: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft.isLive) {
    return (
      <div className="countdown-container">
        <div className="countdown-live">
          <span className="live-pulse"></span>
          <span className="live-text">HACKING NOW!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <div className="countdown-label">Hackathon starts in</div>
      <div className="countdown-timer">
        <div className="countdown-unit">
          <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="countdown-name">Days</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-unit">
          <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="countdown-name">Hours</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-unit">
          <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="countdown-name">Mins</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-unit">
          <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="countdown-name">Secs</span>
        </div>
      </div>
    </div>
  );
}

// Schedule data
const schedule = [
  { time: '09:00', title: 'Gates Open', description: 'Arrival & Registration' },
  { time: '09:30', title: 'Kickoff', description: 'Welcome & Introduction' },
  { time: '10:00', title: 'Hacking Begins', description: 'Start building!' },
  { time: '12:30', title: 'Lunch', description: 'Food break' },
  { time: '16:00', title: 'First Round Judging', description: 'A judge visits each team for a quick pitch' },
  { time: '17:15', title: 'Top 5 Demos', description: 'Finalists present to all judges and participants' },
  { time: '18:30', title: 'Awards & Closing', description: 'Prize announcements' },
];

// Sponsors data
const sponsors = {
  title: [
    { 
      name: 'Cursor', 
      description: 'All participants get cursor credits for the hackathon',
      url: 'https://cursor.com',
      logo: '/logos/cursor_logo.png'
    }
  ],
  credit: [
    { 
      name: 'ElevenLabs', 
      url: 'https://elevenlabs.io',
      logo: '/logos/elevenlabs_logo.png'
    },
    { 
      name: 'Beyond Presence', 
      url: 'https://beyondpresence.ai',
      logo: '/logos/beyondpresence_light (2).svg'
    },
    { 
      name: 'Runpod', 
      url: 'https://runpod.io',
      logo: '/logos/runpod_logo.svg'
    },
  ],
  ecosystem: [
    { 
      name: 'Creators', 
      url: 'https://creators-ecosystem.de/',
      logo: '/logos/CREATORS-Logo-transparent-e1728380007105.png'
    },
    { 
      name: 'Bildungsinitiative Deutschland', 
      url: 'https://bildungsinitiative-deutschland.de',
      logo: '/logos/bildungsinitiative.svg'
    },
  ]
};

// Prizes data
const prizes = [
  { name: 'Cursor', icon: '✨', description: 'Premium credits' },
  { name: 'ElevenLabs', icon: '🎙️', description: 'API credits' },
  { name: 'Runpod', icon: '🚀', description: 'GPU credits' },
];

// Contact info
const contacts = [
  { name: 'Sachin Agrawal', role: 'Host', email: 'sachin@aicollective.com' },
  { name: 'Michael Aechtler', role: 'Host', email: '' },
];

function InfoPage() {
  return (
    <div className="info-page">
      {/* Header */}
      <header className="info-header">
        <div className="info-header-content">
          <div className="event-badge">Cursor Community</div>
          <h1 className="event-title">Cursor Hackathon Stuttgart</h1>
          <div className="event-meta">
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <span>Epplestraße 225/Haus 3, 1st Floor</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>Saturday, January 24, 2026</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              <span>Teams of 2-4 people</span>
            </div>
          </div>
          <CountdownTimer />
          <Link to="/checkin" className="cta-button">
            Check In Now →
          </Link>
        </div>
      </header>

      {/* Schedule Section */}
      <section className="info-section">
        <div className="section-container">
          <h2 className="section-title">Schedule</h2>
          <div className="schedule-timeline">
            {schedule.map((item, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-time">{item.time}</div>
                <div className="schedule-marker">
                  <div className="schedule-dot"></div>
                  {index < schedule.length - 1 && <div className="schedule-line"></div>}
                </div>
                <div className="schedule-content">
                  <h3 className="schedule-title">{item.title}</h3>
                  <p className="schedule-desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="info-section tracks-section">
        <div className="section-container">
          <h2 className="section-title">Tracks</h2>
          <div className="tracks-grid">
            <div className="track-card">
              <div className="track-icon">🤖</div>
              <h3>Robust AI Agents</h3>
              <p>Build robust AI agents to automate mundane tasks, do research or handle a workflow of your choice.</p>
            </div>
            <div className="track-card">
              <div className="track-icon">🎮</div>
              <h3>Games & Entertainment</h3>
              <p>Create a game or entertainment experience with the help of AI.</p>
            </div>
            <div className="track-card">
              <div className="track-icon">🚀</div>
              <h3>Open Track</h3>
              <p>Build a project of your choice. Use cursor credits to hack together that MVP you keep putting off.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="info-section sponsors-section">
        <div className="section-container">
          <h2 className="section-title">Sponsors</h2>
          
          <div className="sponsor-tier">
            <h3 className="tier-label">Title Sponsor</h3>
            <div className="sponsor-cards title-tier">
              {sponsors.title.map((sponsor, index) => (
                <a 
                  key={index} 
                  href={sponsor.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="sponsor-card sponsor-title"
                >
                  {sponsor.logo && (
                    <img 
                      src={sponsor.logo} 
                      alt={`${sponsor.name} logo`} 
                      className="sponsor-logo sponsor-logo-title"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <span className="sponsor-name">{sponsor.name}</span>
                  {sponsor.description && (
                    <span className="sponsor-desc">{sponsor.description}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div className="sponsor-tier">
            <h3 className="tier-label">Credit Sponsors</h3>
            <div className="sponsor-cards credit-tier">
              {sponsors.credit.map((sponsor, index) => (
                <a 
                  key={index} 
                  href={sponsor.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="sponsor-card sponsor-credit"
                >
                  {sponsor.logo && (
                    <img 
                      src={sponsor.logo} 
                      alt={`${sponsor.name} logo`} 
                      className="sponsor-logo sponsor-logo-credit"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <span className="sponsor-name">{sponsor.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="sponsor-tier">
            <h3 className="tier-label">Ecosystem Partners</h3>
            <div className="sponsor-cards ecosystem-tier">
              {sponsors.ecosystem.map((sponsor, index) => (
                <a 
                  key={index} 
                  href={sponsor.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="sponsor-card sponsor-ecosystem"
                >
                  {sponsor.logo && (
                    <img 
                      src={sponsor.logo} 
                      alt={`${sponsor.name} logo`} 
                      className="sponsor-logo sponsor-logo-ecosystem"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <span className="sponsor-name">{sponsor.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="info-section prizes-section">
        <div className="section-container">
          <h2 className="section-title">Prizes</h2>
          <div className="prizes-header">
            <div className="prize-total">
              <span className="prize-amount">$4,000+</span>
              <span className="prize-label">in prizes</span>
            </div>
          </div>
          <div className="prizes-grid">
            {prizes.map((prize, index) => (
              <div key={index} className="prize-card">
                <div className="prize-icon">{prize.icon}</div>
                <h3 className="prize-name">{prize.name}</h3>
                <p className="prize-desc">{prize.description}</p>
              </div>
            ))}
          </div>
          <p className="prizes-note">Winners receive credits from our amazing sponsors!</p>
        </div>
      </section>

      {/* Contacts Section */}
      <section className="info-section contacts-section">
        <div className="section-container">
          <h2 className="section-title">Contacts</h2>
          <div className="contacts-grid">
            {contacts.map((contact, index) => (
              <div key={index} className="contact-card">
                <div className="contact-avatar">{contact.name.charAt(0)}</div>
                <div className="contact-info">
                  <h3 className="contact-name">{contact.name}</h3>
                  <p className="contact-role">{contact.role}</p>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="contact-email">
                      {contact.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="info-cta-footer">
        <div className="section-container">
          <h2>Ready to build something amazing?</h2>
          <p>Check in to get your Cursor credits and start hacking!</p>
          <Link to="/checkin" className="cta-button cta-large">
            Check In Now →
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="info-section quick-links-section">
        <div className="section-container">
          <div className="quick-links">
            <Link to="/judge" className="quick-link">
              <span className="quick-link-icon">⚖️</span>
              <span className="quick-link-text">Judge Portal</span>
            </Link>
            <Link to="/vote" className="quick-link">
              <span className="quick-link-icon">🗳️</span>
              <span className="quick-link-text">Vote for Teams</span>
            </Link>
            <Link to="/rankings" className="quick-link">
              <span className="quick-link-icon">🏆</span>
              <span className="quick-link-text">View Rankings</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="info-footer">
        <p>Cursor Hackathon Stuttgart • Epplestraße 225/Haus 3, 1st Floor</p>
      </footer>
    </div>
  );
}

export default InfoPage;

