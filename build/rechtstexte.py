#!/usr/bin/env python3
"""Uebernimmt Impressum und Datenschutz aus der alten Seite in das neue Layout.
Rechtstexte werden inhaltlich NICHT veraendert, nur die E-Mail-Obfuskation
'info [at] rmautomobile.de' wird zu einer echten Adresse aufgeloest."""
import re, pathlib

alt = pathlib.Path("/private/tmp/claude-501/-Users-teghnoorsinghpamma/697342c2-861e-49ce-a4b5-f6bf82ce63e9/scratchpad/rm")
ziel = pathlib.Path(__file__).resolve().parent / "seiten"

KOPFVORLAGE = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>{titel} — RM Automobile Ronshausen</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="styles.css">
<link rel="icon" href="bilder/m-logo.png">
</head>
<body>
<!--KOPF-->
<section>
  <div class="wrap rechtstext">
    <h1>{titel}</h1>
{inhalt}
  </div>
</section>
<!--FUSS-->
</body>
</html>
"""

for datei, titel in (("impressum", "Impressum"), ("datenschutz", "Datenschutz")):
    roh = (alt / f"{datei}.html").read_text(encoding="utf-8", errors="ignore")
    inhalt = re.search(r"(?s)<main.*?>(.*?)</main>", roh).group(1)
    # Reste der alten Seite entfernen
    inhalt = re.sub(r"(?is)<script.*?</script>", "", inhalt)
    inhalt = re.sub(r"(?is)<style.*?</style>", "", inhalt)
    inhalt = re.sub(r'(?i) (class|id|style|align|width|height|border|cellpadding|cellspacing)="[^"]*"', "", inhalt)
    inhalt = re.sub(r"(?i)<(/?)(section|div|span|font|center)\b[^>]*>", "", inhalt)
    inhalt = inhalt.replace("info [at] rmautomobile.de", '<a href="mailto:info@rmautomobile.de">info@rmautomobile.de</a>')
    inhalt = inhalt.replace("werkstatt [at] rmautomobile.de", '<a href="mailto:werkstatt@rmautomobile.de">werkstatt@rmautomobile.de</a>')
    # doppelte Ueberschrift oben weg, die steht schon im Template
    inhalt = re.sub(r"(?is)^\s*<h1>.*?</h1>", "", inhalt.strip(), count=1)
    inhalt = re.sub(r"\n{3,}", "\n\n", inhalt).strip()
    (ziel / f"{datei}.src.html").write_text(
        KOPFVORLAGE.format(titel=titel, inhalt=inhalt), encoding="utf-8")
    print("übernommen:", datei, len(inhalt), "Zeichen")
