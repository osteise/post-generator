import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

def read_ttfb_ms(path: str) -> pd.Series:
    # Läs endast kolumnen 'TTFBms'
    s = pd.read_csv(path, sep=None, engine="python", usecols=["TTFBms"]).squeeze("columns")
    # Byt kommatecken till punkt och konvertera till numeriskt
    s = pd.to_numeric(s.astype(str).str.replace(',', '.', regex=False), errors='coerce')
    return s.dropna()

# --- Läs in data ---
original  = read_ttfb_ms("baseline.csv")
optimized = read_ttfb_ms("optimized.csv")

# --- Skapa gemensamma bins ---
step = 25  # intervall i ms
vmin = np.floor(min(original.min(), optimized.min()) / step) * step
vmax = np.ceil(max(original.max(), optimized.max()) / step) * step
if vmin == vmax:
    vmax = vmin + step
bins = np.arange(vmin, vmax + step, step)

# --- Rita histogram (stående) ---
plt.figure(figsize=(8,6))
plt.hist(original,  bins=bins, alpha=0.6, label='Original')
plt.hist(optimized, bins=bins, alpha=0.6, label='Optimerad')

# --- Etiketter & layout ---
plt.xlabel("TTFB (ms)")
plt.ylabel("Frequency")
plt.title("TTFB – original vs optimerad WordPress")
plt.legend()
plt.grid(axis='x', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()