import ShortenerForm from './ShortenerForm';

export default function Home() {
  return (
    <div className="home-container">
      <h1>URL Shortener</h1>
      <p>Paste your long URL to make it short and sweet</p>
      <ShortenerForm />
    </div>
  );
}