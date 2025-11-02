import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.stats.multicomp import pairwise_tukeyhsd

def read_ttfb_ms(path: str) -> pd.Series:
    # Läser kolumnen 'TTFBms' och konverterar '1,23' -> 1.23
    s = pd.read_csv(path, sep=None, engine="python", usecols=["TTFBms"]).squeeze("columns")
    s = pd.to_numeric(s.astype(str).str.replace(',', '.', regex=False), errors='coerce')
    return s.dropna()

def tukey_original_vs_optimized(baseline_path="baseline.csv", optimized_path="optimized.csv", alpha=0.05):
    # Läs data
    original = read_ttfb_ms(baseline_path)
    optimized = read_ttfb_ms(optimized_path)

    # Långt (tidy) format för Tukey
    df_long = pd.concat([
        pd.DataFrame({"result": original.values, "treatment": "Original"}),
        pd.DataFrame({"result": optimized.values, "treatment": "Optimized"})
    ], ignore_index=True)

    # Tukey HSD (fungerar även med exakt två grupper)
    res = pairwise_tukeyhsd(endog=df_long["result"], groups=df_long["treatment"], alpha=alpha)
    print(res.summary())

    # Plotta simultana KI
    fig = res.plot_simultaneous()
    # Valfritt: röd linje för grand mean
    grand_mean = df_long["result"].mean()
    plt.vlines(x=grand_mean, ymin=-0.5, ymax=1.5, color="red", linestyles="--")
    plt.title("Tukey HSD: Original vs Optimized (TTFB ms)")
    plt.xlabel("TTFB (ms)")
    plt.tight_layout()
    plt.show()

# Kör testet
tukey_original_vs_optimized("baseline.csv", "optimized.csv", alpha=0.05)