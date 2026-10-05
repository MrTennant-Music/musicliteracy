// Shared accompaniment patterns for Aural Recognition. Harmony is supplied by
// each exercise so changing the texture never changes the concept being heard.
(function attachAuralAccompaniment(MLH) {
  "use strict";

  const styles = [
    "block_chords", "broken_chords", "alberti_bass", "piano_ballad",
    "contemporary_pop", "stride_piano", "walking_bass"
  ];
  let previousStyle = null;

  function chooseStyle() {
    const candidates = styles.filter(style => style !== previousStyle);
    previousStyle = candidates[Math.floor(Math.random() * candidates.length)];
    return previousStyle;
  }

  function eventsForBar({ signature, notes, segments, style, finalBar = false, subdivisions = false }) {
    const events = [];
    const barBeats = signature.beats;
    const compound = signature.type === "compound";
    const pulseBeats = compound ? 1.5 : 1;
    const groupLengths = compound
      ? Array(Math.round(barBeats / pulseBeats)).fill(pulseBeats)
      : signature.id === "5/4" ? [3, 2] : [barBeats];
    let groupStart = 0;
    const groups = groupLengths.map(beats => {
      const group = { start: groupStart, end: groupStart + beats };
      groupStart += beats;
      return group;
    });

    segments.forEach(segment => {
      const start = segment.beat ?? 0;
      const end = Math.min(barBeats, start + (segment.beats ?? barBeats));
      const chord = [...new Set(segment.pitches)];
      if (!chord.length || end <= start) return;
      const root = chord[0];
      const third = chord[1] ?? root;
      const fifth = chord[2] ?? chord.at(-1);
      const lowRoot = segment.bass ?? root - 12;
      const lowFifth = fifth - 12;
      const highChord = [...chord.slice(1), root + 12];
      const add = (beat, beats, pitches, volume) => {
        const duration = Math.min(beats, end - beat);
        if (beat < start || duration <= 0) return;
        const sounding = notes.filter(note => !note.rest && note.beat <= beat + 0.001 && note.beat + note.beats > beat + 0.001);
        const reference = sounding.length ? sounding : notes.filter(note => !note.rest);
        const ceiling = reference.length ? Math.min(72, ...reference.map(note => note.midi - 1)) : 72;
        events.push({
          beat, beats: duration,
          pitches: [...new Set((Array.isArray(pitches) ? pitches : [pitches]).map(pitch => {
            while (pitch > ceiling) pitch -= 12;
            return pitch;
          }))],
          volume: volume * (segment.volume ?? 1) / 0.018
        });
      };

      if (finalBar) {
        add(start, (end - start) * 0.96, lowRoot, 0.025);
        add(start, (end - start) * 0.96, chord, 0.016);
        return;
      }
      // Chord questions retain an audible complete target sonority, including
      // its sixth/seventh, underneath the selected accompaniment pattern.
      if (segment.revealChord) add(start, (end - start) * 0.85, chord, 0.022);
      groups.forEach(group => {
        const begin = Math.max(start, group.start);
        const finish = Math.min(end, group.end);
        const length = finish - begin;
        if (length <= 0) return;
        const arpeggio = (tones, volume) => {
          for (let index = 0; index * 0.5 < length; index++) {
            const accent = index === 0 ? 1.2 : index % 2 === 0 && !compound ? 1.08 : 1;
            add(begin + index * 0.5, Math.min(0.46, length - index * 0.5), tones[index % tones.length], volume * accent);
          }
        };
        if (style === "broken_chords" || style === "alberti_bass") {
          const tones = style === "alberti_bass"
            ? [root, fifth, third, fifth, ...chord.slice(3).flatMap(pitch => [pitch, fifth])]
            : [...chord, root + 12];
          arpeggio(tones, 0.017);
          add(begin, compound ? 1.35 : Math.min(0.88, length), lowRoot, 0.021);
        } else if (style === "piano_ballad") {
          add(begin, compound ? 1.4 : Math.min(1.8, length), lowRoot, 0.027);
          if (!compound && length > 2) add(begin + 2, Math.min(1.8, length - 2), lowFifth, 0.023);
          arpeggio(highChord, 0.012);
        } else if (style === "contemporary_pop") {
          add(begin, compound ? 1.35 : Math.min(0.9, length), lowRoot, 0.027);
          for (let offset = 0.5; offset < length; offset += compound ? 0.5 : 1) {
            add(begin + offset, 0.43, highChord, 0.012);
          }
        } else if (style === "walking_bass") {
          const step = compound ? 0.5 : 1;
          const tones = chord.map(pitch => pitch - 12);
          for (let index = 0; index * step < length; index++) {
            add(begin + index * step, step * 0.9, tones[index % tones.length], index === 0 ? 0.028 : 0.023);
          }
          add(begin + (compound ? 0.5 : 1), 0.43, chord, 0.012);
        } else if (style === "stride_piano") {
          add(begin, compound ? 0.45 : 0.88, [lowRoot, root], 0.028);
          if (compound) {
            add(begin + 0.5, 0.43, chord, 0.014);
            add(begin + 1, 0.43, highChord, 0.013);
          } else {
            for (let offset = 1; offset < length; offset++) {
              add(begin + offset, 0.88, offset % 2 ? chord : [lowFifth, fifth], offset % 2 ? 0.015 : 0.025);
            }
          }
        } else {
          add(begin, compound ? 1.4 : 0.9, lowRoot, 0.028);
          if (compound) add(begin, 1.4, chord, 0.014);
          else for (let offset = 1; offset < length; offset++) add(begin + offset, 0.88, chord, 0.014);
        }
      });
      // Metre questions must expose two divisions in simple time and three
      // in compound time, even with a held or syncopated accompaniment style.
      if (subdivisions) {
        for (let pulse = 0; pulse < barBeats; pulse += pulseBeats) {
          for (let division = 0; division < (compound ? 3 : 2); division++) {
            const beat = pulse + division * 0.5;
            if (beat < start || beat >= end) continue;
            const alreadySounding = events.some(event => Math.abs(event.beat - beat) < 0.001);
            if (!alreadySounding) add(beat, 0.32, division === 0 ? lowRoot : fifth, division === 0 ? 0.019 : 0.01);
          }
        }
      }
    });
    return events.sort((a, b) => a.beat - b.beat);
  }

  MLH.AuralAccompaniment = { styles, chooseStyle, eventsForBar };
})(window.MLH || (window.MLH = {}));
