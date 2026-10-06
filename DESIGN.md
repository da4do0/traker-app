---
name: Bilancio
description: Diario alimentare e peso in linguaggio dot-matrix, solo tema scuro.
colors:
  void: "#000000"
  tile: "#141414"
  control: "#1E1E1E"
  hairline: "#262626"
  dot-off: "#2A2A2A"
  ink: "#FFFFFF"
  ink-muted: "#8A8A8A"
  ink-faint: "#5C5C5C"
  signal-red: "#D71921"
  macro-carbo: "#FFFFFF"
  macro-prot: "#B5B5B5"
  macro-grassi: "#6E6E6E"
typography:
  title-l:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "34px"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "26px"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  body-s:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  button:
    fontFamily: "Host Grotesk, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "20px"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "14px"
    letterSpacing: "0.08em"
  label-s:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: "12px"
    letterSpacing: "0.06em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.04em"
  data-l:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "0.02em"
rounded:
  field: "16px"
  tile-m: "28px"
  tile-d: "32px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.void}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
    height: "52px"
  button-danger:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
    height: "52px"
  icon-button:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "40px"
  input:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "52px"
  tile:
    backgroundColor: "{colors.tile}"
    rounded: "{rounded.tile-m}"
    padding: "20px"
  tile-desktop:
    backgroundColor: "{colors.tile}"
    rounded: "{rounded.tile-d}"
    padding: "28px"
  segmented-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.void}"
    rounded: "{rounded.pill}"
---

<!-- Ground truth: Figma file "Untitled" (pagine 01 Sistema, 02 Schermate). Variabili collezione "Bilancio", stili testo Mono/* e Text/*, componenti DotChar, Button, Input, StatusBar, BottomNav, Rail. Il codice React non implementa ancora questo sistema. -->

# Design System: Bilancio

## Overview

**Creative North Star: "Il display a punti"**

Bilancio si legge come lo schermo di un dispositivo Nothing: nero assoluto, punti bianchi accesi, segmenti spenti. Ogni schermata ha un numero che conta, scritto in dot-matrix a punti tondi, e una barra a segmenti (il Glyph) che si accende man mano che la giornata procede. Il colore praticamente non esiste: la gerarchia la fanno la scala del numerale, il bianco contro il grigio e un solo rosso che segnala ciò che è vivo adesso.

La densità è da strumento, non da cruscotto: tile grandi a raggio generoso, etichette tecniche in mono maiuscolo, numeri in tabella allineati a destra. Niente ombre, niente gradienti, niente emoji, niente anelli colorati: è il rifiuto esplicito della dashboard fitness a card colorate che era il punto di partenza.

**Key Characteristics:**
- Nero puro come sfondo, tile #141414 come unica profondità.
- Numerali e titoli schermata in dot-matrix a punti tondi (componente `DotChar`).
- Glyph a segmenti per quote e progressi, raggruppato per pasto.
- Etichette in Geist Mono maiuscolo spaziato, testo in Host Grotesk.
- Rosso solo per live, sforamento, distruzione.

## Colors

Monocromo totale con un solo segnale: il palette è nero, quattro grigi strumentali, bianco e un rosso.

### Primary
- **Bianco Acceso** (#FFFFFF): testo principale, punti e segmenti accesi, pillola dell'azione principale (con testo nero).

### Neutral
- **Vuoto** (#000000): sfondo di pagina e barra di navigazione.
- **Tile** (#141414): ogni contenitore, l'unico livello di profondità.
- **Controllo** (#1E1E1E): campi, segmented control, pulsanti icona, sheet interni.
- **Filetto** (#262626): divisori tra righe e sezioni, bordi della rail.
- **Punto spento** (#2A2A2A): punti e segmenti non accesi, griglie di sfondo dei grafici.
- **Grigio Strumento** (#8A8A8A): testo secondario ed etichette (5,9:1 sul nero).
- **Grigio Debole** (#5C5C5C): bordo dei pulsanti secondari, stati vuoti e disabilitati. Mai per testo corrente.
- **Macro** (#FFFFFF / #B5B5B5 / #6E6E6E): carboidrati, proteine, grassi quando serve distinguerli in un unico grafico, per livelli di luminosità.

### Tertiary
- **Rosso Segnale** (#D71921): il punto "oggi/live" accanto a date, valori correnti e voce di navigazione attiva; la misura più recente nei grafici; la distanza dall'obiettivo; azioni distruttive; bordi di errore.

### Named Rules
**The One Signal Rule.** Il rosso non decora mai. Compare solo per dire "questo è adesso", "hai sforato" o "questo cancella". Sotto il 2% della superficie.

**The No-Hue Rule.** Nessun colore di categoria. Le macro si distinguono per luminosità, Nutri-Score e NOVA per posizione su una scala a segmenti con lettera, non per colore.

## Typography

**Display:** dot-matrix custom (componente `DotChar`, griglia 5×7 più un'ottava riga per le discendenti g, p, q, y; punti tondi)
**Body Font:** Host Grotesk (fallback system-ui)
**Label/Mono Font:** Geist Mono (fallback ui-monospace)

**Character:** il dot-matrix dà la voce del dispositivo, Host Grotesk parla da persona, Geist Mono etichetta come un pannello tecnico.

### Hierarchy
- **Dot display** (punti tondi, passo 16–24 px per il numero eroe, 5–9 px per numeri di tile, 5,5–8 px per i titoli schermata): kcal rimanenti, peso, quote, titoli come «oggi», «diario», «peso». Mai per frasi.
- **Title L** (600, 28/34, −0,02em): titoli di dialog, nomi prodotto, stati vuoti.
- **Title** (600, 20/26): nomi dei pasti, titoli di sezione nelle tile.
- **Body** (400, 15/22): descrizioni, ingredienti, messaggi. Misura massima ~65ch.
- **Body S** (400, 13/18): note, aiuti sotto i campi, testi secondari.
- **Button** (600, 15/20): etichette delle pillole.
- **Label** (Geist Mono 500, 11/14, +8%, MAIUSCOLO): intestazioni di tile, nomi campo, unità.
- **Data / Data L** (Geist Mono 600, 12–15, +2–4%): valori numerici in tabelle e riepiloghi, allineati a destra.

### Named Rules
**The Number Leads Rule.** In ogni tile il numero che conta è in dot-matrix e domina per scala; tutto il resto è etichetta mono o testo piccolo.

**The No Kicker Rule.** Nessuna etichetta sopra un titolo. Le etichette mono vivono dentro le tile come intestazione di dato, mai come occhiello di un heading.

## Layout

Mobile 390 px: margini 16–20 px, tile a tutta larghezza (358 px) o affiancate a coppie (173 px) con gap 12 px; barra di navigazione fissa in basso (92 px) con tre voci e la pillola «Aggiungi». Le schermate di task (cerca, dettaglio, crea) sostituiscono la navigazione con una freccia indietro e una barra azione fissa in basso.

Desktop 1440 px: rail sinistra 248 px, area contenuto 1096 px su griglia a 12 colonne con gap 24 px e margini 48 px. Composizioni tipiche: eroe 8 + peso 4; macro 4 + metabolismo 4 + pasti 4; ricerca 5 + dettaglio 7 in split view; dialog centrati 460–880 px su scrim nero al 72%. Nel diario desktop il tile «Totale del giorno» (4 colonne) è sticky mentre le sezioni pasto scorrono.

Ritmo: 4/8/12/16/20/24/32/48. Più spazio sopra un titolo che sotto.

## Elevation & Depth

Piatto per definizione. La profondità è solo tonale: tile #141414 sul nero, controlli #1E1E1E dentro le tile. Nessuna ombra, nessun blur, nessun gradiente. Modali e sheet si staccano con uno scrim nero al 72% sopra la schermata, mai con un'ombra.

### Named Rules
**The Flat Screen Rule.** Un display a punti non sa disegnare ombre: se serve separare, cambia tono o aggiungi un filetto #262626.

## Shapes

Raggi generosi e coerenti: tile 28 px (mobile) e 32 px (desktop), campi e sheet interni 16–20 px, pillole e pulsanti icona completamente arrotondati. Punti sempre cerchi perfetti; segmenti del Glyph sono capsule (raggio = metà larghezza). Filetti da 1 px. Linee tratteggiate solo per obiettivi e distanze nei grafici.

## Components

### Buttons
- **Shape:** pillola (999 px), altezza 52 (L) o 40–44 (M).
- **Primary:** fondo bianco, testo nero Host Grotesk 600, icona più opzionale. Una per schermata oltre all'«Aggiungi» globale.
- **Secondary:** trasparente con bordo 1 px #5C5C5C, testo bianco.
- **Ghost:** solo testo bianco.
- **Danger:** fondo rosso #D71921, testo bianco. Solo per eliminare.
- **Icon button:** cerchio 32–56 px #1E1E1E con icona lineare bianca 1,5 px.

### Chips
- **Style:** pillola con bordo 1 px (bianco per allergeni, #5C5C5C per preset quantità), testo Geist Mono maiuscolo.

### Cards / Containers
- **Corner Style:** 28 px mobile, 32 px desktop.
- **Background:** #141414.
- **Shadow Strategy:** nessuna (vedi Elevation).
- **Border:** nessuno; placeholder vuoti con bordo tratteggiato #262626.
- **Internal Padding:** 20 px mobile, 28–32 px desktop.

### Inputs / Fields
- **Style:** fondo #1E1E1E, raggio 16, altezza 52, icona lineare a sinistra, unità in Geist Mono a destra, etichetta mono sopra.
- **Focus:** bordo 1 px bianco e caret bianco.
- **Error:** bordo 1 px rosso, messaggio in banner rosso al 14% con punto rosso.

### Navigation
- **Mobile:** barra nera con filetto superiore, tre voci (icona + etichetta mono), attiva in bianco con punto rosso sotto, inattive #8A8A8A; pillola bianca «Aggiungi» a destra.
- **Desktop:** rail 248 px con wordmark dot-matrix, pillola «Aggiungi alimento», voci con icona e testo (senza etichetta di gruppo), attiva su fondo #141414 con punto rosso, utente in fondo.

### Glyph (componente firma)
Barra di capsule (30–48 segmenti) che rappresenta una quota: segmenti accesi bianchi, spenti #2A2A2A. Per la giornata i segmenti accesi sono raggruppati per pasto con un gap più largo e un'etichetta mono sotto ogni gruppo; la parte spenta è etichettata «LIBERE» con le kcal restanti. In anteprima, i segmenti che stai per aggiungere sono capsule a contorno bianco.

**Movimento (l'unico momento animato del sistema):** alla conferma i nuovi segmenti si accendono uno alla volta (sfasamento 60 ms, opacità 0 → 1, `cubic-bezier(0.16, 1, 0.3, 1)`), il numero dot-matrix scorre dal vecchio al nuovo valore in 600 ms, i segmenti a contorno seguono la quantità in tempo reale. Con `prefers-reduced-motion` lo stato finale compare subito. Nessun'altra animazione decorativa.

### Foto prodotto
Risultati di ricerca, scheda prodotto e aggiunta mostrano l'immagine OpenFoodFacts in scala di grigi dentro un riquadro #1E1E1E a raggio 16; senza immagine si usa il monogramma dot-matrix dell'iniziale. Nel file Figma il riquadro è un segnaposto tratteggiato «FOTO OFF».

### Dot chart
Grafici come matrici di punti: griglia di punti spenti come assi, misure come punti bianchi, ultima misura in rosso, obiettivo come linea tratteggiata bianca, distanza dall'obiettivo come tratteggio rosso.

## Do's and Don'ts

### Do:
- **Do** scrivere il numero che conta di ogni schermata in dot-matrix a punti tondi.
- **Do** usare il Glyph a segmenti per quote e progressi, raggruppando per pasto quando i dati lo permettono.
- **Do** tenere tutte le etichette in Geist Mono maiuscolo spaziato (+6/+8%).
- **Do** allineare a destra i numeri in Geist Mono nelle tabelle.
- **Do** mostrare il metodo dietro un numero calcolato (BMR → TDEE → quota).
- **Do** usare il punto rosso solo per il dato di oggi, lo sforamento, l'eliminazione.
- **Do** mostrare ogni valore una sola volta per schermata; i valori fissi (altezza) sono righe dati, non tile.
- **Do** arrotondare le percentuali come l'app (`Math.round`): 1.011 / 1.698 = 60%.

### Don't:
- **Don't** usare colori di categoria per macro, pasti o punteggi.
- **Don't** usare ombre, gradienti, blur o vetro.
- **Don't** usare emoji o glifi Unicode come icone: solo icone lineari 1,5 px.
- **Don't** mettere un'etichetta sopra un titolo.
- **Don't** mostrare obiettivi o valori che l'app non calcola (per esempio obiettivi di macro).
- **Don't** usare il dot-matrix per frasi o testo corrente.
