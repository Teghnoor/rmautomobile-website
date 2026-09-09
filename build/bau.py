#!/usr/bin/env python3
"""Setzt Kopf und Fuss aus index.html in alle Unterseiten ein.
Quelle der Wahrheit fuer Navigation, Topbar und Footer ist index.html.
Unterseiten liegen als *.src.html in build/seiten/ und tragen die Marker
<!--KOPF--> und <!--FUSS-->."""
import re, pathlib

wurzel = pathlib.Path(__file__).resolve().parent.parent
index = (wurzel / "index.html").read_text(encoding="utf-8")

kopf = re.search(r'(?s)<body>\s*(.*?)\s*<section class="hero">', index).group(1)
fuss = re.search(r'(?s)(<footer class="fuss">.*?</footer>)', index).group(1)

for quelle in sorted((wurzel / "build" / "seiten").glob("*.src.html")):
    ziel = wurzel / quelle.name.replace(".src.html", ".html")
    text = quelle.read_text(encoding="utf-8")
    seite = ziel.name
    # aktive Navigation pro Seite setzen
    k = kopf.replace(' aria-current="page"', '')
    k = re.sub(r'(<a href="%s")' % re.escape(seite), r'\1 aria-current="page"', k, count=1)
    text = text.replace("<!--KOPF-->", k).replace("<!--FUSS-->", fuss)
    if "interaktiv.js" not in text:
        text = text.replace("</body>", '<script src="interaktiv.js" defer></script>\n</body>')
    ziel.write_text(text, encoding="utf-8")
    print("gebaut:", ziel.name)
