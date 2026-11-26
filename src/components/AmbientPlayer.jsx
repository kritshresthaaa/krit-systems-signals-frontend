import { useEffect, useRef, useState } from 'react';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';
import { LOCAL_TRACKS } from '../data/playlist';

// Warm lo-fi ambient progression (Hz): Fmaj9 -> Em7 -> Dm9 -> Cmaj9
const CHORDS = [
  { root: 87.31, notes: [174.61, 220.0, 261.63, 329.63, 392.0] },
  { root: 82.41, notes: [164.81, 196.0, 246.94, 293.66, 392.0] },
  { root: 73.42, notes: [146.83, 174.61, 220.0, 261.63, 329.63] },
  { root: 65.41, notes: [130.81, 164.81, 196.0, 246.94, 293.66] },
];

const CHORD_DURATION_SEC = 4.0;

function shuffleIndices(length, excludeIndex = -1) {
  const order = Array.from({ length }, (_, idx) => idx);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (length > 1 && order[0] === excludeIndex) {
    [order[0], order[order.length - 1]] = [order[order.length - 1], order[0]];
  }
  return order;
}

/**
 * Lightweight, ad-free background music toggle in the navbar.
 * Plays a real-time Fisher-Yates shuffled playlist from `LOCAL_TRACKS`
 * (`public/audio/*.mp3`) using `preload="none"`, or falls back to a warm
 * generative Web Audio ambient synth when no MP3s are configured yet.
 */
export function AmbientPlayer() {
  const hasLocalTracks = LOCAL_TRACKS.length > 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [trackTitle, setTrackTitle] = useState('');

  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const queuePosRef = useRef(0);
  const currentIdxRef = useRef(-1);

  const synthRef = useRef({
    ctx: null,
    master: null,
    filter: null,
    timerId: null,
    step: 0,
  });

  const scheduleChord = () => {
    const engine = synthRef.current;
    if (!engine.ctx || !engine.filter) return;

    const now = engine.ctx.currentTime;
    const chord = CHORDS[engine.step % CHORDS.length];
    engine.step += 1;

    // Soft warm sub-bass root
    const sub = engine.ctx.createOscillator();
    const subGain = engine.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(chord.root, now);
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.09, now + 0.7);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_DURATION_SEC + 0.5);
    sub.connect(subGain);
    subGain.connect(engine.filter);
    sub.start(now);
    sub.stop(now + CHORD_DURATION_SEC + 0.6);

    // Rhodes-like pad voicings
    chord.notes.forEach((freq, idx) => {
      const osc = engine.ctx.createOscillator();
      const noteGain = engine.ctx.createGain();
      const delay = idx * 0.06;

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.detune.setValueAtTime(idx % 2 === 0 ? -3.5 : 3.5, now + delay);

      noteGain.gain.setValueAtTime(0.0001, now + delay);
      noteGain.gain.linearRampToValueAtTime(0.16 / chord.notes.length, now + delay + 0.75);
      noteGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + CHORD_DURATION_SEC + 0.6
      );

      osc.connect(noteGain);
      noteGain.connect(engine.filter);

      osc.start(now + delay);
      osc.stop(now + CHORD_DURATION_SEC + 0.7);
    });
  };

  const stopSynth = () => {
    const engine = synthRef.current;
    if (engine.timerId) {
      clearInterval(engine.timerId);
      engine.timerId = null;
    }
    if (engine.ctx && engine.master) {
      const now = engine.ctx.currentTime;
      engine.master.gain.cancelScheduledValues(now);
      engine.master.gain.setValueAtTime(engine.master.gain.value, now);
      engine.master.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      setTimeout(() => {
        if (!synthRef.current.timerId && engine.ctx?.state === 'running') {
          engine.ctx.suspend().catch(() => {});
        }
      }, 320);
    }
    setIsPlaying(false);
  };

  const startSynth = async () => {
    const engine = synthRef.current;
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!engine.ctx) {
      const ctx = new AudioContextClass();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 720;
      filter.Q.value = 0.6;

      const master = ctx.createGain();
      master.gain.value = 0.0001;

      filter.connect(master);
      master.connect(ctx.destination);

      engine.ctx = ctx;
      engine.filter = filter;
      engine.master = master;
    }

    if (engine.ctx.state === 'suspended') {
      await engine.ctx.resume();
    }

    const now = engine.ctx.currentTime;
    engine.master.gain.cancelScheduledValues(now);
    engine.master.gain.setValueAtTime(0.0001, now);
    engine.master.gain.linearRampToValueAtTime(0.24, now + 0.6);

    scheduleChord();
    engine.timerId = setInterval(scheduleChord, CHORD_DURATION_SEC * 1000);
    setTrackTitle('ambient synth');
    setIsPlaying(true);
  };

  const playNextLocalTrack = async () => {
    if (!hasLocalTracks || !audioRef.current) return;

    if (
      queueRef.current.length === 0 ||
      queuePosRef.current >= queueRef.current.length
    ) {
      queueRef.current = shuffleIndices(
        LOCAL_TRACKS.length,
        currentIdxRef.current
      );
      queuePosRef.current = 0;
    }

    const nextIdx = queueRef.current[queuePosRef.current];
    queuePosRef.current += 1;
    currentIdxRef.current = nextIdx;

    const track = LOCAL_TRACKS[nextIdx];
    audioRef.current.src = track.src;
    audioRef.current.volume = 0.35;
    setTrackTitle(track.title);
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const engine = synthRef.current;
    return () => {
      if (engine.timerId) clearInterval(engine.timerId);
      if (engine.ctx) engine.ctx.close().catch(() => {});
    };
  }, []);

  const handleToggle = async () => {
    if (hasLocalTracks && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (audioRef.current.src) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          setIsPlaying(false);
        }
      } else {
        await playNextLocalTrack();
      }
      return;
    }

    if (isPlaying) {
      stopSynth();
    } else {
      startSynth();
    }
  };

  const buttonText = isPlaying ? trackTitle || 'music: playing' : 'music: off';

  return (
    <div className="audio-group">
      <button
        className={`mode audio-toggle${isPlaying ? ' is-playing' : ''}`}
        type="button"
        onClick={handleToggle}
        aria-label={
          isPlaying
            ? 'Pause background music'
            : hasLocalTracks
              ? 'Play shuffled background music'
              : 'Play ambient background music'
        }
        title={
          hasLocalTracks
            ? trackTitle || 'Play shuffled playlist'
            : 'Toggle ambient background music'
        }
      >
        {isPlaying ? (
          <Volume2 size={14} aria-hidden="true" />
        ) : (
          <VolumeX size={14} aria-hidden="true" />
        )}
        <span className="eq-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="audio-label">{buttonText}</span>
      </button>

      {hasLocalTracks && isPlaying && (
        <button
          className="mode audio-next"
          type="button"
          onClick={playNextLocalTrack}
          aria-label="Skip to next shuffled track"
          title="Next shuffled track"
        >
          <SkipForward size={13} aria-hidden="true" />
        </button>
      )}

      {hasLocalTracks && (
        <audio
          ref={audioRef}
          preload="none"
          onEnded={playNextLocalTrack}
          onError={playNextLocalTrack}
        />
      )}
    </div>
  );
}
