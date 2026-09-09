/* RM Automobile — Bewegung, WhatsApp, Chat-Assistent.
   Alles ohne fremde Bibliotheken, keine Tracker, keine externen Aufrufe.
   Der Assistent antwortet aus einer festen Wissensbasis. Soll später ein echtes
   Sprachmodell antworten, wird BOT_ENDPUNKT auf die eigene Schnittstelle gesetzt,
   dann geht die Frage dorthin und der Text unten dient nur noch als Rückfall. */

const BOT_ENDPUNKT = ""; // z. B. "/api/assistent" — leer heißt: nur lokale Antworten
const RUHIG = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Einblenden beim Scrollen ---------- */
(function bewegung() {
  if (RUHIG) return;
  const auswahl = [
    "section .kopfzeile", "section .karte", "section .person", "section .hinweis",
    "section .bildrahmen", "section .liste li", "section .zeitstrahl li",
    "section .zeiten", "section .partner img", "section > .wrap > h2",
    "section > .wrap > .lead", ".fussgrid > div"
  ];
  const teile = document.querySelectorAll(auswahl.join(","));
  teile.forEach(el => el.classList.add("reveal"));

  const beobachter = new IntersectionObserver((eintraege, selbst) => {
    eintraege.forEach((e, i) => {
      if (!e.isIntersecting) return;
      const nachbarn = [...e.target.parentElement.children].indexOf(e.target);
      e.target.style.transitionDelay = Math.min(nachbarn, 6) * 70 + "ms";
      e.target.classList.add("da");
      selbst.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  teile.forEach(el => beobachter.observe(el));
})();

/* ---------- Zahlen hochzählen ---------- */
(function zaehler() {
  const felder = document.querySelectorAll("[data-zahl]");
  if (!felder.length) return;
  const lauf = (el) => {
    const ziel = parseInt(el.dataset.zahl, 10);
    const start = parseInt(el.dataset.von || (ziel - 40), 10);
    if (RUHIG) { el.textContent = ziel; return; }
    const dauer = 1400, beginn = performance.now();
    const schritt = (jetzt) => {
      const p = Math.min((jetzt - beginn) / dauer, 1);
      const weich = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (ziel - start) * weich);
      if (p < 1) requestAnimationFrame(schritt);
    };
    requestAnimationFrame(schritt);
  };
  const beobachter = new IntersectionObserver((eintraege, selbst) => {
    eintraege.forEach(e => {
      if (!e.isIntersecting) return;
      lauf(e.target);
      selbst.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  felder.forEach(el => beobachter.observe(el));
})();

/* ---------- Kopfzeile beim Scrollen ---------- */
(function kopf() {
  const k = document.querySelector("header.kopf");
  if (!k) return;
  const pruefen = () => k.classList.toggle("klebt", window.scrollY > 30);
  pruefen();
  window.addEventListener("scroll", pruefen, { passive: true });
})();

/* ---------- Öffnungszeiten: haben wir gerade offen? ---------- */
function geoeffnet() {
  const j = new Date(), tag = j.getDay(), std = j.getHours() + j.getMinutes() / 60;
  if (tag === 0) return { offen: false, text: "Sonntag ist geschlossen. Montag ab 9 Uhr sind wir wieder da." };
  if (tag === 6) return std >= 9 && std < 14
    ? { offen: true, text: "Wir haben gerade geöffnet, samstags bis 14 Uhr." }
    : { offen: false, text: "Samstags sind wir von 9 bis 14 Uhr da." };
  return std >= 9 && std < 18
    ? { offen: true, text: "Wir haben gerade geöffnet, heute bis 18 Uhr." }
    : { offen: false, text: "Gerade ist zu. Montag bis Freitag sind wir von 9 bis 18 Uhr da, samstags von 9 bis 14 Uhr." };
}

/* ---------- Wissensbasis des Assistenten ---------- */
const TEL_VERKAUF = '<a href="tel:+4966224208362">06622 42083-62</a>';
const TEL_WERKSTATT = '<a href="tel:+4966224208363">06622 42083-63</a>';
const TEL_ZENTRALE = '<a href="tel:+4966224208361">06622 42083-61</a>';

const WISSEN = [
  {
    worte: ["öffnungszeit", "offen", "geöffnet", "geschlossen", "wann", "uhrzeit", "samstag", "sonntag", "feierabend"],
    antwort: () => geoeffnet().text +
      "<br><br>An- und Verkauf, Ziegeleistraße 1: Montag bis Freitag 9 bis 18 Uhr, Samstag 9 bis 14 Uhr. Die Werkstatt im Postweg 5 hat dieselben Zeiten."
  },
  {
    gewicht: 2,
    worte: ["hu", "au", "tüv", "tuev", "hauptuntersuchung", "abgasuntersuchung", "plakette", "prüfung"],
    antwort: () => "Haupt- und Abgasuntersuchung machen wir im Haus, dienstags um 14 Uhr und donnerstags um 8 Uhr. Bitte vorher anmelden, dann sehen wir das Fahrzeug vor der Prüfung noch durch.<br><br>Termin: " + TEL_WERKSTATT
  },
  {
    gewicht: 2,
    worte: ["verkaufen", "ankauf", "ankaufen", "verkauf mein", "inzahlung", "inzahlungnahme", "loswerden", "was ist mein auto wert", "wert"],
    antwort: () => "Wir kaufen Fahrzeuge von Privat- und Firmenkunden an und machen Ihnen nach der Besichtigung ein marktgerechtes Angebot. Läuft noch eine Finanzierung, übernehmen wir die Kreditablöse und die Formalitäten. Beim Kauf eines Fahrzeugs bei uns rechnen wir Ihr altes direkt an.<br><br>Am schnellsten: <a href='ankauf.html'>Fahrzeug anbieten</a> oder anrufen unter " + TEL_VERKAUF
  },
  {
    worte: ["bestand", "fahrzeug", "auto kaufen", "gebrauchtwagen", "jahreswagen", "angebot",
      "welche autos", "modell", "kombi", "suv", "limousine", "cabrio", "diesel", "benziner",
      "automatik", "familienauto", "kleinwagen", "vorrätig", "auf lager", "da"],
    antwort: () => "Unseren aktuellen Bestand sehen Sie unter <a href='fahrzeuge.html'>Fahrzeuge</a>, mit Bildern, Ausstattung und Preis. Ist Ihr Wunschfahrzeug nicht dabei, legen wir einen Suchauftrag an.<br><br>Vor Ort schauen geht ohne Termin, die Ausstellungsfläche ist während der Öffnungszeiten offen. Fragen zum Fahrzeug: " + TEL_VERKAUF
  },
  {
    worte: ["finanzier", "raten", "kredit", "leasing", "santander", "bezahlen"],
    antwort: () => "Für die Finanzierung arbeiten wir mit der Santander Consumer Bank. Das Angebot rechnen wir im persönlichen Gespräch, weil es von Fahrzeug, Laufzeit und Anzahlung abhängt. Eine laufende Finanzierung auf Ihrem alten Fahrzeug lösen wir ab.<br><br>Durchrechnen lassen: " + TEL_VERKAUF
  },
  {
    worte: ["garantie", "gewährleistung", "sicherheit beim kauf"],
    antwort: () => "Beim Kauf oder für ein Fahrzeug, das Sie schon fahren, können Sie bei uns gegen Aufpreis eine Gebrauchtfahrzeug-Garantie abschließen. Es gelten die Bedingungen der Garantiegesellschaft, die gehen wir mit Ihnen durch.<br><br>Fragen dazu: " + TEL_VERKAUF
  },
  {
    worte: ["werkstatt", "reparatur", "inspektion", "service", "wartung", "kaputt", "warnleuchte",
      "motor", "bremse", "kupplung", "auspuff", "klima", "klimaanlage", "scheibe", "karosserie",
      "unfall", "diagnose", "ölwechsel", "batterie", "zahnriemen", "achse", "stoßdämpfer",
      "fehlerspeicher", "auslesen"],
    antwort: () => "Unsere Meisterwerkstatt macht Inspektion nach Herstellervorgaben, Unfallreparatur und Karosserie, Bremsen, Klimaanlage, Scheiben, Reifen und Fahrzeugdiagnose für alle Hersteller. Für BMW und Mini haben wir zusätzlich den Diagnosetester Autologic.<br><br>Alle Leistungen: <a href='werkstatt.html'>Werkstatt</a> · Termin: " + TEL_WERKSTATT
  },
  {
    worte: ["reifen", "felge", "räder", "einlagern", "einlagerung", "wuchten", "winterreifen", "sommerreifen"],
    antwort: () => "Reifen, Felgen und Kompletträder bestellen wir für Sie. Montieren, wuchten und einlagern machen wir ebenfalls.<br><br>Termin: " + TEL_WERKSTATT
  },
  {
    worte: ["ersatzwagen", "leihwagen", "mietwagen", "überbrück", "solange"],
    antwort: () => "Während der Reparatur stellen wir auf Wunsch einen Leihwagen gegen Gebühr. Sagen Sie das am besten gleich bei der Terminvereinbarung: " + TEL_WERKSTATT
  },
  {
    worte: ["holen", "bringen", "abholen", "hol- und bring", "abholung"],
    antwort: () => "Wir holen Ihr Fahrzeug ab und bringen es zurück, wenn Sie es zeitlich nicht in die Werkstatt schaffen. Einfach beim Termin Bescheid sagen: " + TEL_WERKSTATT
  },
  {
    worte: ["wo", "adresse", "anfahrt", "finden", "standort", "parken", "route", "ronshausen"],
    antwort: () => "An- und Verkauf: Ziegeleistraße 1, 36217 Ronshausen. Die Werkstatt ist im Postweg 5, ebenfalls in Ronshausen.<br><br>Ronshausen liegt an der A4 zwischen Bad Hersfeld und Bebra. <a href='kontakt.html'>Anfahrt und Routenplanung</a>"
  },
  {
    worte: ["wer", "ansprechpartner", "team", "mitarbeiter", "meister", "chef", "inhaber"],
    antwort: () => "Für Verkauf und Einkauf ist Dashmir Mislimi zuständig, " + TEL_VERKAUF + ". Kfz-Meister ist Mergim Mislimi, " + TEL_WERKSTATT + ", dazu Kfz-Mechatroniker Uwe Hempel."
  },
  {
    worte: ["telefon", "nummer", "anrufen", "erreichen", "kontakt", "mail", "email", "e-mail", "schreiben"],
    antwort: () => "Zentrale: " + TEL_ZENTRALE + " · Verkauf: " + TEL_VERKAUF + " · Werkstatt: " + TEL_WERKSTATT + "<br>Mobil: <a href='tel:+491735484398'>0173 5484398</a><br>E-Mail: <a href='mailto:info@rmautomobile.de'>info@rmautomobile.de</a><br><br>Oder über das <a href='kontakt.html'>Kontaktformular</a>."
  },
  {
    worte: ["seit wann", "gegründet", "geschichte", "wie lange", "2007", "firma", "unternehmen", "über euch"],
    antwort: () => "RM Automobile gibt es seit 2007, angefangen in Bebra-Weiterode. 2008 sind wir nach Ronshausen gezogen, 2011 kam die eigene Meisterwerkstatt dazu. Seit 2012 sind wir in der Innung der Metallhandwerke für den Kreis Hersfeld-Rotenburg.<br><br>Die ganze Geschichte: <a href='unternehmen.html'>Betrieb</a>"
  },
  {
    worte: ["preis", "kostet", "kosten", "stundensatz", "was zahle"],
    antwort: () => "Preise nennen wir nicht pauschal, weil sie vom Fahrzeug und vom Umfang abhängen. Rufen Sie kurz durch, dann bekommen Sie eine belastbare Auskunft statt einer Schätzung: Werkstatt " + TEL_WERKSTATT + ", Verkauf " + TEL_VERKAUF
  },
  {
    worte: ["termin", "vereinbaren", "buchen", "wann kann ich kommen"],
    antwort: () => "Termine machen wir am Telefon oder über das Formular. Werkstatt: " + TEL_WERKSTATT + " oder <a href='werkstatt.html#termin'>Termin anfragen</a>. Zum Fahrzeug anschauen brauchen Sie keinen Termin, kommen Sie einfach in den Öffnungszeiten vorbei."
  },
  {
    gewicht: 3,
    worte: ["motorrad", "wohnmobil", "wohnwagen", "lkw", "transporter", "anhänger", "traktor", "roller"],
    antwort: () => "Ob wir das übernehmen können, sage ich Ihnen lieber nicht auf gut Glück. Unsere Seite deckt Pkw ab. Rufen Sie kurz in der Werkstatt an, dann bekommen Sie eine klare Antwort: " + TEL_WERKSTATT
  },
  {
    worte: ["hallo", "hi", "guten tag", "moin", "servus", "hey"],
    antwort: () => "Hallo. " + geoeffnet().text + " Was brauchen Sie: ein Fahrzeug, einen Werkstatt-Termin, oder wollen Sie Ihr Auto verkaufen?"
  },
  {
    worte: ["danke", "dankeschön", "super", "top", "passt"],
    antwort: () => "Gern. Wenn noch etwas offen ist, fragen Sie einfach. Am schnellsten geht es telefonisch unter " + TEL_ZENTRALE
  }
];

function antwortFinden(frage) {
  const text = " " + frage.toLowerCase().replace(/[^a-zäöüß0-9]+/g, " ") + " ";
  let bester = null, bestpunkte = 0;
  WISSEN.forEach(eintrag => {
    let punkte = 0;
    eintrag.worte.forEach(w => {
      // kurze Kürzel wie "hu" nur als eigenes Wort werten, damit sie nicht in
      // anderen Wörtern zufällig treffen
      const treffer = w.length <= 3 ? text.includes(" " + w + " ") : text.includes(w);
      if (treffer) punkte += Math.max(w.length, 4) * (eintrag.gewicht || 1);
    });
    if (punkte > bestpunkte) { bestpunkte = punkte; bester = eintrag; }
  });
  if (bester) return bester.antwort();
  return "Das kann ich Ihnen hier nicht sicher beantworten, und raten möchte ich nicht. Rufen Sie kurz an, dann bekommen Sie eine verbindliche Auskunft: " +
    TEL_ZENTRALE + "<br><br>Oder schreiben Sie uns über das <a href='kontakt.html'>Kontaktformular</a>, wir melden uns zu den Öffnungszeiten.";
}

/* ---------- Chat-Oberfläche ---------- */
(function chat() {
  const knopf = document.getElementById("bot-knopf");
  const fenster = document.getElementById("chat");
  if (!knopf || !fenster) return;
  const lauf = fenster.querySelector(".chat-lauf");
  const eingabe = fenster.querySelector("input");
  const senden = fenster.querySelector(".chat-fuss button");
  const zu = fenster.querySelector(".chat-kopf button");
  let begonnen = false;

  const blase = (html, wer) => {
    const el = document.createElement("div");
    el.className = "blase " + wer;
    el.innerHTML = html;
    lauf.appendChild(el);
    lauf.scrollTop = lauf.scrollHeight;
    return el;
  };

  const tippt = () => {
    const el = document.createElement("div");
    el.className = "tippt";
    el.innerHTML = "<i></i><i></i><i></i>";
    lauf.appendChild(el);
    lauf.scrollTop = lauf.scrollHeight;
    return el;
  };

  async function fragen(text) {
    blase(text.replace(/</g, "&lt;"), "ich");
    const punkte = tippt();
    let antwort;
    if (BOT_ENDPUNKT) {
      try {
        const r = await fetch(BOT_ENDPUNKT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frage: text })
        });
        antwort = (await r.json()).antwort || antwortFinden(text);
      } catch (e) {
        antwort = antwortFinden(text);
      }
    } else {
      antwort = antwortFinden(text);
      await new Promise(r => setTimeout(r, 420 + Math.random() * 320));
    }
    punkte.remove();
    blase(antwort, "bot");
  }

  const oeffnen = () => {
    fenster.classList.add("offen");
    knopf.setAttribute("aria-expanded", "true");
    if (!begonnen) {
      begonnen = true;
      const stand = geoeffnet();
      fenster.querySelector(".chat-kopf .status").textContent = stand.offen ? "gerade erreichbar" : "schreiben Sie uns, wir melden uns";
      setTimeout(() => blase("Hallo, ich bin der Assistent von RM Automobile. " + stand.text + "<br><br>Wobei kann ich helfen?", "bot"), 260);
    }
    setTimeout(() => eingabe.focus(), 300);
  };

  knopf.addEventListener("click", () => fenster.classList.contains("offen")
    ? (fenster.classList.remove("offen"), knopf.setAttribute("aria-expanded", "false"))
    : oeffnen());
  zu.addEventListener("click", () => { fenster.classList.remove("offen"); knopf.setAttribute("aria-expanded", "false"); });

  const abschicken = () => {
    const t = eingabe.value.trim();
    if (!t) return;
    eingabe.value = "";
    fragen(t);
  };
  senden.addEventListener("click", abschicken);
  eingabe.addEventListener("keydown", e => { if (e.key === "Enter") abschicken(); });
  fenster.querySelectorAll(".chat-vorschlaege button").forEach(b =>
    b.addEventListener("click", () => fragen(b.textContent)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && fenster.classList.contains("offen")) {
      fenster.classList.remove("offen");
      knopf.setAttribute("aria-expanded", "false");
    }
  });
})();
