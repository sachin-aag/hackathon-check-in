import { useState } from 'react';
import { Link } from 'react-router-dom';

const N8N_VOUCHER_CODE = '2026-COMMUNITY-HACKATON-STUTTGART-4BED8C02';

// Sponsor credits data
const sponsorCredits = [
  {
    name: 'Cursor',
    logo: '/logos/cursor_logo.png',
    icon: '✨',
    tagline: 'AI-powered code editor',
    instructions: [
      'Check in at the event to receive your unique credits code',
      'Your code will be displayed after completing the check-in form',
      'Go to cursor.com and sign in to your account',
      'Navigate to Settings → Billing',
      'Enter your credits code to redeem'
    ],
    note: 'Important: You must have a payment method on file in your Cursor account to redeem credits.',
    ctaText: 'Check In Now',
    ctaLink: '/checkin',
    highlight: true
  },
  {
    name: 'ElevenLabs',
    logo: '/logos/elevenlabs_logo.png',
    icon: '🎙️',
    tagline: 'AI voice technology',
    instructions: [
      'Join the ElevenLabs Discord server',
      'Gain access to the #🎟️│coupon-codes channel',
      'Click "Start Redemption"',
      'Select "Stuttgart Cursor Hackathon" from the list',
      'Fill out the form using your registered email',
      'The bot will send you your unique coupon code'
    ],
    links: [
      { label: 'Join Discord', url: 'https://discord.com/invite/VnBvbbcdEC' },
      { label: 'Video Tutorial', url: 'https://youtu.be/S143_JtCtV8' }
    ]
  },
  {
    name: 'Runpod',
    logo: '/logos/runpod_logo.svg',
    icon: '🚀',
    tagline: 'GPU cloud computing',
    instructions: [
      'Join our Discord server (link below)',
      'Go to the #runpod channel',
      'Request credits or ask Tim any GPU-related questions'
    ],
    note: 'Tim Pietrusky from RunPod is available remotely on Discord to help with credits and questions!',
    links: [
      { label: 'Join Discord', url: 'https://discord.gg/Z2XXbeXPpn' }
    ]
  },
  {
    name: 'Beyond Presence',
    logo: '/logos/beyondpresence_light (2).svg',
    icon: '🤖',
    tagline: 'AI agents for real-time conversations',
    instructions: [
      'Join the Beyond Presence Discord community',
      'Check the welcome message for the current coupon code',
      'Try the demo agent to see what you can build'
    ],
    note: 'The coupon code is updated regularly in the Discord welcome message.',
    links: [
      { label: 'Join Discord', url: 'https://bey.dev/community' },
      { label: 'Try Demo Agent', url: 'https://bey.chat' }
    ]
  },
  {
    name: 'n8n',
    logo: '/logos/n8n_full_white_logo.png',
    icon: '⚡',
    tagline: 'Workflow automation platform',
    instructions: [
      'Visit the n8n voucher redemption page',
      'Sign in or create an n8n Cloud account',
      'Enter the voucher code below to redeem 1 month of n8n Cloud Pro'
    ],
    voucherCode: N8N_VOUCHER_CODE,
    links: [
      { label: 'Redeem Voucher', url: 'https://n8n.notion.site/voucher-code' }
    ]
  }
];

function CreditsPage() {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyVoucher = (code, sponsorName) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(sponsorName);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="info-page credits-page">
      {/* Header */}
      <header className="credits-header">
        <div className="section-container">
          <Link to="/" className="back-link">← Back to Event Info</Link>
          <h1 className="credits-title">Sponsor Credits</h1>
          <p className="credits-subtitle">
            Get free credits from our amazing sponsors to power your hackathon projects
          </p>
        </div>
      </header>

      {/* Credits Cards */}
      <section className="info-section">
        <div className="section-container">
          <div className="credits-grid">
            {sponsorCredits.map((sponsor, index) => (
              <div 
                key={index} 
                className={`credit-card ${sponsor.highlight ? 'credit-card-highlight' : ''}`}
              >
                <div className="credit-card-header">
                  {sponsor.logo && (
                    <img 
                      src={sponsor.logo} 
                      alt={`${sponsor.name} logo`} 
                      className="credit-sponsor-logo"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <div className="credit-sponsor-info">
                    <h3>{sponsor.icon} {sponsor.name}</h3>
                    <span className="credit-tagline">{sponsor.tagline}</span>
                  </div>
                </div>

                <div className="credit-card-body">
                  <h4>How to Redeem:</h4>
                  <ol className="credit-steps">
                    {sponsor.instructions.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>

                  {sponsor.note && (
                    <div className="credit-note">
                      <span className="note-icon">ℹ️</span>
                      <span>{sponsor.note}</span>
                    </div>
                  )}

                  {sponsor.voucherCode && (
                    <div className="credit-voucher-section">
                      <div className="credit-voucher-label">Voucher Code:</div>
                      <div className="credit-voucher-code">
                        <code>{sponsor.voucherCode}</code>
                        <button 
                          onClick={() => handleCopyVoucher(sponsor.voucherCode, sponsor.name)}
                          className="copy-voucher-btn"
                          title="Copy voucher code"
                        >
                          {copiedCode === sponsor.name ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {sponsor.links && (
                    <div className="credit-links">
                      {sponsor.links.map((link, linkIndex) => (
                        <a 
                          key={linkIndex}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="credit-link-button"
                        >
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  )}

                  {sponsor.ctaLink && (
                    <Link to={sponsor.ctaLink} className="credit-cta-button">
                      {sponsor.ctaText} →
                    </Link>
                  )}

                  {sponsor.qrCodes && (
                    <div className="qr-codes-section">
                      <h4>Scan to Access:</h4>
                      <div className="qr-codes-grid">
                        {sponsor.qrCodes.map((qr, qrIndex) => (
                          <div key={qrIndex} className="qr-code-item">
                            <div className="qr-code-wrapper">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qr.url)}&bgcolor=1a1a3e&color=ffffff`}
                                alt={`QR code for ${qr.label}`}
                                className="qr-code-image"
                              />
                            </div>
                            <div className="qr-code-label">{qr.label}</div>
                            <div className="qr-code-description">{qr.description}</div>
                            <a 
                              href={qr.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="qr-code-link"
                            >
                              {qr.url.replace('https://', '')}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="info-cta-footer">
        <div className="section-container">
          <h2>Ready to start building?</h2>
          <p>Check in to get your Cursor credits and join the hackathon!</p>
          <Link to="/checkin" className="cta-button cta-large">
            Check In Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="info-footer">
        <p>Cursor Hackathon Stuttgart • Epplestraße 225/Haus 3, 1st Floor</p>
      </footer>
    </div>
  );
}

export default CreditsPage;

