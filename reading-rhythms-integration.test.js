const assert = require("node:assert/strict");
const fs = require("node:fs");

const page = fs.readFileSync("readingrhythms.html", "utf8");
const index = fs.readFileSync("index.html", "utf8");

[
  'READY: "ready"', 'COUNTING: "countingIn"', 'PERFORMING: "performing"', 'CALCULATING: "calculating"', 'RESULTS: "results"', 'REFERENCE: "playingReference"',
  'min="60" max="120" step="5"', 'useState(90)', 'event.repeat', 'event.button !== 0', 'performance.now()', 'visibilitychange',
  'playMetronomeClick', 'toggleReference', 'Try Again', 'Next Question', 'restart.svg', 'aria-live="polite"', 'role="region"', 'tabIndex="0"',
  'reading-score-scroll', 'prefers-reduced-motion', 'reading-rhythms-core.js',
  'tap.svg', 'spacebar.svg', 'mouse.svg', 'pulsesPerBar * 2', 'SHARED_NOTATION_CONFIG',
  'quarterNoteStemUp', 'augmentationDot', 'secondaryBeamSegments', 'glyph("tie"',
  'hub-mobile.js', 'hub-audio.js', 'hub-shell.js', 'hub-menu.js', 'footer.js',
  'Compound time • Rests • Triplets', '5/4 • Ties • Syncopation',
  'CustomiseMenu', 'toggleRhythm', 'canGenerateWithEnabled', 'BeatBoxGroup', '{countInCue}', '["Ready", "Set", "Go!"]',
  'text-left text-xs font-black uppercase leading-none',
  'tapPulse > 0', 'bg-black', 'playBeatNumber', 'label="Play"',
  'Perform the rhythm above in time with the beat using one of these methods:', 'A point will be awarded for an accuracy rate of',
  'tap anywhere', 'press spacebar',
  'rhythm.timeSignature.compound ? 5 : 0', 'translate(150 42) scale(.65)', 'dotAdjust', 'translate(0, 12) scale(1.05)',
  'activePlaybackEventId', '#2563eb', 'setActivePlaybackEventId(event.id)',
  'TimingFeedback', 'results.thresholds.acceptableMs', 'inputX !== null', 'timingXs.length > 1', '<line x1="38" x2={SCORE.right}', '<g opacity="0.35" stroke="#78716c"', '["2/4", "6/8"].includes(rhythm.timeSignature.id) ? 2 : 1',
  'TimeSignatureMenuGlyph', 'enabledTimeSignatures', 'toggleTimeSignature', 'toggleRests', 'toggleTies',
  'playPianoFrequency', '261.6256',
  'relative -top-[6px] h-[48px] w-[20px]', 'relative -left-[3px] -top-px h-9 w-9', 'relative -left-[5px] -top-[6px]',
  'group.events[0].rhythm === "triplet-quaver"', 'fontFamily="serif" fontWeight="900" fontSize="20"', 'strokeLinejoin="round"',
  'tapFlashPosition', 'event.clientX - rect.left', 'event.clientY - rect.top', 'left: "50%", top: "92px"',
  'inputTimesRef', 'now - time <= 1000', 'inputTimesRef.current.length >= 7', 'spamDetected: true', 'Too many successive inputs detected. Repeatedly tapping ends the question.',
  'earlyCaptureSeconds', 'tapTime < -earlyCaptureSeconds', '[ACTIVITY_STATES.COUNTING, ACTIVITY_STATES.PERFORMING].includes(stateRef.current)',
  'playFeedbackSound?.(nextResult.passed, false, null)', 'playFeedbackSound?.(false, false, null)', 'getStreakMedal?.(nextStreak)', 'playFeedbackSound?.(true, true, medal?.sound)',
  'ToolbarFeedback', 'FeedbackBadge feedback={result ? { correct: result.passed } : null}', '{result.percentage}% Accuracy',
  'absolute left-1/2 top-full',
  'onGlobalPointerDown', 'event.pointerType === "mouse"', 'tapAreaRef.current?.contains(event.target)', 'window.addEventListener("pointerdown", onGlobalPointerDown, { passive: false })',
  'feedbackRevealed', 'h-[305px]', 'sm:h-[280px]', 'pointer-events-none', 'opacity-[0.65] grayscale', 'border-t border-stone-300',
  'grid w-full min-w-[720px] grid-cols-2 items-start gap-3', 'justify-self-end', 'justify-self-start', 'bg-stone-100 px-4 py-3', 'bg-white px-4 py-3', 'opacity-50', 'text-black opacity-100', 'rounded border border-black', 'border-l border-black', 'w-full text-center', 'h-11 w-[200px]', '!feedbackRevealed &&', 'feedbackRevealed &&', 'disabled={activityState !== ACTIVITY_STATES.READY}', '>60%</strong>',
].forEach((requiredText) => assert(page.includes(requiredText), `Missing integration safeguard: ${requiredText}`));

assert(index.includes('href: "readingrhythms.html"'), "Reading Rhythms card is missing from index.html");
assert(index.includes('"Reading Rhythms": "readingrhythm-icon.svg"'), "Reading Rhythms icon mapping is missing");
assert(page.includes('event.target.closest("button,input,select,a,[data-menu-panel],[data-menu-trigger]")'), "Pointer taps on controls must be ignored");
assert(page.includes('event.target.closest?.("button,input,select,textarea,a")'), "Spacebar taps inside controls must be ignored");
assert(!page.includes('absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80'), "Count-in must not obscure the music");
assert(!page.includes('{rhythm.timeSignature.id} time'), "The redundant written time-signature label must be removed");
assert(!page.includes('const reached = countInNumber'), "Previous count-in numbers must disappear when the next number appears");
assert(!page.includes('Tap, click, or press the spacebar in time with each written note.'), "The old question-container instruction must be removed");
assert(!page.includes('<window.MLH.SkipButton disabled={activeAttempt}'), "Skip must remain available throughout the activity");
assert(!page.includes('Keep practising'), "The results heading must be removed");
assert(!page.includes('Average error'), "Average error must be replaced by percentage");
assert(!page.includes('function ResultsSummary'), "Redundant metric cards must be removed");
assert(!page.includes('transition-[height]'), "The question container must not animate its height");
assert(!page.includes('{result.counts.early}'), "Early metric card must be removed");
assert(!page.includes('{result.counts.late}'), "Late metric card must be removed");
assert(!page.includes('{result.counts.missed}'), "Missed metric card must be removed");
assert(!page.includes('{result.counts.extra}'), "Extra metric card must be removed");
assert(!page.includes('<br/>Accurate'), "The Accurate feedback metric must be removed");
assert(!page.includes('key={`result-${result.eventId}`}'), "The old tick and cross result markers must be removed");

console.log("Reading Rhythms integration checks passed.");
