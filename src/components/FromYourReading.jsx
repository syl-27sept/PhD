import { useState } from 'react';
import exampleQuotes from '../data/exampleQuotes';

function selectRandomQuote(quotes) {
  if (!quotes.length) {
    return null;
  }

  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getPaperUrl(paperUrl) {
  if (typeof paperUrl !== 'string' || !paperUrl.trim()) {
    return null;
  }

  const value = paperUrl.trim();
  const doi = value.match(/^(?:doi:\s*)?(10\.\d{4,9}\/\S+)$/i);

  if (doi) {
    return `https://doi.org/${doi[1].split('/').map(encodeURIComponent).join('/')}`;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function FromYourReading({ quotes = exampleQuotes }) {
  const [quote] = useState(() => selectRandomQuote(quotes));
  const paperUrl = quote ? getPaperUrl(quote.paperUrl || quote.doi) : null;

  return (
    <article className="card dashboard-card dashboard-reading-card">
      <div className="card-head">
        <h2>From your reading</h2>
      </div>

      {quote ? (
        <>
          <blockquote className="reading-quote">{quote.quote}</blockquote>
          <p className="reading-attribution">
            {quote.authors} · {quote.year}
          </p>
          <p className="reading-paper-title">{quote.paperTitle}</p>
          {paperUrl && (
            <a className="reading-paper-link" href={paperUrl} target="_blank" rel="noreferrer">
              View paper <span aria-hidden="true">↗</span>
            </a>
          )}
        </>
      ) : (
        <p className="empty reading-empty">No quotations available yet.</p>
      )}

    </article>
  );
}

export default FromYourReading;
