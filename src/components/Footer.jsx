export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap">
        <span>© {year} Krit Shrestha</span>
        <span>Built as a readable system, not a brochure.</span>
      </div>
    </footer>
  );
}
