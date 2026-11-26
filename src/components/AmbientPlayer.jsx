import { useEffect, useRef, useState } from 'react';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';
import { LOCAL_TRACKS } from '../data/playlist';

const SYNTH_TRACKS = [
  {
    id: 'lofi-rhodes',
    title: 'lo-fi rhodes',
    stepMs: 3800,
    cutoff: 740,
    chords: [
      { root: 87.31, notes: [174.61, 220.0, 261.63, 329.63, 392.0] },
      { root: 82.41, notes: [164.81, 196.0, 246.94, 293.66, 392.0] },
      { root: 73.42, notes: [146.83, 174.61, 220.0, 261.63, 329.63] },
      { root: 65.41, notes: [130.81, 164.81, 196.0, 246.94, 293.66] },
    ],
  },
  {
    id: 'rain-pad',
    title: 'rain + synth',
    stepMs: 4200,
    cutoff: 620,
    hasRain: true,
    chords: [
      { root: 110.0, notes: [220.0, 261.63, 329.63, 392.0] },
      { root: 87.31, notes: [174.61, 220.0, 261.63, 329.63] },
      { root: 73.42, notes: [146.83, 174.61, 220.0, 329.63] },
      { root: 82.41, notes: [164.81, 246.94, 293.66, 329.63] },
    ],
  },
  {
    id: 'chill-pluck',
    title: 'chill pluck',
    stepMs: 520,
    cutoff: 1150,
    isArp: true,
    notes: [261.63, 329.63, 392.0, 493.88, 587.33, 440.0, 392.0, 329.63],
    bass: [130.81, 130.81, 110.0, 110.0, 87.31, 87.31, 98.0, 98.0],
  },
  {
    id: 'deep-focus',
    title: 'deep focus',
    stepMs: 4800,
    cutoff: 480,
    chords: [
      { root: 73.42, notes: [146.83, 220.0, 293.66, 440.0] },
      { root: 65.41, notes: [130.81, 196.0, 261.63, 392.0] },
    ],
  },
];

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

function createSoftRainBuffer(ctx) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 3;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + white * 0.029;
    b1 = 0.985 * b1 + white * 0.032;
    b2 = 0.95 * b2 + white * 0.048;
    data[i] = (b0 + b1 + b2) * 0.14;
  }
  return buffer;
}

/**
 * Lightweight, ad-free background music toggle in the navbar.
 * Plays a real-time Fisher-Yates shuffled playlist from `LOCAL_TRACKS`
 * (`public/audio/*.mp3`) using `preload="none"`, or cycles/shuffles across
 * 4 distinct built-in Web Audio moods when no MP3s are configured.
 */
export function AmbientPlayer() {
  const hasLocalTracks = LOCAL_TRACKS.length > 0;
  const trackPoolCount = hasLocalTracks ? LOCAL_TRACKS.length : SYNTH_TRACKS.length;

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
    rainNode: null,
    rainGain: null,
    step: 0,
    activeTrack: null,
  });

  const stopRainLayer = () => {
    const engine = synthRef.current;
    if (engine.rainNode) {
      try {
        engine.rainNode.stop();
        engine.rainNode.disconnect();
      } catch {
        // Already stopped
      }
      engine.rainNode = null;
    }
    if (engine.rainGain) {
      engine.rainGain.disconnect();
      engine.rainGain = null;
    }
  };

  const ensureSynthContext = async () => {
    const engine = synthRef.current;
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

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

    return engine;
  };

  const scheduleSynthStep = () => {
    const engine = synthRef.current;
    const track = engine.activeTrack;
    if (!engine.ctx || !engine.filter || !track) return;

    const now = engine.ctx.currentTime;
    const step = engine.step;
    engine.step += 1;

    if (track.isArp) {
      const freq = track.notes[step % track.notes.length];
      const bassFreq = track.bass[step % track.bass.length];

      const osc = engine.ctx.createOscillator();
      const gain = engine.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
      osc.connect(gain);
      gain.connect(engine.filter);
      osc.start(now);
      osc.stop(now + 1.2);

      if (step % 2 === 0) {
        const bass = engine.ctx.createOscillator();
        const bassGain = engine.ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(bassFreq, now);
        bassGain.gain.setValueAtTime(0.0001, now);
        bassGain.gain.linearRampToValueAtTime(0.075, now + 0.12);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        bass.connect(bassGain);
        bassGain.connect(engine.filter);
        bass.start(now);
        bass.stop(now + 1.25);
      }
      return;
    }

    const chord = track.chords[step % track.chords.length];
    const durSec = track.stepMs / 1000;

    const sub = engine.ctx.createOscillator();
    const subGain = engine.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(chord.root, now);
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.085, now + 0.7);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + durSec + 0.5);
    sub.connect(subGain);
    subGain.connect(engine.filter);
    sub.start(now);
    sub.stop(now + durSec + 0.6);

    chord.notes.forEach((freq, idx) => {
      const osc = engine.ctx.createOscillator();
      const noteGain = engine.ctx.createGain();
      const delay = idx * 0.055;

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.detune.setValueAtTime(idx % 2 === 0 ? -3.5 : 3.5, now + delay);

      noteGain.gain.setValueAtTime(0.0001, now + delay);
      noteGain.gain.linearRampToValueAtTime(
        0.16 / chord.notes.length,
        now + delay + 0.7
      );
      noteGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + durSec + 0.6
      );

      osc.connect(noteGain);
      noteGain.connect(engine.filter);

      osc.start(now + delay);
      osc.stop(now + durSec + 0.7);
    });
  };

  const stopSynth = () => {
    const engine = synthRef.current;
    if (engine.timerId) {
      clearInterval(engine.timerId);
      engine.timerId = null;
    }
    stopRainLayer();
    if (engine.ctx && engine.master) {
      const now = engine.ctx.currentTime;
      engine.master.gain.cancelScheduledValues(now);
      engine.master.gain.setValueAtTime(engine.master.gain.value, now);
      engine.master.gain.linearRampToValueAtTime(0.0001, now + 0.25);
      setTimeout(() => {
        if (!synthRef.current.timerId && engine.ctx?.state === 'running') {
          engine.ctx.suspend().catch(() => {});
        }
      }, 280);
    }
    setIsPlaying(false);
  };

  const startSynthTrack = async (track) => {
    const engine = await ensureSynthContext();
    if (!engine) return;

    if (engine.timerId) {
      clearInterval(engine.timerId);
      engine.timerId = null;
    }
    stopRainLayer();

    engine.activeTrack = track;
    engine.step = 0;

    const now = engine.ctx.currentTime;
    engine.filter.frequency.setTargetAtTime(track.cutoff, now, 0.2);
    engine.master.gain.cancelScheduledValues(now);
    engine.master.gain.setValueAtTime(0.0001, now);
    engine.master.gain.linearRampToValueAtTime(0.24, now + 0.5);

    if (track.hasRain) {
      const rain = engine.ctx.createBufferSource();
      rain.buffer = createSoftRainBuffer(engine.ctx);
      rain.loop = true;

      const rainFilter = engine.ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.value = 950;
      rainFilter.Q.value = 0.65;

      const rainGain = engine.ctx.createGain();
      rainGain.gain.value = 0.12;

      rain.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(engine.master);
      rain.start(now);

      engine.rainNode = rain;
      engine.rainGain = rainGain;
    }

    scheduleSynthStep();
    engine.timerId = setInterval(scheduleSynthStep, track.stepMs);
    setTrackTitle(track.title);
    setIsPlaying(true);
  };

  const getNextShuffledIndex = () => {
    if (
      queueRef.current.length === 0 ||
      queuePosRef.current >= queueRef.current.length
    ) {
      queueRef.current = shuffleIndices(trackPoolCount, currentIdxRef.current);
      queuePosRef.current = 0;
    }
    const nextIdx = queueRef.current[queuePosRef.current];
    queuePosRef.current += 1;
    currentIdxRef.current = nextIdx;
    return nextIdx;
  };

  const playNextTrack = async () => {
    const nextIdx = getNextShuffledIndex();

    if (hasLocalTracks && audioRef.current) {
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
      return;
    }

    await startSynthTrack(SYNTH_TRACKS[nextIdx]);
  };

  useEffect(() => {
    const engine = synthRef.current;
    return () => {
      if (engine.timerId) clearInterval(engine.timerId);
      stopRainLayer();
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
        await playNextTrack();
      }
      return;
    }

    if (isPlaying) {
      stopSynth();
    } else if (synthRef.current.activeTrack) {
      await startSynthTrack(synthRef.current.activeTrack);
    } else {
      await playNextTrack();
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
          isPlaying ? 'Pause background music' : 'Play shuffled background music'
        }
        title={
          isPlaying
            ? `${trackTitle} — click to pause`
            : 'Play shuffled background music'
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

      {isPlaying && (
        <button
          className="mode audio-next"
          type="button"
          onClick={playNextTrack}
          aria-label="Skip to next music mood"
          title="Next track"
        >
          <SkipForward size={13} aria-hidden="true" />
        </button>
      )}

      {hasLocalTracks && (
        <audio
          ref={audioRef}
          preload="none"
          onEnded={playNextTrack}
          onError={playNextTrack}
        />
      )}
    </div>
  );
}
