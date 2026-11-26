import { Palette } from 'lucide-react';
import { AmbientPlayer } from './AmbientPlayer';

export function Navbar({ paletteName, onCyclePalette }) {
  return (
    <header className="bar">
      <nav className="wrap" aria-label="Primary navigation">
        <a className="brand" href="#top">
          <span className="mark">KS</span>
          <span>
            Krit Shrestha
            <br />
            <small>systems &amp; signals</small>
          </span>
        </a>

        <div className="nav">
          <a href="#systems">Technical Systems</a>
          <a href="#experience">Experience</a>
          <a href="#work">Campaigns &amp; Design</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="bar-tools">
          <AmbientPlayer />
          <button
            className="mode"
            type="button"
            onClick={onCyclePalette}
            title={`Current palette: ${paletteName}`}
          >
            <Palette size={14} aria-hidden="true" />
            <span>
              <span className="hide-xs">change </span>color mood
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
