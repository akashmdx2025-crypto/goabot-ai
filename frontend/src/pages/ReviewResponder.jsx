import { useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';

export default function ReviewResponder() {
  const [review, setReview] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReply = async () => {
    if (!review.trim()) {
      toast.error('Please enter a review first');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/menu/review-reply', { reviewText: review });
      setReply(res.data.data.reply);
      toast.success('Reply generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate reply');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reply);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="page-content" id="review-responder-page">
      <div className="page-header">
        <div>
          <h1>Review Responder</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Generate AI-powered replies to customer reviews
          </p>
        </div>
      </div>

      <div className="review-container">
        {/* Input */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              Customer Review
            </h3>
            <textarea
              className="form-textarea"
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Paste a customer review here...&#10;&#10;Example: 'The food was amazing but the service was a bit slow. The fish curry was the best I've had in Goa!'"
              rows={8}
              id="input-review-text"
            />
            <button
              className="btn btn-primary"
              onClick={generateReply}
              disabled={loading || !review.trim()}
              style={{ marginTop: '1rem', width: '100%' }}
              id="btn-generate-reply"
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate Reply
                </>
              )}
            </button>
          </div>

          {/* Example reviews */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Try these examples:
            </h4>
            {[
              "Amazing sunset views! The food was decent but the cocktails were outstanding. Will definitely come back.",
              "Waited 45 minutes for our food. The fish curry was okay but not worth the wait. Staff needs to be more attentive.",
              "Best beach shack in North Goa! The prawn koliwada and sol kadhi are must-tries. Super friendly staff too!",
            ].map((ex, i) => (
              <button
                key={i}
                className="btn btn-ghost btn-sm"
                onClick={() => setReview(ex)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  marginBottom: '0.5rem', whiteSpace: 'normal', lineHeight: 1.4,
                  fontSize: '0.8rem', padding: '0.6rem 0.8rem',
                }}
              >
                "{ex.substring(0, 80)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="review-output">
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1rem',
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                <Sparkles size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--color-primary)' }} />
                AI-Generated Reply
              </h3>
              {reply && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={copyToClipboard} id="btn-copy-reply">
                    <Copy size={14} /> Copy
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={generateReply} disabled={loading}>
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
              )}
            </div>

            {reply ? (
              <div className="generated-text">{reply}</div>
            ) : (
              <div className="placeholder" style={{ padding: '2rem 0', textAlign: 'center' }}>
                <Sparkles size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>Your AI-generated reply will appear here</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Paste a review and click "Generate Reply"
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              💡 Tips
            </h4>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ The AI generates professional, friendly responses</li>
              <li>✓ Addresses both positive and negative feedback</li>
              <li>✓ Uses your business name for personalization</li>
              <li>✓ Copy and paste directly to Google/TripAdvisor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
