import React from 'react';
import { 
  FaFilm, 
  FaUsers, 
  FaTicketAlt, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone, 
  FaCrown, 
  FaVolumeUp, 
  FaTv, 
  FaCouch, 
  FaUtensils, 
  FaStar,
  FaShieldAlt,
  FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AboutUs.css';

const AboutUs = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaTv />,
      title: "4K Laser Projection",
      desc: "Crystal-clear high-frame-rate visuals with true-black contrast and vibrant HDR color spectrums."
    },
    {
      icon: <FaVolumeUp />,
      title: "Dolby Atmos Acoustics",
      desc: "Multi-dimensional spatial sound that flows dynamically around and above you for total immersion."
    },
    {
      icon: <FaCouch />,
      title: "Ultra-Plush VIP Recliners",
      desc: "Zero-gravity heated leather seating with generous legroom and personal swivel side-tables."
    },
    {
      icon: <FaUtensils />,
      title: "Gourmet Concessions",
      desc: "Artisan popcorn flavors, handcrafted mocktails, warm pastries, and freshly brewed barista coffee."
    }
  ];

  const stats = [
    { number: "10+", label: "Luxury Auditoriums", sub: "Equipped with Laser & Atmos" },
    { number: "500K+", label: "Happy Moviegoers", sub: "And counting each month" },
    { number: "1,200+", label: "Blockbusters Screened", sub: "From Hollywood to Indie classics" },
    { number: "4.9 / 5", label: "Guest Satisfaction", sub: "Verified customer reviews" }
  ];

  const pillars = [
    {
      icon: <FaCrown />,
      title: "Unrivaled Luxury",
      desc: "Every detail from our velvet lobbies to private VIP lounges is tailored for the premier cinema enthusiast."
    },
    {
      icon: <FaFilm />,
      title: "Curated Storytelling",
      desc: "We bring the world's most captivating blockbusters, cult classics, and film festival premieres to our screens."
    },
    {
      icon: <FaShieldAlt />,
      title: "Seamless Booking",
      desc: "Frictionless digital ticketing, instant seat selection, and contactless entry powered by CineVora technology."
    }
  ];

  return (
    <div className="about-page">
      {/* ── Ambient Glows ── */}
      <div className="about-glow about-glow--top" />
      <div className="about-glow about-glow--right" />

      {/* ── Hero Section ── */}
      <section className="about-hero">
        <div className="about-hero-backdrop" />
        <div className="about-hero-inner">
          <div className="about-badge">
            <FaStar className="about-badge-star" />
            <span>NEXT-GEN CINEMATIC EXPERIENCE</span>
          </div>

          <h1 className="about-brand-title">
            <span className="about-title-cine">CINE</span>
            <span className="about-title-vora">VORA</span>
          </h1>

          <h2 className="about-hero-headline">
            Elevating Cinematic Storytelling To Extraordinary Heights
          </h2>

          <p className="about-hero-lead">
            Step into a world where cutting-edge technology meets unparalleled luxury. 
            CineVora redefines entertainment with immersive 4K laser projection, Dolby Atmos acoustics, 
            and VIP hospitality crafted for true film lovers.
          </p>

          <div className="about-hero-actions">
            <button className="about-btn about-btn--primary" onClick={() => navigate('/movies')}>
              <FaFilm /> Browse Now Showing
            </button>
            <a href="#experience" className="about-btn about-btn--ghost">
              Discover Experience <FaArrowRight size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Experience / Technology Grid ── */}
      <section className="about-section" id="experience">
        <div className="about-section-header">
          <span className="about-section-tag">THE CINEVORA STANDARD</span>
          <h2 className="about-section-heading">Engineered for Pure Immersion</h2>
          <p className="about-section-sub">
            We've built every auditorium from the ground up to deliver perfection in sound, vision, and comfort.
          </p>
        </div>

        <div className="experience-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="experience-card">
              <div className="experience-icon-wrap">
                {feat.icon}
              </div>
              <h3 className="experience-title">{feat.title}</h3>
              <p className="experience-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Story & Heritage ── */}
      <section className="about-story-section">
        <div className="about-story-grid">
          <div className="about-story-content">
            <span className="about-section-tag">OUR JOURNEY</span>
            <h2 className="about-story-heading">Where Passion Meets the Silver Screen</h2>
            <p className="about-story-p">
              Founded by lifelong cinephiles, CineVora was born out of a single dream: to restore the magic, 
              elegance, and wonder of the grand cinema experience in an age of home streaming.
            </p>
            <p className="about-story-p">
              From our flagship theater in Colombo to our growing network of digital halls, we combine 
              state-of-the-art audiovisual precision with old-world theater romance. Whether you're here 
              for opening-night midnight premieres or an intimate weekend matinee, we ensure every moment is memorable.
            </p>
            <div className="about-quote">
              <p>“Cinema is a matter of what's in the frame and what's out. At CineVora, we make sure everything inside is breathtaking.”</p>
            </div>
          </div>

          <div className="about-story-cards">
            <div className="story-stat-card story-stat-card--gold">
              <FaTicketAlt className="story-stat-icon" />
              <h4>100% Digital Ticketing</h4>
              <p>Instant seat selection, mobile QR e-tickets, and zero wait times at the gate.</p>
            </div>
            <div className="story-stat-card story-stat-card--red">
              <FaUsers className="story-stat-icon" />
              <h4>Community of Film Lovers</h4>
              <p>Special screenings, director Q&As, festival showcases, and member-only premieres.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="about-stats-section">
        <div className="about-stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="about-stat-item">
              <h3 className="about-stat-num">{stat.number}</h3>
              <p className="about-stat-label">{stat.label}</p>
              <span className="about-stat-sub">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Core Pillars ── */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-tag">OUR VALUES</span>
          <h2 className="about-section-heading">The Pillars of Our Experience</h2>
          <p className="about-section-sub">
            Our commitment to guest delight guides every showtime, every seat, and every interaction.
          </p>
        </div>

        <div className="pillars-grid">
          {pillars.map((p, idx) => (
            <div key={idx} className="pillar-card">
              <div className="pillar-icon-box">{p.icon}</div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact & Location ── */}
      <section className="about-contact-section">
        <div className="about-section-header">
          <span className="about-section-tag">CONNECT WITH US</span>
          <h2 className="about-section-heading">Visit CineVora Theaters</h2>
          <p className="about-section-sub">
            We are always here to make your visit extraordinary. Reach out to our concierge team.
          </p>
        </div>

        <div className="about-contact-grid">
          <div className="about-contact-card">
            <div className="contact-icon-bubble">
              <FaMapMarkerAlt />
            </div>
            <h3 className="contact-card-title">Flagship Location</h3>
            <p className="contact-card-text">
              123 Cinema Boulevard<br />
              Entertainment District<br />
              Colombo 03, Sri Lanka
            </p>
          </div>

          <div className="about-contact-card">
            <div className="contact-icon-bubble">
              <FaPhone />
            </div>
            <h3 className="contact-card-title">Hotline & Concierge</h3>
            <p className="contact-card-text">
              +94 11 234 5678<br />
              +94 77 123 4567<br />
              Daily: 9:00 AM – 11:30 PM
            </p>
          </div>

          <div className="about-contact-card">
            <div className="contact-icon-bubble">
              <FaEnvelope />
            </div>
            <h3 className="contact-card-title">Support & Inquiries</h3>
            <p className="contact-card-text">
              concierge@cinevora.com<br />
              support@cinevora.com<br />
              Prompt response within 2 hours
            </p>
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section className="about-cta-section">
        <div className="about-cta-box">
          <h2 className="about-cta-title">Ready For An Unforgettable Movie Night?</h2>
          <p className="about-cta-desc">
            Explore our curated lineup of blockbuster releases and book your favorite seats in seconds.
          </p>
          <button className="about-btn about-btn--primary about-btn--lg" onClick={() => navigate('/movies')}>
            <FaTicketAlt /> Book Your Tickets Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
