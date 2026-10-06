(function (root) {
  const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const natural = [0, 2, 4, 5, 7, 9, 11];
  const subtitles = { N3: "One octave", N4: "Two octaves", N5: "Tones, semitones, accidentals — flats, sharps and naturals" };
  const defaults = {
    N3: { octaves: 1, naturals: true, sharps: false, flats: false, enharmonics: false },
    N4: { octaves: 2, naturals: true, sharps: false, flats: false, enharmonics: false },
    N5: { octaves: 2, naturals: true, sharps: true, flats: true, enharmonics: false },
  };
  function answers(options) {
    return [1, 0, -1].flatMap(offset => letters.flatMap((letter, index) => {
      if (!(offset === 0 ? options.naturals : offset === 1 ? options.sharps : options.flats)) return [];
      if (!options.enharmonics && ((offset === 1 && ['E','B'].includes(letter)) || (offset === -1 && ['C','F'].includes(letter)))) return [];
      return [{ id: letter + (offset === 1 ? '#' : offset === -1 ? 'b' : ''), label: letter + (offset === 1 ? '♯' : offset === -1 ? '♭' : ''), pitch: (natural[index] + offset + 12) % 12, offset, index }];
    }));
  }
  const whiteKeys = Array.from({length: 15}, (_, index) => ({ pitch: Math.floor(index / 7) * 12 + natural[index % 7], x: index * 48, black: false }));
  const keys = [...whiteKeys, ...whiteKeys.flatMap((key, index) => index < 14 && [0,1,3,4,5].includes(index % 7) ? [{pitch: key.pitch + 1, x: key.x + 33, black: true}] : [])];
  function visibleKeys(options) { return keys.filter(key => key.pitch <= (options.octaves === 1 ? 12 : 24)); }
  function pool(options) {
    const pitches = new Set(answers(options).map(answer => answer.pitch));
    return visibleKeys(options).filter(key => pitches.has(key.pitch % 12));
  }
  function question(options, previousPitch = null, random = Math.random) {
    const candidates = pool(options).filter(key => key.pitch !== previousPitch);
    if (!candidates.length) throw new Error('Select at least one note group.');
    return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
  }
  function correct(answer, key) { return answer.pitch === key.pitch % 12; }
  const api = { letters, defaults, subtitles, keys, visibleKeys, answers, pool, question, correct };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KeyboardNotes = api;
})(typeof window !== 'undefined' ? window : globalThis);
