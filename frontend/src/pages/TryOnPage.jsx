import React, { useEffect, useState } from 'react';
import './TryOnPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TryOnPage = ({ onBack }) => {
  const [personFile, setPersonFile] = useState(null);
  const [garmentFile, setGarmentFile] = useState(null);
  const [personPreview, setPersonPreview] = useState('');
  const [garmentPreview, setGarmentPreview] = useState('');
  const [resultImage, setResultImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!personFile) {
      setPersonPreview('');
      return;
    }
    const url = URL.createObjectURL(personFile);
    setPersonPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [personFile]);

  useEffect(() => {
    if (!garmentFile) {
      setGarmentPreview('');
      return;
    }
    const url = URL.createObjectURL(garmentFile);
    setGarmentPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [garmentFile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResultImage('');

    if (!personFile || !garmentFile) {
      setError('Please upload both a person photo and a garment photo.');
      return;
    }

    const formData = new FormData();
    formData.append('person', personFile);
    formData.append('garment', garmentFile);

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/tryon`, {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || 'Try-on request failed.');
      }

      const image = payload?.data?.imageBase64 || payload?.data?.imageUrl || '';
      if (!image) {
        throw new Error('Try-on completed, but no image was returned.');
      }

      setResultImage(image);
    } catch (err) {
      setError(err.message || 'Try-on request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPersonFile(null);
    setGarmentFile(null);
    setResultImage('');
    setError('');
  };

  return (
    <div className="tryon-page">
      <div className="tryon-shell">
        <header className="tryon-header">
          <div>
            <p className="tryon-eyebrow">AI Virtual Try-On</p>
            <h1>Generate a try-on look in seconds</h1>
            <p className="tryon-subtitle">
              Upload a person photo and a garment photo. We will send them to the AI and return a generated try-on image.
            </p>
          </div>
          <button type="button" className="tryon-link" onClick={() => onBack?.()}>
            Back to store
          </button>
        </header>

        <div className="tryon-grid">
          <form className="tryon-card" onSubmit={handleSubmit}>
            <h2>1. Upload images</h2>
            <label className="tryon-upload">
              <span>Person photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setPersonFile(event.target.files?.[0] || null)}
              />
            </label>
            {personPreview && (
              <img className="tryon-preview" src={personPreview} alt="Person preview" />
            )}

            <label className="tryon-upload">
              <span>Garment photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setGarmentFile(event.target.files?.[0] || null)}
              />
            </label>
            {garmentPreview && (
              <img className="tryon-preview" src={garmentPreview} alt="Garment preview" />
            )}

            {error && <p className="tryon-error">{error}</p>}

            <div className="tryon-actions">
              <button className="tryon-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Generating...' : 'Generate Try-On'}
              </button>
              <button className="tryon-secondary" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
            <p className="tryon-hint">Max file size: 10MB per image. Supported: JPG, PNG, WEBP.</p>
          </form>

          <section className="tryon-card tryon-result">
            <h2>2. Result</h2>
            {resultImage ? (
              <img className="tryon-result-image" src={resultImage} alt="Generated try-on result" />
            ) : (
              <div className="tryon-placeholder">
                <p>Your generated try-on image will appear here.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TryOnPage;
