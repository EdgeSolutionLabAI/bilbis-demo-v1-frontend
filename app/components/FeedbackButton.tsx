'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api-client';

type FormState = 'idle' | 'submitting' | 'success';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleOpen() {
    setOpen(true);
    setFormState('idle');
    setErrorMessage(null);
    setValidationError(null);
    setMessage('');
    setEmail('');
  }

  function handleClose() {
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side validation — avoids a pointless round-trip for an empty message.
    if (!message.trim()) {
      setValidationError('Message is required.');
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setFormState('submitting');

    try {
      const result = await apiClient.submitFeedback({
        message: message.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
      });

      if (result.error) {
        setErrorMessage(result.error.message);
        setFormState('idle');
      } else {
        setFormState('success');
      }
    } catch {
      setErrorMessage('Network error — please try again.');
      setFormState('idle');
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
      >
        Send feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-base font-semibold mb-4">Send feedback</h2>

            {formState === 'success' ? (
              <div className="text-sm text-green-700">
                Thanks — your feedback was received!
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <label className="block text-sm font-medium mb-1" htmlFor="fb-message">
                  Message <span aria-hidden>*</span>
                </label>
                <textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setValidationError(null); }}
                  rows={4}
                  maxLength={1000}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's on your mind?"
                />
                {validationError && (
                  <p className="mt-1 text-xs text-red-600" role="alert">{validationError}</p>
                )}

                <label className="block text-sm font-medium mt-4 mb-1" htmlFor="fb-email">
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="fb-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />

                {errorMessage && (
                  <p className="mt-3 text-xs text-red-600" role="alert">{errorMessage}</p>
                )}

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="bg-blue-600 text-white text-sm rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formState === 'submitting' ? 'Sending…' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
