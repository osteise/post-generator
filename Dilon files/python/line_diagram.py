import glob
import pandas as pd
import matplotlib.pyplot as plt

width_inches = 12
height_inches = 6
plt.figure(figsize=(width_inches, height_inches))

files = glob.glob("*.csv")

for file in files:
    data_frame = pd.read_csv(file, sep=",", header=0, names=['Word','Seed','TimeMs', 'StartTimeMs', 'EndTimeMs'])
    print(data_frame)
    # Create x range
    data_frame_length = len(data_frame)
    x_range = range(0, data_frame_length) # from 0 to data_frame_length

    if "without-cache" in file:
        label = "without cache"
        color = "red"
    else:
        label = "with cache"
        color = "blue"

    # Get timeMs data
    y_time_ms = data_frame["TimeMs"]

    # Plot line
    plt.plot(x_range, y_time_ms, marker='none', linewidth='1', linestyle='-', color=color, label=label)

# It automatically adjusts x depending on how long data is
plt.locator_params(axis='x', nbins=10)

plt.legend()
plt.grid(True)

# Add title and labels
plt.title('WordPress Search-time Comparison: With Cache vs Without Cache')
plt.xlabel('Search Query (Word Index)')
plt.ylabel('Search-time (milliseconds)')

plt.savefig('Line_diagram.png')
plt.tight_layout()
plt.show()