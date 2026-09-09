# RM Automobile — Website-Neufassung

**Kunde:** RM Automobile, Autohandel & Kfz-Meisterbetrieb, Ronshausen
**Bestandsseite:** https://www.rmautomobile.de (Stand im Fuß: © 2021)
**Stand dieser Fassung:** 2026-09-09

## Aufbau

```
index.html        Startseite
fahrzeuge.html    Fahrzeugbestand (mobile.de-Widget, customerId 45537209)
werkstatt.html    Leistungen, HU/AU, Ansprechpartner, Terminformular
ankauf.html       Fahrzeug verkaufen, Inzahlungnahme, Anbieten-Formular
unternehmen.html  Historie 2007–2026, Team, Partner
kontakt.html      Kontaktformular, Kontaktdaten, Anfahrt
impressum.html    Pflichtangaben + Haftung (Datenschutzteil ausgelagert)
datenschutz.html  1:1 aus der Bestandsseite übernommen
styles.css        ein Stylesheet für alles
interaktiv.js     Animationen, Chat-Assistent, Öffnungszeiten-Logik
bilder/           Logo, Partner-Logos, Fotos (aus der Bestandsseite)
agb.pdf           aus der Bestandsseite übernommen
build/            Generator + Quelldateien der Unterseiten
```

## Bearbeiten

Kopf, Navigation, Topbar und Fuß stehen **nur in `index.html`**. Unterseiten liegen als
`build/seiten/*.src.html` mit den Markern `<!--KOPF-->` und `<!--FUSS-->`.

Nach jeder Änderung an einer Unterseite oder am Kopf/Fuß:

```bash
cd ~/rmautomobile-website && python3 build/bau.py
```

Die fertigen `*.html` im Wurzelverzeichnis nicht direkt bearbeiten, sie werden überschrieben.
Ausnahme: `index.html`, die ist die Quelle.

Lokal ansehen:

```bash
cd ~/rmautomobile-website && python3 -m http.server 8931
```

## Was geändert wurde

- **Struktur nach Anliegen statt nach Firmenlogik.** Kaufen, Verkaufen, Werkstatt sind
  drei eigene Wege mit eigener Seite. Vorher war „Auto verkaufen" nur ein Absatz auf der
  Autohandel-Seite, obwohl der Ankauf ein Umsatzweg ist.
- **Neue Seite `ankauf.html`** mit Formular für Fahrzeugdaten. Vorher gab es dafür keinen
  eigenen Einstieg und kein passendes Formular.
- **HU- und AU-Termine** stehen auf der Startseite im Faktenband und als eigene Box, nicht
  erst unten auf einer Unterseite.
- **Telefonnummern sind überall Klick-Links**, nach Zuständigkeit getrennt (Verkauf -62,
  Werkstatt -63).
- **Fahrzeugbestand lädt erst auf Klick.** Das mobile.de-Widget zieht sonst ungefragt ein
  eigenes Cookie-Banner über die Seite und baut die Verbindung ohne Einwilligung auf.
- **Keine eingebettete Karte.** Anfahrt läuft über zwei Adressboxen mit Routen-Link. Google
  Maps taucht in der Datenschutzerklärung nicht auf, ein Karten-iframe wäre also ohne
  Einwilligung angreifbar.
- **Impressum entschlackt.** Auf der alten Seite standen Impressum, komplette
  Datenschutzerklärung und AGB-Hinweise auf einer Seite. Jetzt getrennt.
- **E-Mail-Adressen sind echte Links** statt „info [at] rmautomobile.de".
- Responsive, ein Stylesheet, keine jQuery, keine externen Schriften, Bilder verkleinert.

## Bewegung, WhatsApp und Assistent

**Animationen** stecken in `interaktiv.js` und `styles.css`. Kein Framework, keine fremde
Bibliothek. Die Reveal-Klassen vergibt das Skript selbst, Unterseiten brauchen dafür kein
eigenes Markup. Enthalten: gestaffeltes Einblenden beim Scrollen, langsamer Zoom auf dem
Hero-Bild, Hochzählen der Jahreszahlen im Faktenband, mitlaufende Kopfzeile, Hover-Effekte
auf Karten, Listen und Bildern. Wer im Betriebssystem weniger Bewegung eingestellt hat,
bekommt alles statisch, das ist über `prefers-reduced-motion` geregelt.

**WhatsApp-Knopf** unten rechts, verlinkt auf `wa.me/491735484398` mit vorbereitetem Text.
⚠️ Das ist die Mobilnummer aus dem Impressum. Ob dort tatsächlich WhatsApp läuft, muss der
Kunde bestätigen. Wenn nicht: den Block `<a class="rundknopf wa" ...>` in `index.html`
entfernen und neu bauen.

**Assistent** (roter Knopf) beantwortet die häufigen Fragen aus einer festen Wissensbasis:
Öffnungszeiten inklusive Prüfung, ob gerade offen ist, HU- und AU-Termine, Ankauf,
Finanzierung, Garantie, Werkstattleistungen, Reifen, Ersatzwagen, Hol- und Bringservice,
Anfahrt, Ansprechpartner, Firmengeschichte. Er nennt nur, was auf der Seite steht. Bei
allem anderen sagt er das offen und verweist ans Telefon. Preise nennt er bewusst nicht.

Soll später ein echtes Sprachmodell antworten: in `interaktiv.js` ganz oben
`BOT_ENDPUNKT` auf die eigene Schnittstelle setzen, etwa `/api/assistent`. Das Skript
schickt die Frage dann als JSON dorthin und erwartet `{"antwort": "..."}` zurück. Fällt der
Dienst aus, greift automatisch die lokale Wissensbasis. Der API-Schlüssel gehört auf den
Server, niemals in diese Datei.

## Inhalte: alles aus der Bestandsseite verifiziert

Adressen, Telefonnummern, Öffnungszeiten, HU/AU-Termine, Leistungsliste, Team,
Firmenhistorie, Partner und Rechtstexte stammen wörtlich von rmautomobile.de.
**Nichts erfunden:** keine Bewertungen, keine Preise, keine Fahrzeugzahlen, keine
Versprechen zu Reaktionszeiten.

## Offene Punkte vor dem Livegang

1. **Formularversand.** Die drei Formulare posten auf `kontakt.php`. Das muss der Hoster
   bereitstellen, sonst laufen die Anfragen ins Leere. Alternativ ein Dienst wie Formspree.
2. **Datenschutz um die Formulare ergänzen.** Die übernommene Erklärung nennt
   „Kontaktmöglichkeit über die Internetseite", die neuen Felder (Fahrzeugdaten beim Ankauf)
   sollte der Kunde gegenlesen lassen.
3. **Bilder.** Es gibt nur drei Fotos aus der alten Seite. Das Luftbild zeigt vermutlich den
   **alten Standort** (2026 Umzug von der Eisenacher Straße 64A in die Ziegeleistraße 1).
   Vor dem Livegang klären und neue Fotos vom jetzigen Gelände machen.
4. **Fahrzeugbestand.** Das mobile.de-Widget läuft, im Test waren 52 Fahrzeuge im Bestand.
   Es lädt jetzt erst auf Klick (Zwei-Klick-Lösung), weil es sonst ungefragt eine Verbindung
   zu mobile.de aufbaut und ein eigenes Cookie-Banner über die Seite legt.
5. **AGB-PDF** ist die Datei von der alten Seite. Stand prüfen lassen.
6. **Google-Unternehmensprofil und Bewertungen** fehlen komplett. Eigener Hebel, nicht Teil
   dieser Fassung.
7. **WhatsApp-Nummer bestätigen lassen**, siehe oben.
8. **Hosting und Domain.** Aktuell PHP-Seite. Diese Fassung ist statisch, läuft überall.
