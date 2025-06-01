// Globale variabelen voor score, levens en timer
let score = 0;
let levens = 3;
let tijdOver = 10;
let timer;

// Variabelen voor de vragenlijst en voortgang
let beschikbareVragen = [];
let totaalVragen = 0;
let vraagNummer = 0;

// Array met hoofdsteden, bijbehorende provincie en afbeelding
const hoofdsteden = [
  { stad: "Assen", provincie: "drenthe", image: "Drenthe.svg" },
  { stad: "Groningen", provincie: "groningen", image: "Groningen.svg" },
  { stad: "Leeuwarden", provincie: "friesland", image: "Friesland.svg" },
  { stad: "Zwolle", provincie: "overijssel", image: "Overijssel.svg" },
  { stad: "Arnhem", provincie: "gelderland", image: "Gelderland.svg" },
  { stad: "Utrecht", provincie: "utrecht", image: "Utrecht.svg" },
  { stad: "Haarlem", provincie: "noord-holland", image: "Noord-Holland.svg" },
  { stad: "'s-Hertogenbosch", provincie: "noord-brabant", image: "Noord-Brabant.svg" },
  { stad: "Maastricht", provincie: "limburg", image: "Limburg.svg" },
  { stad: "Middelburg", provincie: "zeeland", image: "Zeeland.svg" },
  { stad: "Den Haag", provincie: "zuid-holland", image: "Zuid-Holland.svg" },
  { stad: "Lelystad", provincie: "flevoland", image: "Flevoland.svg" }
];

// Elementen uit de HTML koppelen aan variabelen
const kaartContainer = document.querySelector('section');
const kaartElement = document.querySelector('#kaart');
const startKnop = document.querySelector('#startKnop');
const vraagContainer = document.querySelector('#vraagContainer');
const vraagTekst = document.querySelector('h3');
const vraagNummerElement = document.querySelector('#vraagNummer');
const timerElement = document.querySelector('#timer');
const timerBar = document.querySelector('#timerBar');
const scoreElement = document.querySelector('#score');
const levensContainer = document.querySelector('#levensContainer');
const keuzeContainer = document.querySelector('#keuzeKnoppen');
const popup = document.querySelector('#popup');
const popupText = document.querySelector('#popupText');
const popupAfbeelding = document.querySelector("#popupAfbeelding")

// Geluidseffecten instellen
const tadaGeluid = new Audio("./audio/tada.mp3")
const failGeluid = new Audio("./audio/fail.mp3")

// Event listener: start het spel als er op de startknop wordt geklikt
startKnop.addEventListener('click', startSpel);

// Start het spel en zet alles op 0
function startSpel() {
  score = 0;
  levens = 3;
  vraagNummer = 0;
  beschikbareVragen = [...hoofdsteden];
  totaalVragen = beschikbareVragen.length;

  document.querySelector("#introTekst").style.display = "none";
  startKnop.style.display = "none";
  vraagContainer.style.display = "block";
  kaartContainer.style.display = "block";

  updateScoreEnLevens();
  nieuweVraag();
}

// Laat een nieuwe vraag zien met een provincie en 4 keuzes
function nieuweVraag() {
  if (levens <= 0 || beschikbareVragen.length === 0) return eindeSpel();

  vraagNummer++;
  const juisteVraag = beschikbareVragen.splice(Math.floor(Math.random() * beschikbareVragen.length), 1)[0];

  kaartElement.src = 'images/' + juisteVraag.image;

  let provincieNaam = juisteVraag.provincie.charAt(0).toUpperCase() + juisteVraag.provincie.slice(1);
  vraagTekst.innerHTML = "Wat is de hoofdstad van <span class='highlightProvincie'>" + provincieNaam + "</span>?";

  // Deze shuffle-methode komt van: https://stackoverflow.com/a/12646864
  const opties = [...hoofdsteden.filter(s => s.stad !== juisteVraag.stad).sort(() => 0.5 - Math.random()).slice(0, 3), juisteVraag].sort(() => 0.5 - Math.random());

  keuzeContainer.innerHTML = '';
  opties.forEach(optie => {
    const knop = document.createElement('button');
    knop.textContent = optie.stad;
    knop.onclick = () => controleerAntwoord(optie.stad, juisteVraag.stad);
    keuzeContainer.appendChild(knop);
  });

  vraagNummerElement.textContent = "Vraag " + vraagNummer + " van " + totaalVragen;
  startTimer();
}

// Controleert of het antwoord goed is en toont feedback
function controleerAntwoord(gekozenStad, juisteStad) {
  clearInterval(timer);
  const juist = gekozenStad === juisteStad;
  if (juist) {
    score++;
    showPopup("Juist!", "green", "duim omhoog.png");
  } else {
    levens--;
    showPopup("Fout! Het juiste antwoord was " + juisteStad + ".", "red", "duim omlaag.png");
  }
  updateScoreEnLevens();
  setTimeout(nieuweVraag, 3000);
}

// Start de timer voor een vraag en telt af
function startTimer() {
  tijdOver = 10;
  timerElement.textContent = "Tijd: " + tijdOver;
  timerBar.style.width = "100%";
  clearInterval(timer);

  timer = setInterval(() => {
    tijdOver--;
    timerElement.textContent = "Tijd: " + tijdOver;
    timerBar.style.width = (tijdOver * 10) + "%";
    if (tijdOver <= 0) {
      clearInterval(timer);
      levens--;
      updateScoreEnLevens();
      showPopup("Te laat!", "orange", "duim omlaag.png");
      setTimeout(nieuweVraag, 3000);
    }
  }, 1000);
}

// Update score en laat het aantal levens zien
function updateScoreEnLevens() {
  scoreElement.textContent = score;
  let hartjes = "❤️".repeat(levens) + "🖤".repeat(3 - levens);
  levensContainer.textContent = hartjes;
}

// Laat het eindscherm zien met score en speel opnieuw-knop
function eindeSpel() {
  kaartContainer.style.display = "none";
  clearInterval(timer);
  document.querySelector('#vraagContainer').innerHTML = `
  <div class="eindscherm">
  <h3>Spel afgelopen!</h3>
  <p>Je score: ${score} van ${totaalVragen}</p>
  <button class="opnieuwBtn" onclick="window.location.reload()">Opnieuw spelen</button>
  </div>
  `;

  // Audio toegevoegd m.b.v. mdn-documentatie: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio (eigen onderzoek)
  if (levens === 0) {
    failGeluid.play();
  } else {
    tadaGeluid.play();
  }
}

// Laat een popup zien met feedback (juist, fout, te laat)
function showPopup(tekst, kleur, image) {
  popupText.textContent = tekst;
  popupAfbeelding.src = 'images/' + image;
  popupText.style.color = kleur;
  popup.style.display = 'block';
  setTimeout(() => popup.style.display = 'none', 3000);
}
