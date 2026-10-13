import { useState } from 'react';
import { ArrowLeft, Baby, Plus, Save, ShieldCheck, Trash2, UsersRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { makeId, readList, writeList } from '../data/localStore.js';

const emptyForm = {
  preferredName: '',
  dateOfBirth: '',
  allergies: '',
  dietaryRestrictions: '',
  communicationPreferences: '',
  emergencyContacts: [{ name: '', relationship: '', phone: '' }],
  careInstructions: '',
};

function toList(value) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function fromList(value = []) {
  return value.join(', ');
}

function toForm(child) {
  return {
    preferredName: child.preferredName ?? '',
    dateOfBirth: child.dateOfBirth ?? '',
    allergies: fromList(child.allergies),
    dietaryRestrictions: fromList(child.dietaryRestrictions),
    communicationPreferences: fromList(child.communicationPreferences),
    emergencyContacts: child.emergencyContacts?.length
      ? child.emergencyContacts.map((contact) => ({ ...contact }))
      : [{ name: '', relationship: '', phone: '' }],
    careInstructions: child.careInstructions ?? '',
  };
}

function toPayload(form) {
  return {
    preferredName: form.preferredName.trim(),
    dateOfBirth: form.dateOfBirth,
    allergies: toList(form.allergies),
    dietaryRestrictions: toList(form.dietaryRestrictions),
    communicationPreferences: toList(form.communicationPreferences),
    emergencyContacts: form.emergencyContacts
      .filter((contact) => contact.name.trim() || contact.relationship.trim() || contact.phone.trim())
      .map((contact) => ({
        name: contact.name.trim(),
        relationship: contact.relationship.trim(),
        phone: contact.phone.trim(),
      })),
    careInstructions: form.careInstructions.trim(),
  };
}

function getAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed = today.getMonth() > birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age;
}

function Field({ label, ...props }) {
  return (
    <label className="form-label">
      {label}
      <input className="form-input" {...props} />
    </label>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <label className="form-label">
      {label}
      <textarea className="form-input min-h-24 resize-y" {...props} />
    </label>
  );
}

function ChildForm({ child, busy, onCancel, onSave }) {
  const [form, setForm] = useState(() => child ? toForm(child) : emptyForm);
  const [error, setError] = useState('');

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updateContact(index, event) {
    setForm((current) => ({
      ...current,
      emergencyContacts: current.emergencyContacts.map((contact, contactIndex) => (
        contactIndex === index ? { ...contact, [event.target.name]: event.target.value } : contact
      )),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await onSave(toPayload(form));
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <form className="child-form" onSubmit={submit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{child ? 'UPDATE FAMILY PROFILE' : 'ADD TO YOUR FAMILY'}</p>
          <h2>{child ? 'Edit child profile' : 'Create child profile'}</h2>
        </div>
        <button aria-label="Close form" className="icon-button" onClick={onCancel} type="button"><X size={18} /></button>
      </div>
      <div className="child-form-grid">
        <Field autoComplete="off" label="Preferred name" maxLength={100} name="preferredName" onChange={update} required value={form.preferredName} />
        <Field label="Date of birth" name="dateOfBirth" onChange={update} type="date" value={form.dateOfBirth} />
        <TextAreaField label="Allergies (separate with commas)" name="allergies" onChange={update} placeholder="For example: peanuts, bee stings" value={form.allergies} />
        <TextAreaField label="Dietary restrictions (separate with commas)" name="dietaryRestrictions" onChange={update} placeholder="For example: vegetarian, lactose-free" value={form.dietaryRestrictions} />
        <TextAreaField label="Communication preferences (separate with commas)" name="communicationPreferences" onChange={update} placeholder="For example: visual reminders, extra transition time" value={form.communicationPreferences} />
        <TextAreaField label="Care instructions" name="careInstructions" onChange={update} placeholder="Anything else a trusted caregiver should know" value={form.careInstructions} />
      </div>
      <fieldset className="emergency-fieldset">
        <legend>Emergency contact</legend>
        <p>Add one or more trusted contacts. Leave blank rows empty.</p>
        <div className="space-y-3">
          {form.emergencyContacts.map((contact, index) => (
            <div className="child-form-grid contact-grid" key={`contact-${index}`}>
              <Field autoComplete="off" label={`Contact ${index + 1} name`} name="name" onChange={(event) => updateContact(index, event)} value={contact.name} />
              <Field autoComplete="off" label="Relationship" name="relationship" onChange={(event) => updateContact(index, event)} value={contact.relationship} />
              <div className="flex items-end gap-2">
                <Field autoComplete="tel" label="Phone" name="phone" onChange={(event) => updateContact(index, event)} type="tel" value={contact.phone} />
                {form.emergencyContacts.length > 1 && (
                  <button aria-label={`Remove emergency contact ${index + 1}`} className="icon-button mb-0.5" onClick={() => setForm((current) => ({ ...current, emergencyContacts: current.emergencyContacts.filter((_, contactIndex) => contactIndex !== index) }))} type="button"><Trash2 size={15} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
        {form.emergencyContacts.length < 10 && (
          <button className="inline-flex items-center gap-1 text-xs font-semibold text-sage-deep" onClick={() => setForm((current) => ({ ...current, emergencyContacts: [...current.emergencyContacts, { name: '', relationship: '', phone: '' }] }))} type="button"><Plus size={14} /> Add another contact</button>
        )}
      </fieldset>
      <p className="privacy-note"><ShieldCheck size={16} aria-hidden="true" /> Profile details are stored in this browser only. Anyone using this browser profile can view them.</p>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <button className="button-secondary" onClick={onCancel} type="button">Cancel</button>
        <button className="primary-button inline-flex items-center gap-2" disabled={busy} type="submit"><Save size={16} />{busy ? 'Saving…' : child ? 'Save changes' : 'Save child profile'}</button>
      </div>
    </form>
  );
}

function ChildCard({ child, onEdit, onDelete, busy }) {
  const age = getAge(child.dateOfBirth);
  const careSummary = [
    child.allergies?.length ? `Allergies: ${child.allergies.join(', ')}` : null,
    child.dietaryRestrictions?.length ? `Dietary needs: ${child.dietaryRestrictions.join(', ')}` : null,
  ].filter(Boolean);

  return (
    <article className="child-profile-card">
      <div className="flex items-start gap-3">
        <span className="child-avatar"><Baby size={22} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate">{child.preferredName}</h2>
          <p>{age === null ? 'Age not provided' : `${age} ${age === 1 ? 'year' : 'years'} old`}</p>
        </div>
        <button aria-label={`Edit ${child.preferredName}'s profile`} className="icon-button" onClick={() => onEdit(child)} type="button">Edit</button>
      </div>
      <div className="child-card-details">
        <p>{careSummary.length ? careSummary.join(' · ') : 'No allergy or dietary notes added.'}</p>
        {child.communicationPreferences?.length > 0 && <p>Communication: {child.communicationPreferences.join(', ')}</p>}
        {child.emergencyContacts?.length > 0 && <p>Emergency contact{child.emergencyContacts.length === 1 ? '' : 's'}: {child.emergencyContacts.map((contact) => `${contact.name} (${contact.relationship})`).join(', ')}</p>}
        {child.careInstructions && <p>Care instructions: {child.careInstructions}</p>}
      </div>
      <div className="child-card-footer">
        <span><ShieldCheck size={14} aria-hidden="true" /> Saved on this device</span>
        <button aria-label={`Delete ${child.preferredName}'s profile`} className="delete-button" disabled={busy} onClick={() => onDelete(child)} type="button"><Trash2 size={15} /> Delete</button>
      </div>
    </article>
  );
}

export default function ChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState(() => readList(user.id, 'children'));
  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingChild, setEditingChild] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function loadChildren() {
    setError('');
    try {
      setChildren(readList(user.id, 'children'));
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  function saveChild(profile) {
    setBusy(true);
    try {
      const isEditing = Boolean(editingChild);
      const child = { ...profile, id: editingChild?.id ?? makeId() };
      const updated = isEditing
        ? children.map((entry) => entry.id === child.id ? child : entry)
        : [child, ...children];
      writeList(user.id, 'children', updated);
      setChildren(updated);
      setEditingChild(null);
      setFormOpen(false);
      setNotice(isEditing ? 'Child profile updated.' : 'Child profile saved.');
    } catch (saveError) {
      throw new Error(`Could not save this profile in browser storage: ${saveError.message}`);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(child) {
    setEditingChild(child);
    setFormOpen(true);
    setNotice('');
  }

  function removeChild(child) {
    if (!window.confirm(`Delete ${child.preferredName}’s profile? This cannot be undone.`)) return;
    setBusy(true);
    setError('');
    try {
      const updated = children.filter((entry) => entry.id !== child.id);
      writeList(user.id, 'children', updated);
      setChildren(updated);
      setNotice(`${child.preferredName}’s profile was deleted.`);
    } catch (deleteError) {
      setError(`Could not delete this profile from browser storage: ${deleteError.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="children-page">
      <Link className="back-link" to="/dashboard"><ArrowLeft size={16} aria-hidden="true" /> Back to overview</Link>
      <div className="children-page-heading">
        <div>
          <p className="eyebrow">YOUR FAMILY SPACE</p>
          <h1>My children</h1>
          <p>Keep the details that help your family feel understood and cared for.</p>
        </div>
        {!formOpen && <button className="primary-button inline-flex items-center gap-2" onClick={() => { setEditingChild(null); setFormOpen(true); setNotice(''); }} type="button"><Plus size={17} /> Add child</button>}
      </div>

      <div className="child-privacy-banner">
        <ShieldCheck size={19} aria-hidden="true" />
        <p><strong>Profiles stay in this browser.</strong> Family details are not encrypted or synced. Avoid adding sensitive information on a shared device.</p>
      </div>
      {notice && <p className="success-notice" role="status">{notice}</p>}
      {error && <div className="auth-error flex items-center justify-between gap-4" role="alert"><span>{error}</span><button className="font-semibold underline" onClick={loadChildren} type="button">Try again</button></div>}
      {formOpen && <ChildForm busy={busy} child={editingChild} onCancel={() => { setFormOpen(false); setEditingChild(null); }} onSave={saveChild} />}

      {loading ? (
        <div className="children-loading" role="status"><span className="loading-pulse" /> Loading your children…</div>
      ) : children.length ? (
        <section className="children-grid" aria-label="Child profiles">
          {children.map((child) => <ChildCard busy={busy} child={child} key={child.id} onDelete={removeChild} onEdit={startEdit} />)}
        </section>
      ) : !formOpen ? (
        <section className="children-empty">
          <span className="child-avatar"><UsersRound size={22} aria-hidden="true" /></span>
          <h2>Your family profiles will live here.</h2>
          <p>Add a child profile to keep care preferences and important details together. You choose what to share with a caregiver when a booking is available.</p>
          <button className="button-secondary" onClick={() => setFormOpen(true)} type="button"><Plus size={16} /> Add a child profile</button>
        </section>
      ) : null}
    </div>
  );
}
