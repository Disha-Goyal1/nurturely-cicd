import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUp, Clock3, MessageCircle, Plus, Sparkles, Trash2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { makeId, readList, writeList } from '../data/localStore.js';

const prompts = [
  'How can I handle a disagreement with my child?',
  'I’m feeling overwhelmed by parenting.',
  'How can I make bedtime feel calmer?',
  'Help me prepare for a difficult conversation.',
];

function getReflection(message, childName) {
  const lower = message.toLowerCase();
  const opening = childName ? `You mentioned ${childName}. ` : '';
  if (/\b(hurt|harm|suicid|danger|unsafe|abuse|violence)\b/.test(lower)) {
    return {
      safety: true,
      content: 'I’m glad you reached out. This reflection tool cannot assess safety or provide emergency support. If anyone may be in immediate danger, contact your local emergency number or a trusted person now.',
    };
  }
  if (/overwhelm|stress|exhaust|tired|burn.?out/.test(lower)) {
    return { content: `${opening}That sounds like a lot to carry. If it feels manageable, pause for one slow breath and name one small thing that would make the next hour easier. Is there someone you trust who could help with one practical task?` };
  }
  if (/sleep|bed|night|routine/.test(lower)) {
    return { content: `${opening}Routines often work best when they are simple and predictable. You might choose one calming cue to repeat each evening, then adjust gently based on what your family responds to. What part of bedtime feels hardest right now?` };
  }
  if (/disagree|argu|conflict|communicat|conversation/.test(lower)) {
    return { content: `${opening}It can help to slow the moment down: listen first, reflect what you heard, then share one clear feeling or need. You do not have to solve everything at once. What would you most like your child to understand?` };
  }
  return { content: `${opening}Thank you for sharing that. Try looking at the moment with curiosity rather than judgment: what might your child be needing, and what support do you need too? A small next step is enough. What feels most important to focus on?` };
}

function ChatHistory({ conversations, activeId, onNew, onSelect, onClear }) {
  return (
    <aside className="chat-history" aria-label="Saved reflections">
      <div className="chat-history-header"><span>Saved conversations</span></div>
      <button className="new-chat-button" onClick={onNew} type="button"><Plus size={16} /> New reflection</button>
      <div className="history-list">
        {conversations.map((conversation) => (
          <button aria-current={conversation.id === activeId ? 'true' : undefined} className={`history-item${conversation.id === activeId ? ' history-item-active' : ''}`} key={conversation.id} onClick={() => onSelect(conversation.id)} type="button">
            <MessageCircle size={15} aria-hidden="true" /><span><strong>{conversation.title}</strong><small>{conversation.updatedAt}</small></span>
          </button>
        ))}
      </div>
      {!conversations.length && <p className="history-empty">Your saved reflections will appear here.</p>}
      {conversations.length > 0 && <button className="clear-history-button" onClick={onClear} type="button"><Trash2 size={14} /> Clear history</button>}
      <div className="history-privacy"><span>Saved in this browser only.</span></div>
    </aside>
  );
}

export default function AiSupportPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(() => readList(user.id, 'reflections-chat'));
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [useChildContext, setUseChildContext] = useState(false);
  const [childId, setChildId] = useState('');
  const [error, setError] = useState('');
  const transcriptRef = useRef(null);
  const textareaRef = useRef(null);
  const children = readList(user.id, 'children');

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  function save(next) {
    writeList(user.id, 'reflections-chat', next);
    setConversations(next);
  }

  function newConversation() {
    setConversationId(null);
    setMessages([]);
    setDraft('');
    textareaRef.current?.focus();
  }

  function clearHistory() {
    if (!window.confirm('Clear all saved reflections from this browser?')) return;
    save([]);
    setConversationId(null);
    setMessages([]);
  }

  function openConversation(id) {
    const conversation = conversations.find((entry) => entry.id === id);
    if (!conversation) return;
    setConversationId(id);
    setMessages(conversation.messages);
  }

  function sendMessage(rawMessage = draft) {
    const content = rawMessage.trim();
    if (!content) return;
    const selectedChild = useChildContext ? children.find((child) => child.id === childId) : null;
    const response = getReflection(content, selectedChild?.preferredName);
    const id = conversationId ?? makeId();
    const existing = conversations.find((conversation) => conversation.id === id);
    const conversation = {
      id,
      title: existing?.title ?? (content.length > 55 ? `${content.slice(0, 52).trimEnd()}…` : content),
      updatedAt: new Date().toLocaleString(),
      messages: [...(existing?.messages ?? messages), { role: 'user', content }, { role: 'assistant', content: response.content, safety: response.safety }],
    };
    try {
      save([conversation, ...conversations.filter((entry) => entry.id !== id)].slice(0, 30));
      setConversationId(id);
      setMessages(conversation.messages);
      setDraft('');
      setError('');
      textareaRef.current?.focus();
    } catch (saveError) {
      setError(`Could not save this reflection: ${saveError.message}`);
    }
  }

  return (
    <div className="ai-support-page">
      <div className="ai-page-heading">
        <div><p className="eyebrow">A SUPPORTIVE SPACE TO REFLECT</p><h1>Guided family reflection</h1><p>Try simple prompts to think through parenting moments, at your own pace.</p></div>
        <span className="preview-badge">GUIDED RESPONSES · NOT AI</span>
      </div>
      <p className="local-notice">Responses are guided prompts, not AI or professional advice. Your messages stay in this browser and are not sent to a server.</p>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="ai-workspace">
        <ChatHistory conversations={conversations} activeId={conversationId} onClear={clearHistory} onNew={newConversation} onSelect={openConversation} />
        <section className="chat-panel" aria-label="Guided family reflection">
          <div className="chat-transcript" aria-live="polite" aria-relevant="additions text" ref={transcriptRef}>
            {messages.length ? (
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <article className={`chat-message ${message.role === 'assistant' ? 'chat-message-assistant' : 'chat-message-user'}`} key={`${conversationId}-${index}`}>
                    <span className={`chat-avatar ${message.role === 'assistant' ? 'assistant-avatar' : 'user-avatar'}`} aria-hidden="true">{message.role === 'assistant' ? <Sparkles size={16} /> : <UserRound size={16} />}</span>
                    <div className="chat-message-body"><p className="chat-sender">{message.role === 'assistant' ? 'Nurturely · guided reflection' : 'You'}</p><div className={`chat-bubble ${message.role === 'assistant' ? 'assistant-bubble' : 'user-bubble'}`}><p>{message.content}</p></div>
                      {message.safety && <div className="safety-callout" role="alert"><div className="safety-callout-heading"><AlertTriangle size={17} /> Please get real-world support</div><p>If anyone may be in immediate danger, contact your local emergency services or a trusted person. This reflection tool cannot assess emergencies.</p><Link className="safety-therapist-link" to="/app/therapists">Explore sample support profiles</Link></div>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="chat-welcome"><span className="chat-welcome-icon"><Sparkles size={21} /></span><p className="eyebrow">A GENTLE PLACE TO PAUSE</p><h2>What’s on your mind today?</h2><p>Choose a prompt or write a short note to receive a prewritten reflection.</p><div className="suggested-prompts">{prompts.map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)} type="button">{prompt}<ArrowUp size={13} /></button>)}</div></div>
            )}
          </div>
          <div className="chat-composer-area">
            {children.length > 0 && <label className="context-toggle"><input checked={useChildContext} onChange={(event) => setUseChildContext(event.target.checked)} type="checkbox" /><span className="context-check" /><span>Use a child profile locally for a more personal prompt.</span></label>}
            {useChildContext && children.length > 0 && <label className="context-select-label">Child profile<select className="context-select" onChange={(event) => setChildId(event.target.value)} value={childId}><option value="">Select a child</option>{children.map((child) => <option key={child.id} value={child.id}>{child.preferredName}</option>)}</select></label>}
            <div className="chat-composer"><textarea aria-label="Your reflection" onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Write what’s on your mind…" ref={textareaRef} rows={2} value={draft} /><button aria-label="Save reflection" className="primary-button" disabled={!draft.trim()} onClick={() => sendMessage()} type="button"><ArrowUp size={18} /></button></div>
            <p className="composer-footnote"><Clock3 size={13} /> Saved locally · not a crisis service</p>
          </div>
        </section>
      </div>
    </div>
  );
}
