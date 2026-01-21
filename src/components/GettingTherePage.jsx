import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const GOOGLE_MAPS_VENUE_URL = 'https://maps.app.goo.gl/9YwHBNKwrjxBfY437';
const UBAHN_LANDHAUS_URL = 'https://maps.app.goo.gl/n1QUnHU5ZHNXTmq97';
const BUS_STERNHAULE_URL = 'https://maps.app.goo.gl/iDVFnrwJpHycnZnA6';
const PARKING_URL = 'https://maps.app.goo.gl/GebjCiEgaAQGAEBb7';

function GettingTherePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="info-page getting-there-page">
      {/* Header */}
      <header className="getting-there-header">
        <div className="section-container">
          <Link to="/" className="back-link">
            ← Back to Event Info
          </Link>
          <h1 className="getting-there-title">Getting There</h1>
          <p className="getting-there-subtitle">
            Cursor Hackathon Stuttgart
          </p>
          <a 
            href={GOOGLE_MAPS_VENUE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="venue-address-box"
          >
            <span className="address-icon">📍</span>
            <div className="address-details">
              <strong>Epplestraße 225 / Haus 3</strong>
              <span>1st Floor, 70567 Stuttgart</span>
            </div>
            <span className="address-maps-badge">
              <span>🗺️</span> Maps
            </span>
          </a>
        </div>
      </header>

      {/* Transit Options */}
      <section className="info-section transit-section">
        <div className="section-container">
          <h2 className="section-title">How to Get There</h2>
          
          <div className="transit-options">
            {/* Bus Stop */}
            <div className="transit-card transit-card-primary">
              <div className="transit-icon">🚌</div>
              <div className="transit-info">
                <h3>Bus: Sternhäule</h3>
                <p className="transit-distance">Right in front of the venue</p>
              </div>
              <a 
                href={BUS_STERNHAULE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="maps-icon-button"
                title="Open in Google Maps"
              >
                <span className="maps-icon-emoji">🗺️</span>
                <span className="maps-icon-text">Maps</span>
              </a>
            </div>

            {/* U-Bahn */}
            <div className="transit-card">
              <div className="transit-icon">🚇</div>
              <div className="transit-info">
                <h3>U-Bahn: Landhaus</h3>
                <p className="transit-distance">7 minute walk to venue</p>
              </div>
              <a 
                href={UBAHN_LANDHAUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="maps-icon-button"
                title="Open in Google Maps"
              >
                <span className="maps-icon-emoji">🗺️</span>
                <span className="maps-icon-text">Maps</span>
              </a>
            </div>

            {/* Parking */}
            <div className="transit-card">
              <div className="transit-icon">🅿️</div>
              <div className="transit-info">
                <h3>Free Parking</h3>
                <p className="transit-distance">Parking available at the venue</p>
              </div>
              <a 
                href={PARKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="maps-icon-button"
                title="Open in Google Maps"
              >
                <span className="maps-icon-emoji">🗺️</span>
                <span className="maps-icon-text">Maps</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Entrance Photo Section */}
      <section className="info-section entrance-section">
        <div className="section-container">
          <h2 className="section-title">The Entrance</h2>
          <p className="entrance-description">
            Look for the <strong>HAUS 3</strong> entrance with glass doors. Go to the <strong>1st Floor</strong>.
          </p>
          <div className="entrance-image-wrapper">
            <img 
              src="/logos/1000047988.jpg" 
              alt="HAUS 3 entrance - glass doors with HAUS 3 signage" 
              className="entrance-image"
            />
            <p className="entrance-caption">
              HAUS 3 entrance at Epplestraße 225
            </p>
          </div>
        </div>
      </section>

      {/* Back to main */}
      <section className="info-cta-footer">
        <div className="section-container">
          <h2>See you at the hackathon!</h2>
          <p>Don't forget to check in when you arrive</p>
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

export default GettingTherePage;
