import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Hackathon start date: January 24, 2026, 9:00 AM CET
const HACKATHON_START = new Date('2026-01-24T09:00:00+01:00');
const HACKATHON_END = new Date('2026-01-24T18:30:00+01:00');

// Event details for calendar
const EVENT_DETAILS = {
  title: 'Cursor Hackathon Stuttgart',
  location: 'Epplestrasse 225/Haus 3, 1st Floor, Stuttgart',
  url: 'https://stuttgarthack.netlify.app',
  description: `Cursor Hackathon Stuttgart - Build something amazing with AI!

Location: Epplestrasse 225/Haus 3, 1st Floor

Schedule:
- 09:00 Gates Open (Arrival & Registration)
- 09:30 Kickoff (Welcome & Introduction)
- 10:00 Hacking Begins (Start building!)
- 12:30 Lunch (Food break)
- 16:00 First Round Judging
- 17:15 Top 5 Demos
- 18:30 Awards & Closing

More info: https://stuttgarthack.netlify.app`
};

// Calendar URL generators
function generateGoogleCalendarUrl() {
  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENT_DETAILS.title,
    dates: `${formatDate(HACKATHON_START)}/${formatDate(HACKATHON_END)}`,
    details: EVENT_DETAILS.description,
    location: EVENT_DETAILS.location,
    ctz: 'Europe/Berlin'
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateOutlookUrl() {
  const formatDate = (date) => date.toISOString();
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: EVENT_DETAILS.title,
    startdt: formatDate(HACKATHON_START),
    enddt: formatDate(HACKATHON_END),
    body: EVENT_DETAILS.description,
    location: EVENT_DETAILS.location
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function generateICSContent() {
  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const escapeText = (text) => text.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cursor Hackathon Stuttgart//EN
BEGIN:VEVENT
UID:${Date.now()}@stuttgarthack.netlify.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(HACKATHON_START)}
DTEND:${formatDate(HACKATHON_END)}
SUMMARY:${EVENT_DETAILS.title}
DESCRIPTION:${escapeText(EVENT_DETAILS.description)}
LOCATION:${EVENT_DETAILS.location}
URL:${EVENT_DETAILS.url}
END:VEVENT
END:VCALENDAR`;
}

function downloadICS() {
  const content = generateICSContent();
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cursor-hackathon-stuttgart.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Add to Calendar Component
function AddToCalendarButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(), '_blank');
    setIsOpen(false);
  };

  const handleOutlook = () => {
    window.open(generateOutlookUrl(), '_blank');
    setIsOpen(false);
  };

  const handleDownloadICS = () => {
    downloadICS();
    setIsOpen(false);
  };

  return (
    <div className="calendar-button-container" ref={dropdownRef}>
      <button 
        className="calendar-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="calendar-icon">📅</span>
        <span>Add to Calendar</span>
        <span className={`calendar-arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </button>
      
      {isOpen && (
        <div className="calendar-dropdown">
          <button className="calendar-option" onClick={handleGoogleCalendar}>
            <span className="option-icon">📆</span>
            <span>Google Calendar</span>
          </button>
          <button className="calendar-option" onClick={handleOutlook}>
            <span className="option-icon">📧</span>
            <span>Outlook</span>
          </button>
          <button className="calendar-option" onClick={handleDownloadICS}>
            <span className="option-icon">⬇️</span>
            <span>Download .ics</span>
          </button>
        </div>
      )}
    </div>
  );
}

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
          <div className="schedule-calendar-action">
            <AddToCalendarButton />
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

      {/* How to Get Sponsor Credits Section */}
      <section className="info-section credits-info-section">
        <div className="section-container">
          <h2 className="section-title">How to Get Sponsor Credits</h2>
          <p className="credits-intro">
            All participants can claim free credits from our sponsors. Here's how to redeem each one:
          </p>
          
          {/* Top row: Cursor and Runpod */}
          <div className="credits-info-row credits-info-row-top">
            {/* Cursor */}
            <div className="credit-info-card credit-info-highlight">
              <div className="credit-info-header">
                <img src="/logos/cursor_logo.png" alt="Cursor" className="credit-info-logo" />
                <h3>Cursor</h3>
              </div>
              <p>Your credits code will be shown after completing check-in.</p>
              <div className="credit-info-note">
                <span>⚠️</span> Payment method required on your Cursor account to redeem.
              </div>
              <Link to="/checkin" className="credit-info-cta">Check In Now →</Link>
            </div>

            {/* Runpod */}
            <div className="credit-info-card">
              <div className="credit-info-header">
                <img src="/logos/runpod_logo.svg" alt="Runpod" className="credit-info-logo" />
                <h3>Runpod</h3>
              </div>
              <p>Contact <strong>Tim Pietrusky</strong> at the event to receive your GPU credits.</p>
              <p className="credit-info-helper">Tim will be available throughout the hackathon!</p>
            </div>
          </div>

          {/* Bottom row: ElevenLabs and Beyond Presence */}
          <div className="credits-info-row credits-info-row-bottom">
            {/* ElevenLabs */}
            <div className="credit-info-card">
              <div className="credit-info-header">
                <img src="/logos/elevenlabs_logo.png" alt="ElevenLabs" className="credit-info-logo" />
                <h3>ElevenLabs</h3>
              </div>
              <ol className="credit-info-steps">
                <li>Join Discord & access #🎟️│coupon-codes</li>
                <li>Click "Start Redemption"</li>
                <li>Select "Stuttgart Cursor Hackathon"</li>
                <li>Bot sends your code!</li>
              </ol>
              <div className="credit-info-links">
                <a href="https://discord.com/invite/VnBvbbcdEC" target="_blank" rel="noopener noreferrer">Join Discord</a>
                <a href="https://youtu.be/S143_JtCtV8" target="_blank" rel="noopener noreferrer">Video Tutorial</a>
              </div>
            </div>

            {/* Beyond Presence */}
            <div className="credit-info-card">
              <div className="credit-info-header">
                <img src="/logos/beyondpresence_light (2).svg" alt="Beyond Presence" className="credit-info-logo" />
                <h3>Beyond Presence</h3>
              </div>
              <p>Join their Discord to find the coupon code in the welcome message.</p>
              <div className="credit-info-links">
                <a href="https://bey.dev/community" target="_blank" rel="noopener noreferrer">Join Discord</a>
                <a href="https://bey.chat" target="_blank" rel="noopener noreferrer">Try Demo Agent</a>
              </div>
            </div>
          </div>

          <div className="credits-more-info">
            <Link to="/credits" className="credits-more-link">
              View Full Redemption Guide →
            </Link>
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
            <Link to="/credits" className="quick-link">
              <span className="quick-link-icon">🎁</span>
              <span className="quick-link-text">Sponsor Credits</span>
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

