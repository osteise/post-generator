import pandas as pd
from scipy import stats
import numpy as np

def read_ttfb_ms(path: str) -> pd.Series:
    """Läser TTFBms-kolumnen och konverterar kommatecken till punkt."""
    s = pd.read_csv(path, sep=None, engine="python", usecols=["TTFBms"]).squeeze("columns")
    s = pd.to_numeric(s.astype(str).str.replace(",", ".", regex=False), errors="coerce")
    return s.dropna()

def anova_original_vs_optimized(baseline_path="baseline.csv", optimized_path="optimized.csv"):
    # --- Läs in data ---
    original = read_ttfb_ms(baseline_path)
    optimized = read_ttfb_ms(optimized_path)

    # --- ANOVA-test ---
    F, p = stats.f_oneway(original, optimized)

    # --- Utskrift ---
    print("----- ANOVA test: Original vs Optimized -----")
    print(f"n (Original):  {len(original)}")
    print(f"n (Optimized): {len(optimized)}\n")

    print(f"Mean Original:  {np.mean(original):.3f} ms")
    print(f"Mean Optimized: {np.mean(optimized):.3f} ms")
    print(f"Std Original:   {np.std(original, ddof=1):.3f} ms")
    print(f"Std Optimized:  {np.std(optimized, ddof=1):.3f} ms\n")

    print(f"F-statistic: {F:.6f}")
    print(f"p-value:      {p:.6g}")

    # --- Slutsats ---
    alpha = 0.05
    if p < alpha:
        print("\nSlutsats: Skillnad i medelvärden (statistiskt signifikant, p < 0.05).")
    else:
        print("\nSlutsats: Ingen signifikant skillnad mellan grupperna (p ≥ 0.05).")

# Kör testet
anova_original_vs_optimized("baseline.csv", "optimized.csv")