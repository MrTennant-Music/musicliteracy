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
  hubStyle.href = "https://mrtennant-music.github.io/musicliteracy/hub-ui.css?v=1.4";
  document.head.appendChild(hubStyle);
}

const footerShellClass = window.MLH?.shell?.footerShellClass || "bg-white";

document.body.insertAdjacentHTML("beforeend", `
<footer class="footer ${footerShellClass}" id="resources">
  <div class="footer-grid">

    <div class="footer-brand">
      <a href="https://mrtennant-music.github.io/musicliteracy/" aria-label="Return to Music Literacy Hub home page">
        <img
          src="https://mrtennant-music.github.io/musicliteracy/the-music-literacy-hub-logo.svg"
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
        If you have any suggestions on how to improve the hub,
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
    The Music Literacy Hub · Version 1.0 · 2026
  </div>
</footer>

<div id="aboutOverlay" class="overlay">
  <div class="modal">
    <button class="close-btn" type="button" data-close aria-label="Close About information">×</button>

    <h2>About</h2>

    <p>
      The Music Literacy Hub is a collection of interactive tools designed to develop and reinforce music literacy skills from <strong>National 3</strong> to <strong>Advanced Higher</strong>. Built around <strong>Qualifications Scotland</strong> music literacy concepts, it supports classroom learning, revision and independent study.
    </p>

    <p>
      The hub includes interactive listening and aural training activities, is fully compatible with desktop, tablet and mobile devices, and organises concepts by level and topic to support clear progression.
    </p>

    <p>
      It was created to make music theory more visual, interactive and accessible.
    </p>

    <p>
      This website was built using ChatGPT.
    </p>
  </div>
</div>
`);

const footerStyle = document.createElement("style");
footerStyle.textContent = `
  .footer .footer-wordmark {
    width: 187px !important;
    transform: translateX(-7px);
  }

  @media (max-width: 980px) {
    .footer .footer-wordmark {
      transform: translateX(11px);
    }
  }

  .footer .text-link:hover,
  .footer .text-link:focus-visible {
    text-decoration: underline !important;
  }
`;
document.head.appendChild(footerStyle);

document.addEventListener("click", event => {
  const opener = event.target.closest("[data-open='aboutOverlay']");

  if (opener) {
    event.preventDefault();
    document.getElementById("aboutOverlay")?.classList.add("is-open");
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
