import glob

import pandas as pd
import matplotlib.pyplot as plt

width_inches = 10
height_inches = 6
plt.figure(figsize=(width_inches, height_inches))

def bar_chart():
    #Read your data from file
    files = glob.glob("*.csv")

    for file in files:
        df = pd.read_csv(file, sep=",", header=0, names=['Word', 'Seed', 'TimeMs', 'StartTimeMs', 'EndTimeMs'])

        df_TimeMs = df["TimeMs"]

        if "without-cache" in file:
            # Colors of bar charts
            color = "red"

            # The x-position order of bars
            barsOrder = "without-cache"
        else:
            # Colors of bar charts
            color = "blue"

            # The x-position order of bars
            barsOrder = "with-cache"

        # Bars Data
        barsData = df_TimeMs.mean()

        # Standard Error Bars intervals
        barsInterval = df_TimeMs.sem()

        # width of the bars
        barWidth = 0.6

        # Opacity of colors
        Opacity=0.5

        # Plot bars
        plt.bar(barsOrder, barsData, color = color , edgecolor = "black", width = barWidth, yerr=barsInterval, capsize=7, alpha=Opacity)

    #Put a tick on the x-axis undex each bar and label it with column name
    #plt.xticks(barsOrder, df.columns)

    plt.grid(True)

    # Add title and labels
    plt.title('WordPress Search-time Comparison: With Cache vs Without Cache. Bar chart with standard error')
    plt.ylabel('Search-time (milliseconds)')
    #plt.xlabel('Search Query (Word Index)')
    plt.savefig('barChart.png')
    plt.show()

bar_chart()