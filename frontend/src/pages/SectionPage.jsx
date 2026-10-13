import { useState } from 'react';
import { AlertTriangle, ArrowLeft, CalendarDays, Heart, MapPin, MessageCircle, Phone, Plus, Save, Trash2, UsersRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { makeId, readList, writeList } from '../data/localStore.js';

const directory = {
  caregivers: [
    { name: 'Maya Patel', specialty: 'Infant and toddler care', detail: '8 years’ experience · CPR trained' },
    { name: 'Jordan Lee', specialty: 'After-school support', detail: '6 years’ experience · homework help' },
    { name: 'Sam Rivera', specialty: 'Flexible family care', detail: '10 years’ experience · weekend availability' },
  ],
  therapists: [
    { name: 'Dr. Asha Rao', specialty: 'Child and family therapist', detail: 'Play-based support · ages 4–12' },
    { name: 'Morgan Chen, LMFT', specialty: 'Family counsellor', detail: 'Communication and transitions' },
    { name: 'Alex Kim, LCSW', specialty: 'Parenting support', detail: 'Stress, routines, and caregiver wellbeing' },
  ],
};

const sectionDetails = {
  'common-ground': ['Common Ground', 'A private place to pause, reflect, and save a thought for later.', 'Reflection'],
  therapists: ['Find a therapist', 'Explore sample profiles and save a local appointment request.', 'Directory'],
  community: ['Parent community', 'Write a note for your own browser. Posts are not shared with other people.', 'Community'],
  caregivers: ['Find childcare', 'Explore sample caregiver profiles and save a local care request.', 'Directory'],
  bookings: ['My bookings', 'Review and update care requests saved in this browser.', 'Bookings'],
  subscription: ['Subscription', 'Choose a plan to see how it would look. No payment is collected or subscription started.', 'Subscription'],
  settings: ['Settings', 'Update the local profile used in this browser.', 'Settings'],
  sos: ['SOS childcare', 'Save a request, then tap to call or text a trusted person. This page cannot dispatch help.', 'SOS childcare'],
  requests: ['Care requests', 'Review requests saved to this browser profile.', 'Requests'],
  'trust-profile': ['Trust profile', 'Keep a local caregiver introduction. No identity checks or TrustScore verification are performed.', 'Trust profile'],
  availability: ['Availability', 'Save the hours you would like to show in your local profile.', 'Availability'],
  sessions: ['My sessions', 'Review locally saved appointment requests.', 'Sessions'],
  profile: ['Professional profile', 'Manage a local professional introduction for this website.', 'Professional profile'],
};

function useCollection(userId, name) {
  const [items, setItems] = useState(() => readList(userId, name));
  function replace(next) {
    writeList(userId, name, next);
    setItems(next);
  }
  return [items, replace];
}

function LocalNotice() {
  return <p className="local-notice">Information is saved only in this browser. It is not shared, synced, or sent to a service.</p>;
}

function ListItems({ items, onRemove, emptyText }) {
  return items.length ? (
    <div className="local-record-list">
      {items.map((item) => (
        <article className="local-record" key={item.id}>
          <div><h3>{item.title}</h3><p>{item.detail}</p>{item.date && <small>{item.date}</small>}{item.status && <small>{item.status}</small>}</div>
          {onRemove && <button aria-label={`Delete ${item.title}`} className="icon-button" onClick={() => onRemove(item.id)} type="button"><Trash2 size={16} /></button>}
        </article>
      ))}
    </div>
  ) : <p className="local-empty">{emptyText}</p>;
}

export default function SectionPage() {
  const { section } = useParams();
  const { user, updateProfile } = useAuth();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', detail: '', date: '', time: '', location: '', childId: '', name: user.name, email: user.email, specialty: '', start: '09:00', end: '17:00', day: 'Monday' });
  const [records, saveRecords] = useCollection(user.id, section === 'community' ? 'communityPosts' : section === 'common-ground' ? 'reflections' : section === 'availability' ? 'availability' : section === 'trust-profile' || section === 'profile' ? 'professionalProfile' : 'careRequests');
  const [requests, saveRequests] = useCollection(user.id, 'careRequests');
  const [children] = useState(() => readList(user.id, 'children'));
  const [contacts, saveContacts] = useCollection(user.id, 'emergencyContacts');
  const [subscription, setSubscription] = useState(() => readList(user.id, 'subscription'));
  const [contactForm, setContactForm] = useState({ name: '', relationship: '', phone: '' });
  const detail = sectionDetails[section] ?? ['Your Nurturely space', 'Manage information saved in this browser.', 'Local workspace'];

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  function saveRecord(record, collection = records, save = saveRecords) {
    try {
      const next = [record, ...collection];
      save(next);
      setNotice('Saved on this device.');
      setError('');
      return true;
    } catch (saveError) {
      setError(`Could not save this item: ${saveError.message}`);
      return false;
    }
  }

  function createRequest(provider, type = 'Care request') {
    const request = {
      id: makeId(),
      title: `${type}: ${provider}`,
      detail: form.detail.trim() || 'No additional details provided.',
      date: form.date,
      status: 'Saved locally',
    };
    const saved = saveRecord(request, requests, saveRequests);
    if (!saved) return;
    setForm((current) => ({ ...current, detail: '', date: '' }));
  }

  function saveEmergencyContact(event) {
    event.preventDefault();
    const name = contactForm.name.trim();
    const phone = contactForm.phone.trim();
    if (!name || !/^\+?[0-9][0-9\s().-]{5,19}$/.test(phone)) {
      setError('Enter a contact name and a valid phone number.');
      return;
    }
    const contact = {
      id: makeId(),
      name,
      relationship: contactForm.relationship.trim(),
      phone,
    };
    try {
      saveContacts([contact, ...contacts]);
      setContactForm({ name: '', relationship: '', phone: '' });
      setNotice('Emergency contact saved on this device.');
      setError('');
    } catch (saveError) {
      setError(`Could not save this contact: ${saveError.message}`);
    }
  }

  function removeContact(id) {
    try {
      saveContacts(contacts.filter((contact) => contact.id !== id));
      setNotice('Emergency contact removed.');
      setError('');
    } catch (removeError) {
      setError(`Could not remove this contact: ${removeError.message}`);
    }
  }

  function saveSosRequest(event) {
    event.preventDefault();
    const child = children.find((entry) => entry.id === form.childId);
    const parts = [
      child ? `Child: ${child.preferredName}` : '',
      form.date ? `Date needed: ${form.date}` : '',
      form.time ? `Time needed: ${form.time}` : '',
      form.location.trim() ? `Location: ${form.location.trim()}` : '',
      form.detail.trim(),
    ].filter(Boolean);
    if (!parts.length) {
      setError('Add a child, date, location, or care details before saving the request.');
      return;
    }
    const request = {
      id: makeId(),
      title: 'SOS childcare request',
      detail: parts.join('\n'),
      date: form.date,
      status: 'Saved on this device · not sent',
    };
    const saved = saveRecord(request, requests, saveRequests);
    if (!saved) return;
    setForm((current) => ({ ...current, childId: '', date: '', time: '', location: '', detail: '' }));
  }

  function submit(event) {
    event.preventDefault();
    setNotice('');
    if (section === 'settings') {
      const name = form.name.trim();
      const email = form.email.trim().toLowerCase();
      if (!name || !email) {
        setError('Name and email are required.');
        return;
      }
      try {
        updateProfile({ name, email });
        setNotice('Your local profile was updated.');
      } catch (saveError) {
        setError(`Could not update your profile: ${saveError.message}`);
      }
      return;
    }
    if (section === 'availability') {
      saveRecord({ id: makeId(), title: form.day, detail: `${form.start}–${form.end}` });
      return;
    }
    if (section === 'trust-profile' || section === 'profile') {
      if (!form.title.trim()) {
        setError('Add a short introduction before saving.');
        return;
      }
      if (!saveRecord({ id: makeId(), title: form.title.trim(), detail: form.specialty.trim() })) return;
      setForm((current) => ({ ...current, title: '', specialty: '' }));
      return;
    }
    if (!form.title.trim() && section !== 'sos') {
      setError(section === 'common-ground' ? 'Add a reflection before saving.' : 'Add a message before saving.');
      return;
    }
    if (section === 'sos' || section === 'community') {
      const record = { id: makeId(), title: form.title.trim(), detail: form.detail.trim(), date: form.date };
      if (!saveRecord(record)) return;
      setForm((current) => ({ ...current, title: '', detail: '', date: '' }));
      return;
    }
    if (!saveRecord({ id: makeId(), title: form.title.trim(), detail: form.detail.trim() })) return;
    setForm((current) => ({ ...current, title: '', detail: '' }));
  }

  function removeRecord(id) {
    const collection = section === 'sos' || section === 'bookings' || section === 'requests' || section === 'sessions'
      ? requests
      : records;
    const save = section === 'sos' || section === 'bookings' || section === 'requests' || section === 'sessions'
      ? saveRequests
      : saveRecords;
    try {
      save(collection.filter((item) => item.id !== id));
      setNotice('Removed from this browser.');
    } catch (removeError) {
      setError(`Could not remove this item: ${removeError.message}`);
    }
  }

  const isDirectory = section === 'caregivers' || section === 'therapists';
  const showRequests = ['bookings', 'requests', 'sessions'].includes(section);
  const trustedContacts = [
    ...contacts.map((contact) => ({ ...contact, source: 'Saved contact', removable: true })),
    ...children.flatMap((child) => (child.emergencyContacts ?? []).map((contact, index) => ({
      ...contact,
      id: `child-${child.id}-${index}`,
      source: `${child.preferredName}’s profile`,
      removable: false,
    }))),
  ].filter((contact) => typeof contact.phone === 'string'
    && /^\+?\d{6,15}$/.test(contact.phone.replace(/[^\d+]/g, '')));

  return (
    <div className="local-feature-page">
      <Link className="back-link" to="/dashboard"><ArrowLeft size={16} aria-hidden="true" /> Back to overview</Link>
      <header className="local-feature-heading">
        <span className="dashboard-card-icon"><UsersRound size={19} aria-hidden="true" /></span>
        <p className="eyebrow">{detail[2]}</p>
        <h1>{detail[0]}</h1>
        <p>{detail[1]}</p>
      </header>
      {section !== 'sos' && <LocalNotice />}
      {notice && <p className="success-notice" role="status">{notice}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}

      {isDirectory && (
        <section className="local-directory" aria-label={`${detail[0]} sample profiles`}>
          {directory[section].map((person) => (
            <article className="local-directory-card" key={person.name}>
              <span className="child-avatar"><Heart size={20} aria-hidden="true" /></span>
              <h2>{person.name}</h2><strong>{person.specialty}</strong><p>{person.detail}</p>
              <label className="form-label">Preferred date<input className="form-input" name="date" onChange={update} type="date" value={form.date} /></label>
              <label className="form-label">Note<textarea className="form-input" name="detail" onChange={update} placeholder="What kind of support are you looking for?" value={form.detail} /></label>
              <button className="primary-button" onClick={() => createRequest(person.name, section === 'therapists' ? 'Appointment request' : 'Care request')} type="button">Save request</button>
            </article>
          ))}
        </section>
      )}

      {section === 'subscription' && (
        <section className="local-directory">
          {['Starter', 'Family', 'Village'].map((plan) => (
            <article className="local-directory-card" key={plan}><h2>{plan}</h2><p>{plan === 'Starter' ? 'A calm place to organize your family support.' : plan === 'Family' ? 'More room for routines, reflections, and care planning.' : 'A fuller set of tools for your growing support circle.'}</p><button className="button-secondary" onClick={() => { try { const selected = [{ id: 'selected-plan', title: plan }]; writeList(user.id, 'subscription', selected); setSubscription(selected); setNotice(`${plan} selected. No payment was taken.`); setError(''); } catch (saveError) { setError(`Could not save your selection: ${saveError.message}`); } }} type="button">{subscription[0]?.title === plan ? 'Selected on this device' : 'Choose plan'}</button></article>
          ))}
        </section>
      )}

      {section === 'settings' && (
        <form className="local-form" onSubmit={submit}>
          <label className="form-label">Display name<input className="form-input" name="name" onChange={update} required value={form.name} /></label>
          <label className="form-label">Email address<input className="form-input" name="email" onChange={update} required type="email" value={form.email} /></label>
          <button className="primary-button" type="submit"><Save size={16} /> Save profile</button>
        </form>
      )}

      {section === 'availability' && (
        <form className="local-form" onSubmit={submit}>
          <label className="form-label">Day<select className="form-input" name="day" onChange={update} value={form.day}>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day}>{day}</option>)}</select></label>
          <label className="form-label">From<input className="form-input" name="start" onChange={update} type="time" value={form.start} /></label>
          <label className="form-label">Until<input className="form-input" name="end" onChange={update} type="time" value={form.end} /></label>
          <button className="primary-button" type="submit"><Save size={16} /> Save availability</button>
        </form>
      )}

      {section === 'sos' && (
        <section className="sos-workspace" aria-labelledby="sos-request-heading">
          <div className="sos-safety-note" role="note"><AlertTriangle size={19} aria-hidden="true" /><p><strong>If anyone is in immediate danger, contact your local emergency services now.</strong> This page saves requests on this device only and cannot alert caregivers or dispatch emergency help.</p></div>
          {trustedContacts.length > 0 && (
            <section className="sos-contacts" aria-labelledby="sos-contacts-heading">
              <div><p className="eyebrow">YOUR TRUSTED PEOPLE</p><h2 id="sos-contacts-heading">Call or text a contact</h2></div>
              <div className="sos-contact-list">
                {trustedContacts.map((contact) => {
                  const number = contact.phone.replace(/[^\d+]/g, '');
                  return (
                    <article className="sos-contact-card" key={contact.id}>
                      <div><h3>{contact.name}</h3><p>{[contact.relationship, contact.phone, contact.source].filter(Boolean).join(' · ')}</p></div>
                      <a aria-label={`Call ${contact.name}`} className="button-secondary sos-contact-action" href={`tel:${number}`}><Phone size={15} /> Call</a>
                      <a aria-label={`Text ${contact.name}`} className="button-secondary sos-contact-action" href={`sms:${number}`}><MessageCircle size={15} /> Text</a>
                      {contact.removable && <button aria-label={`Remove ${contact.name}`} className="icon-button" onClick={() => removeContact(contact.id)} type="button"><Trash2 size={15} /></button>}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
          <form className="local-form sos-contact-form" onSubmit={saveEmergencyContact}>
            <h2>Add a trusted contact</h2>
            <p>Save a person you can call or text when you need childcare help. Contacts from your child profiles also appear here.</p>
            <label className="form-label">Name<input autoComplete="name" className="form-input" name="name" onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))} required value={contactForm.name} /></label>
            <label className="form-label">Relationship<input className="form-input" name="relationship" onChange={(event) => setContactForm((current) => ({ ...current, relationship: event.target.value }))} placeholder="For example: family member" value={contactForm.relationship} /></label>
            <label className="form-label">Phone number<input autoComplete="tel" className="form-input" name="phone" onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))} required type="tel" value={contactForm.phone} /></label>
            <button className="button-secondary" type="submit"><Plus size={15} /> Save trusted contact</button>
          </form>
          <form className="local-form sos-request-form" onSubmit={saveSosRequest}>
            <h2 id="sos-request-heading">Save a childcare request</h2>
            {children.length > 0 && <label className="form-label">Child<select className="form-input" name="childId" onChange={update} value={form.childId}><option value="">Choose a child (optional)</option>{children.map((child) => <option key={child.id} value={child.id}>{child.preferredName}</option>)}</select></label>}
            <div className="sos-form-grid">
              <label className="form-label">Date needed<input className="form-input" min={new Date().toISOString().slice(0, 10)} name="date" onChange={update} type="date" value={form.date ?? ''} /></label>
              <label className="form-label">Time needed<input className="form-input" name="time" onChange={update} type="time" value={form.time ?? ''} /></label>
            </div>
            <label className="form-label"><MapPin size={14} /> Location<input autoComplete="street-address" className="form-input" name="location" onChange={update} placeholder="Area or address (optional)" value={form.location ?? ''} /></label>
            <label className="form-label">What childcare support do you need?<textarea className="form-input min-h-24 resize-y" name="detail" onChange={update} placeholder="Add useful details, such as duration or care needs." value={form.detail} /></label>
            <button className="primary-button" type="submit"><Plus size={16} /> Save childcare request</button>
          </form>
          <section className="sos-saved-requests" aria-label="Saved childcare requests"><h2>Saved requests</h2><ListItems emptyText="No childcare requests saved yet." items={requests.filter((request) => request.title.startsWith('SOS childcare'))} onRemove={removeRecord} /></section>
        </section>
      )}

      {(section === 'common-ground' || section === 'community') && (
        <form className="local-form" onSubmit={submit}>
          {section !== 'sos' && <label className="form-label">{section === 'common-ground' ? 'Reflection title' : 'Post title'}<input className="form-input" maxLength={100} name="title" onChange={update} required value={form.title} /></label>}
          <label className="form-label">{section === 'common-ground' ? 'Your reflection' : 'Your note'}<textarea className="form-input min-h-24 resize-y" name="detail" onChange={update} placeholder="Write a note for yourself…" required={section !== 'common-ground'} value={form.detail} /></label>
          <button className="primary-button" type="submit"><Plus size={16} />{section === 'common-ground' ? 'Save reflection' : 'Save post'}</button>
        </form>
      )}

      {(section === 'trust-profile' || section === 'profile') && (
        <form className="local-form" onSubmit={submit}>
          <label className="form-label">Introduction<input className="form-input" maxLength={120} name="title" onChange={update} placeholder="A little about you" value={form.title} /></label>
          <label className="form-label">Experience or focus<textarea className="form-input" name="specialty" onChange={update} placeholder="Experience, qualifications, and areas of support" value={form.specialty} /></label>
          <button className="primary-button" type="submit"><Save size={16} /> Save profile details</button>
          {section === 'trust-profile' && <p className="local-notice">This site cannot verify qualifications or calculate a TrustScore.</p>}
        </form>
      )}

      {section === 'subscription' && <p className="local-notice"><CalendarDays size={15} /> Plans are examples only. There is no billing or payment processing.</p>}
      {section === 'community' && records.length > 0 && <h2 className="local-list-heading"><MessageCircle size={17} /> Your saved notes</h2>}
      {section === 'community' && <ListItems emptyText="" items={records} onRemove={removeRecord} />}
      {section === 'common-ground' && <ListItems emptyText="Your saved reflections will appear here." items={records} onRemove={removeRecord} />}
      {section === 'availability' && <ListItems emptyText="No availability has been saved yet." items={records} onRemove={removeRecord} />}
      {(section === 'trust-profile' || section === 'profile') && <ListItems emptyText="Your introduction will appear here after you save it." items={records} onRemove={removeRecord} />}
      {showRequests && <ListItems emptyText="No requests have been saved in this browser." items={requests} onRemove={removeRecord} />}
    </div>
  );
}
