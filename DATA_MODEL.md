# PAGMAR - Data Model

## Input → Visual Parameter Mapping

### Q1: Name → Core Number (Gematria)
Hebrew gematria, reduced to 1-9.
Controls structural distribution of the point field:
- 1 = single strong center cluster
- 2 = dual opposing clusters
- 3 = three light centers
- 4 = stable grid-like spread
- 5 = scattered open field (wide)
- 6 = circular/harmonic arrangement
- 7 = hidden slow discovery (deep spread)
- 8 = dense connected structure
- 9 = wide horizon, distant peripheral points

### Q2: Date of Birth → Season → Color Palette
- Spring (Mar-May): soft green-blue
- Summer (Jun-Aug): warm gold, deep blue
- Autumn (Sep-Nov): purple, amber
- Winter (Dec-Feb): dark blue, silver, cold

### Q3: Location → Camera Start Offset
Hash of string → initial camera X,Y offset.

### Q4: Time of Day → Reveal Speed
- Morning: 0.8 | Noon: 1.0 | Evening: 0.5 | Night: 0.3 | Inner time: 0.4

### Q5: Hope → Organic Growth Behavior
- Hope = lights multiply slowly
- Clarity = clean lines, less fog
- Courage = strong forward branches
- Beginning = tiny sprouts
- Release = branches loosen and disperse
- Comfort = soft halos, slow movement
- Change = lines shift direction mid-growth
- Sign = one dominant guiding point

### Q6: Aspiration → Constellation Connection Style

### Q7: Revelation Word → Text Bank
Filters which poetic fragments appear near revealed points.

### Q8: Exit → Final Horizon Screen

## Point State Machine
dormant → awakening → connected → growing → prismatic → textRevealed
Triggered by: screen proximity + zoom level + time spent nearby.

## Reproducibility
All random values use seededRand(hash(name + location)).
Same answers always produce the same map.
