import { ArrowRight, Baby, CalendarDays, Heart, LifeBuoy, MessageCircle, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { readList } from '../data/localStore.js';

const roleDetails = {
  parent: {
    eyebrow: 'YOUR FAMILY SPACE',
    focus: 'Care, guidance, and your next small step.',
    subtitle: 'A simple place to organize family notes, care requests, and reflections.',
    cards: [
      ['My children', 'Save family profiles and care notes on this device.', '/app/children', Baby],
      ['AI Family Companion', 'Try a guided, rule-based parenting reflection tool.', '/app/ai-support', Sparkles],
      ['Find childcare', 'Explore sample profiles and save a local care request.', '/app/caregivers', UsersRound],
      ['Find a therapist', 'Explore sample support profiles and save a request.', '/app/therapists', Heart],
      ['Parent community', 'Write and save personal notes in this browser.', '/app/community', MessageCircle],
      ['SOS childcare', 'Save a request and call or text a trusted contact.', '/app/sos', LifeBuoy],
    ],
  },
  caregiver: {
    eyebrow: 'CAREGIVER SPACE',
    focus: 'A thoughtful place for your care work.',
    subtitle: 'Manage your local profile, availability, and care requests.',
    cards: [
      ['Care requests', 'Review requests saved to your local profile.', '/app/requests', LifeBuoy],
      ['Trust profile', 'Manage a local introduction; no verification is performed.', '/app/trust-profile', Heart],
      ['My bookings', 'Review your saved local requests.', '/app/bookings', CalendarDays],
      ['Availability', 'Save your availability in this browser.', '/app/availability', CalendarDays],
    ],
  },
  therapist: {
    eyebrow: 'THERAPIST SPACE',
    focus: 'A calm workspace for support.',
    subtitle: 'Manage your local profile, availability, and appointment requests.',
    cards: [
      ['Session requests', 'Review appointment requests saved in this browser.', '/app/requests', MessageCircle],
      ['My sessions', 'Review your locally saved sessions.', '/app/sessions', CalendarDays],
      ['Availability', 'Save your availability in this browser.', '/app/availability', CalendarDays],
      ['Professional profile', 'Manage your local professional introduction.', '/app/profile', Heart],
    ],
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const details = roleDetails[user.role] ?? roleDetails.parent;
  const children = user.role === 'parent' ? readList(user.id, 'children') : [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow">{details.eyebrow}</p>
          <h1>Welcome, {user.name.split(' ')[0]}.</h1>
          <p className="dashboard-subtitle">{details.subtitle}</p>
        </div>
        {user.role === 'parent' && <Link className="sos-button" to="/app/sos"><LifeBuoy size={18} aria-hidden="true" /> SOS childcare</Link>}
      </div>

      <section className="welcome-panel">
        <div className="welcome-panel-copy">
          <span className="welcome-overline"><span className="welcome-dot" /> YOUR NURTURELY SPACE</span>
          <h2>{details.focus}</h2>
          <p>Your account profile is stored on the app server; family profiles and saved entries stay in this browser and do not sync to other devices.</p>
        </div>
        <div className="welcome-art" aria-hidden="true"><span className="welcome-orb" /><span className="welcome-leaf leaf-a" /><span className="welcome-leaf leaf-b" /><span className="welcome-leaf leaf-c" /><span className="welcome-sun" /></div>
      </section>

      {user.role === 'parent' && (
        <section className="dashboard-summary" aria-label="Family summary">
          <Baby size={19} aria-hidden="true" />
          <span>{children.length ? `${children.length} child profile${children.length === 1 ? '' : 's'} saved on this device.` : 'Add a family profile to keep care notes together.'}</span>
          <Link className="card-link" to="/app/children">Manage profiles<ArrowRight size={15} /></Link>
        </section>
      )}

      <div className="section-title-row"><div><h2>Your tools</h2><p>Choose a space to get started.</p></div><span className="preview-badge">ON THIS DEVICE</span></div>
      <section className="dashboard-grid" aria-label="Nurturely tools">
        {details.cards.map(([title, description, to, Icon]) => (
          <article className="dashboard-card" key={to}>
            <span className="dashboard-card-icon"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
            <h2>{title}</h2><p>{description}</p>
            <Link className="card-link" to={to}>Open<ArrowRight size={15} aria-hidden="true" /></Link>
          </article>
        ))}
      </section>
      <p className="dashboard-footnote">Sample directory profiles are fictional. Requests, bookings, payments, and emergency alerts are not sent to other people.</p>
    </div>
  );
}
