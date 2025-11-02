import pandas as pd
import matplotlib.pyplot as plt

# --- Läs in TTFB-data ---
original_df  = pd.read_csv("baseline.csv",  usecols=["TTFBms"])
optimized_df = pd.read_csv("optimized.csv", usecols=["TTFBms"])

# --- Konvertera till numeriskt (om t.ex. decimaler har kommatecken) ---
original_df["TTFBms"]  = pd.to_numeric(original_df["TTFBms"].astype(str).str.replace(",", "."), errors="coerce")
optimized_df["TTFBms"] = pd.to_numeric(optimized_df["TTFBms"].astype(str).str.replace(",", "."), errors="coerce")

# --- Ta fram x-axel = mätningarnas index ---
x = range(1, len(original_df) + 1)

# --- Rita linjediagram (utan markörer) ---
plt.figure(figsize=(8,5))
plt.plot(x, original_df["TTFBms"],  color="blue",  linestyle="-", label="Original")
plt.plot(x, optimized_df["TTFBms"], color="green", linestyle="-", label="Optimized")

# --- Etiketter, titel, layout ---
plt.xlabel("Measurement index")
plt.ylabel("TTFB (ms)")
plt.title("Original vs. Optimized TTFB")
plt.legend()
plt.grid(True, linestyle="--", alpha=0.6)
plt.tight_layout()
plt.show()