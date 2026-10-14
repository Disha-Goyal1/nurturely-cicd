import { ArrowDown, ArrowRight, HeartHandshake, LockKeyhole, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Sparkles, title: 'Understand', subtitle: 'Guided family reflection', color: 'lilac' },
  { icon: HeartHandshake, title: 'Connect', subtitle: 'Professional support', color: 'sage' },
  { icon: UsersRound, title: 'Belong', subtitle: 'Parent community', color: 'peach' },
  { icon: LockKeyhole, title: 'Find care', subtitle: 'Childcare when you need it', color: 'blue' },
];

function Brand() {
  return (
    <Link className="flex items-center gap-3" to="/" aria-label="Nurturely home">
      <span className="brand-mark" aria-hidden="true">n</span>
      <span>
        <span className="block text-[17px] font-semibold tracking-[-0.03em] text-ink">nurturely</span>
        <span className="block text-[10px] tracking-[0.11em] text-muted">AI FAMILY ECOSYSTEM</span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Brand />
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#childcare">Childcare</a>
            <a href="#support">Professional support</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link className="landing-signin" to="/login">Sign in</Link>
            <Link className="button-primary !px-4 !py-2.5 sm:!px-5" to="/register">Get started</Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A little support goes a long way</p>
          <h1>Parenting wasn’t meant to be <span>done alone.</span></h1>
          <p className="landing-lede">Keep family notes, explore sample care profiles, and reflect on parenting moments in one simple browser-based space.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="button-primary" to="/register">Get started <ArrowRight size={17} aria-hidden="true" /></Link>
            <a className="button-secondary" href="#features">Explore Nurturely <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted"><LockKeyhole size={14} aria-hidden="true" /> Your family’s privacy comes first.</p>
        </div>
        <div className="hero-art" aria-label="Illustration representing a family finding support">
          <div className="hero-art-orbit orbit-one" />
          <div className="hero-art-orbit orbit-two" />
          <div className="hero-plant plant-left"><i /><i /><i /><b /></div>
          <div className="hero-plant plant-right"><i /><i /><i /><b /></div>
          <div className="family-card">
            <div className="family-card-head">
              <div className="family-card-icon"><HeartHandshake size={20} aria-hidden="true" /></div>
              <span>YOUR FAMILY, SUPPORTED</span>
            </div>
            <div className="family-illustration" aria-hidden="true">
              <div className="sun-disc" />
              <div className="person person-parent"><span className="person-head" /><span className="person-body" /></div>
              <div className="person person-child"><span className="person-head" /><span className="person-body" /></div>
              <div className="person person-care"><span className="person-head" /><span className="person-body" /></div>
              <div className="illustration-ground" />
              <div className="floating-heart">♡</div>
            </div>
            <div className="family-card-foot">
              <span className="avatar-stack"><i>A</i><i>M</i><i>+</i></span>
              <span>A village that grows with you</span>
            </div>
          </div>
          <div className="floating-note note-top"><span className="note-icon lilac-bg"><Sparkles size={16} /></span><span><b>Guidance</b><small>At your own pace</small></span></div>
          <div className="floating-note note-bottom"><span className="note-icon sage-bg"><HeartHandshake size={16} /></span><span><b>Trusted care</b><small>When life happens</small></span></div>
        </div>
      </section>
      <p className="local-notice landing-local-notice">Family profiles and saved entries stay in this browser; account details are stored on the app server. Sample profiles and guided reflections are not connected to real services.</p>

      <section className="feature-section" id="features">
        <div className="section-heading">
          <p className="eyebrow justify-center">One connected family ecosystem</p>
          <h2>Support for the whole journey.</h2>
          <p>Practical care and thoughtful guidance, brought together in one place.</p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, subtitle, color }) => (
            <article className="feature-card" id={title === 'Find care' ? 'childcare' : title === 'Connect' ? 'support' : undefined} key={title}>
              <span className={`feature-icon ${color}`}><Icon size={20} strokeWidth={1.8} aria-hidden="true" /></span>
              <span className="feature-title">{title}</span>
              <p>{subtitle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-copy">
          <p className="eyebrow">A steadier way forward</p>
          <h2>Help for today.<br />A village for tomorrow.</h2>
          <p>Start with what your family needs right now. Nurturely brings your care circle, personal guidance, and family resources together as you grow.</p>
          <Link className="inline-link" to="/register">Find your starting point <ArrowRight size={16} /></Link>
        </div>
        <div className="how-steps">
          <article><span>01</span><div><h3>Make it yours</h3><p>Create a private space for your family’s needs and preferences.</p></div></article>
          <article><span>02</span><div><h3>Choose your support</h3><p>Explore care and guidance when you’re ready—at your own pace.</p></div></article>
          <article><span>03</span><div><h3>Feel less alone</h3><p>Build the right support around your family, one step at a time.</p></div></article>
        </div>
      </section>

      <section className="privacy-banner">
        <span className="privacy-icon"><LockKeyhole size={20} aria-hidden="true" /></span>
        <div><h2>Your family’s story belongs to you.</h2><p>Family profiles and saved entries are stored in this browser only. They are not encrypted, synced, or shared with real caregivers or professionals.</p></div>
        <Link className="inline-link" to="/register">Join Nurturely <ArrowRight size={16} /></Link>
      </section>

      <footer className="landing-footer">
        <Brand />
        <p>Thoughtful support for every step of parenting.</p>
        <span>© {new Date().getFullYear()} Nurturely</span>
      </footer>
    </main>
  );
}
