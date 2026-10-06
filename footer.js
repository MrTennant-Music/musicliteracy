const hasHubUiStylesheet = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  .some(link => {
    try {
      return new URL(link.href, window.location.href).pathname.endsWith("/hub-ui.css");
    } catch {
      return link.getAttribute("href")?.split("?")[0].endsWith("hub-ui.css");
    }
  });

if (!hasHubUiStylesheet) {
  const hubStyle = document.createElement("link");
  hubStyle.rel = "stylesheet";
  hubStyle.href = "https://themusicliteracyhub.netlify.app/hub-ui.css?v=1.4";
  document.head.appendChild(hubStyle);
}

const footerShellClass = window.MLH?.shell?.footerShellClass || "bg-white";

document.body.insertAdjacentHTML("beforeend", `
<footer class="footer ${footerShellClass}" id="resources">
  <div class="footer-grid">

    <div class="footer-brand">
      <a href="https://themusicliteracyhub.netlify.app/" aria-label="Return to Music Literacy Hub home page">
        <img
          src="https://themusicliteracyhub.netlify.app/the-music-literacy-hub-logo.svg"
          alt="The Music Literacy Hub"
          class="brand-wordmark footer-wordmark"
        />
      </a>
    </div>

    <div>
      <h4>About</h4>
      <p>
        Interactive apps for developing music literacy skills.
        Find out more
        <a class="text-link" href="#" data-open="aboutOverlay">here</a>.
      </p>
    </div>

    <div>
      <h4>Feedback</h4>
      <p>
        If you have any suggestions on how to improve the Hub,
        please click
        <a
          class="text-link"
          href="https://forms.cloud.microsoft/e/vW5PPdW154"
          target="_blank"
          rel="noopener noreferrer"
        >here</a>.
      </p>
    </div>

    <div id="contact">
      <h4>Contact</h4>
      <p>
        Robert Tennant<br />
        Teacher of Music<br />
        gw19tennantrobert1@glow.sch.uk
      </p>
    </div>

  </div>

  <div class="copyright">
    The Music Literacy Hub · <a class="version-link" href="#versionOverlay" data-open="versionOverlay">Version 1.1</a> · 2026
  </div>
</footer>

<div id="aboutOverlay" class="overlay">
  <div class="modal">
    <button class="close-btn" type="button" data-close aria-label="Close About information">×</button>

    <h2>About</h2>

    <p>
      The Music Literacy Hub is a collection of interactive tools designed to develop and reinforce music literacy skills from <strong>National 3</strong> to <strong>Advanced Higher</strong> in a more visual, interactive and accessible way.
    </p>

    <p>
      The Hub includes interactive listening and aural training activities and is designed to work best with desktop and tablet devices.
    </p>

    <p>
      Built around <strong>Qualifications Scotland</strong> music literacy concepts, it supports classroom learning, revision and independent study. It organises concepts by level and topic to support clear progression.
    </p>

  </div>
</div>

<div id="versionOverlay" class="overlay">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="versionOverlayTitle">
    <button class="close-btn" type="button" data-close aria-label="Close update log">×</button>
    <h2 id="versionOverlayTitle">Update Log</h2>
    <p class="release-notes-version"><strong>Version 1.1 • <time datetime="2026-10">October 2026</time></strong></p>
    <ul class="release-notes-list">
      <li>Added Aural Recognition with listening exercises for cadences, chords, tonalities, beats per bar, scales, ornaments, metres and tempo changes. Includes multiple choice and typed answers, customisable content and optional full passages.</li>
      <li>Added Family Fortunes from National 3 to Advanced Higher, with two-team play, face-offs, play or pass, steals, scoring and editable rounds.</li>
      <li>Added Keyboard Note Identification from National 3 to National 5, with highlighted piano keys, a guide note, customisable accidentals and score, streak and medal tracking.</li>
      <li>Added Metronome with adjustable tempo, tap tempo, beats per bar, first-beat accents, subdivisions and an animated metronome.</li>
      <li>Bug fixes and other improvements across the Hub.</li>
    </ul>
    <p class="release-notes-version"><strong>Version 1.0 • <time datetime="2026-08">August 2026</time></strong></p>
    <ul class="release-notes-list">
      <li>Initial release of The Music Literacy Hub.</li>
    </ul>
  </div>
</div>
`);

const footerStyle = document.createElement("style");
footerStyle.textContent = `
  .footer .footer-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }

  .footer .footer-brand {
    justify-content: center;
  }

  .footer .footer-wordmark {
    width: 187px !important;
    transform: translateX(-7px);
  }



  .footer .text-link:hover,
  .footer .text-link:focus-visible {
    text-decoration: underline !important;
  }

  .footer .version-link {
    color: inherit;
    font-weight: 400;
    text-decoration: none;
  }

  .footer .version-link:hover,
  .footer .version-link:focus-visible {
    text-decoration: underline;
  }

  #versionOverlay .release-notes-version {
    color: #000;
  }

  #versionOverlay .release-notes-list + .release-notes-version {
    margin-top: 24px;
  }

  .release-notes-list {
    margin: 0;
    padding-left: 22px;
    list-style: disc outside;
    color: #475569;
    line-height: 1.55;
  }

  .release-notes-list li + li {
    margin-top: 10px;
  }
`;
document.head.appendChild(footerStyle);

document.addEventListener("click", event => {
  const opener = event.target.closest("[data-open='aboutOverlay'], [data-open='versionOverlay']");

  if (opener) {
    event.preventDefault();
    document.getElementById(opener.dataset.open)?.classList.add("is-open");
    return;
  }

  const closeButton = event.target.closest("[data-close]");

  if (closeButton) {
    closeButton.closest(".overlay")?.classList.remove("is-open");
    return;
  }

  if (event.target.classList.contains("overlay")) {
    event.target.classList.remove("is-open");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document
      .querySelectorAll(".overlay.is-open")
      .forEach(overlay => overlay.classList.remove("is-open"));
  }
});
