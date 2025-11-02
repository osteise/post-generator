import pandas as pd
import matplotlib.pyplot as plt

def BarChart():
    def read_ttfb_ms(path: str) -> pd.Series:
        # Läs endast kolumnen 'TTFBms'
        s = pd.read_csv(path, sep=None, engine="python", usecols=["TTFBms"]).squeeze("columns")
        # Byt kommatecken till punkt och konvertera till numeriskt
        s = pd.to_numeric(s.astype(str).str.replace(',', '.', regex=False), errors='coerce')
        return s.dropna()

    # --- Läs in data ---
    original = read_ttfb_ms("baseline.csv")
    optimized = read_ttfb_ms("optimized.csv")

    # --- Slå ihop till en DataFrame ---
    df = pd.DataFrame({
        "Original": original,
        "Optimized": optimized
    })

    # --- Beräkna medel och standard error ---
    barsData = df.mean()
    barsInterval = df.sem()  # Standard Error of the Mean

    # --- Inställningar ---
    barWidth = 0.6
    colors = ["orange", "blue"]
    Opacity = 0.8
    intervalCapsize = 7

    print("Antal (n):")
    print(df.count())
    print("\nMedel (ms):")
    print(df.mean().round(3))
    print("\nStd (ms):")
    print(df.std(ddof=1).round(3))
    print("\nSEM (ms):")
    print(df.sem(ddof=1).round(3))

    # 95% CI (approx)
    ci95 = 1.96 * df.sem(ddof=1)
    print("\n95% CI (ms):")
    print(ci95.round(3))

    # --- Rita staplar ---
    plt.bar(
        range(len(barsData)),
        barsData,
        color=colors,
        edgecolor='black',
        width=barWidth,
        yerr=barsInterval,
        #yerr=df.std(ddof=1),
        capsize=intervalCapsize,
        alpha=Opacity
    )

    # --- Etiketter ---
    plt.xticks(range(len(df.columns)), df.columns)
    plt.ylabel('TTFB (ms)')
    plt.title('Comparison of Original vs Optimized TTFB with Standard Error')

    plt.grid(axis='y', linestyle='--', alpha=0.6)
    plt.tight_layout()
    plt.show()



# Kör funktionen
BarChart()