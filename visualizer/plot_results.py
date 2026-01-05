"""
iFogSim Results Visualization Script
This script reads performance metrics from results.csv and creates bar graphs
for Execution Time, Delay, Energy, and Network Usage.
"""

import pandas as pd
import matplotlib.pyplot as plt
import os

# Get the project root directory (parent of visualizer folder)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Check multiple possible locations for results.csv
possible_locations = [
    os.path.join(project_root, 'results.csv'),  # Project root
    os.path.join(project_root, 'output', 'results.csv'),  # Output folder
    os.path.join(project_root, 'results', 'results.csv'),  # Results folder
]

csv_file = None
for location in possible_locations:
    if os.path.exists(location):
        csv_file = location
        break

# If CSV file not found, show helpful error message
if csv_file is None:
    print("="*60)
    print("ERROR: results.csv not found!")
    print("="*60)
    print("\nSearched in the following locations:")
    for loc in possible_locations:
        print(f"  - {loc}")
    print("\nPlease ensure results.csv exists in one of these locations.")
    print("The Java simulation should generate this file after running.")
    print("="*60)
    exit(1)

# Read the CSV file
print(f"Reading data from: {csv_file}")
try:
    # Try reading with headers first
    data = pd.read_csv(csv_file)
    print(f"CSV file loaded successfully!")
    print(f"Columns found: {list(data.columns)}")
    print(f"\nFirst few rows:")
    print(data.head())
except Exception as e:
    print(f"Error reading CSV file: {e}")
    exit(1)

# Function to find column by partial name match (case-insensitive)
def find_column(df, keywords):
    """Find a column that contains any of the keywords (case-insensitive)"""
    for col in df.columns:
        col_lower = str(col).lower()
        for keyword in keywords:
            if keyword.lower() in col_lower:
                return col
    return None

# Function to create a bar graph
def create_bar_graph(data, metric_name, keywords, ylabel, title, color='steelblue'):
    """
    Create a bar graph for a specific metric
    
    Parameters:
    - data: DataFrame containing the data
    - metric_name: Name of the metric for display
    - keywords: List of keywords to search for in column names
    - ylabel: Y-axis label
    - title: Graph title
    - color: Bar color
    """
    # Find the column containing this metric
    metric_col = find_column(data, keywords)
    
    if metric_col is None:
        print(f"Warning: Could not find column for {metric_name}")
        print(f"Available columns: {list(data.columns)}")
        return
    
    # Get the values
    values = data[metric_col].values
    
    # Create labels (use index or first column if it looks like labels)
    if len(data.columns) > 1:
        # Check if first column looks like labels (non-numeric or configuration names)
        first_col = data.columns[0]
        if first_col != metric_col:
            labels = data[first_col].values
        else:
            labels = [f"Config {i+1}" for i in range(len(values))]
    else:
        labels = [f"Config {i+1}" for i in range(len(values))]
    
    # Create the bar graph
    plt.figure(figsize=(10, 6))
    bars = plt.bar(range(len(values)), values, color=color, alpha=0.7, edgecolor='black')
    
    # Add value labels on top of bars
    for i, (bar, val) in enumerate(zip(bars, values)):
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{val:.2f}' if isinstance(val, (int, float)) else str(val),
                ha='center', va='bottom', fontsize=9)
    
    plt.title(title, fontsize=14, fontweight='bold')
    plt.xlabel('Configuration', fontsize=12)
    plt.ylabel(ylabel, fontsize=12)
    plt.xticks(range(len(labels)), labels, rotation=45, ha='right')
    plt.grid(True, alpha=0.3, axis='y')
    plt.tight_layout()
    
    # Save the figure
    output_file = os.path.join(project_root, f'{metric_name.replace(" ", "_").lower()}_graph.png')
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"Saved: {output_file}")
    
    plt.show()

# Alternative approach: If CSV has metrics as rows (like the Excel structure)
def create_graphs_from_row_structure(data):
    """Handle CSV where metrics are in rows rather than columns"""
    # Check if first column contains metric names
    first_col = data.columns[0]
    metric_rows = {}
    
    # Keywords for each metric
    metric_keywords = {
        'Execution Time': ['execution', 'time', 'exec'],
        'Delay': ['delay'],
        'Energy': ['energy', 'power'],
        'Network Usage': ['network', 'usage', 'bandwidth']
    }
    
    # Find rows that match our metrics
    for idx, row in data.iterrows():
        metric_name = str(row[first_col])
        metric_lower = metric_name.lower()
        
        for metric, keywords in metric_keywords.items():
            if any(keyword in metric_lower for keyword in keywords):
                # Get all numeric values from this row
                values = []
                for col in data.columns[1:]:
                    try:
                        val = float(row[col])
                        values.append(val)
                    except:
                        pass
                
                if values:
                    metric_rows[metric] = values
    
    # Create graphs for found metrics
    if metric_rows:
        for metric, values in metric_rows.items():
            labels = [f"Config {i+1}" for i in range(len(values))]
            
            plt.figure(figsize=(10, 6))
            color_map = {
                'Execution Time': 'steelblue',
                'Delay': 'green',
                'Energy': 'purple',
                'Network Usage': 'orange'
            }
            color = color_map.get(metric, 'steelblue')
            
            bars = plt.bar(range(len(values)), values, color=color, alpha=0.7, edgecolor='black')
            
            # Add value labels
            for bar, val in zip(bars, values):
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2., height,
                        f'{val:.2f}',
                        ha='center', va='bottom', fontsize=9)
            
            ylabel_map = {
                'Execution Time': 'Execution Time (ms)',
                'Delay': 'Delay (ms)',
                'Energy': 'Energy Consumption (J)',
                'Network Usage': 'Network Usage (Bytes)'
            }
            
            plt.title(f'{metric} Comparison', fontsize=14, fontweight='bold')
            plt.xlabel('Configuration', fontsize=12)
            plt.ylabel(ylabel_map.get(metric, metric), fontsize=12)
            plt.xticks(range(len(labels)), labels, rotation=45, ha='right')
            plt.grid(True, alpha=0.3, axis='y')
            plt.tight_layout()
            
            output_file = os.path.join(project_root, f'{metric.replace(" ", "_").lower()}_graph.png')
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            print(f"Saved: {output_file}")
            
            plt.show()
        
        return True
    
    return False

# Main execution
print("\n" + "="*50)
print("Creating Visualization Graphs")
print("="*50 + "\n")

# Try column-based structure first (metrics as columns)
execution_col = find_column(data, ['execution', 'time', 'exec'])
delay_col = find_column(data, ['delay'])
energy_col = find_column(data, ['energy', 'power'])
network_col = find_column(data, ['network', 'usage', 'bandwidth'])

if execution_col or delay_col or energy_col or network_col:
    # Column-based structure
    print("Detected column-based CSV structure\n")
    
    if execution_col:
        create_bar_graph(data, 'Execution Time', ['execution', 'time'], 
                        'Execution Time (ms)', 'Execution Time Comparison', 'steelblue')
    
    if delay_col:
        create_bar_graph(data, 'Delay', ['delay'], 
                        'Delay (ms)', 'Delay Comparison', 'green')
    
    if energy_col:
        create_bar_graph(data, 'Energy', ['energy', 'power'], 
                        'Energy Consumption (J)', 'Energy Consumption Comparison', 'purple')
    
    if network_col:
        create_bar_graph(data, 'Network Usage', ['network', 'usage'], 
                        'Network Usage (Bytes)', 'Network Usage Comparison', 'orange')
else:
    # Try row-based structure (metrics as rows)
    print("Trying row-based CSV structure\n")
    if not create_graphs_from_row_structure(data):
        print("\nCould not automatically detect metric columns.")
        print("Please check your CSV structure.")
        print("\nExpected format:")
        print("Option 1 - Column-based:")
        print("  Configuration, Execution Time, Delay, Energy, Network Usage")
        print("  Config1, 100, 50, 200, 1000")
        print("\nOption 2 - Row-based:")
        print("  Metric, Config1, Config2, Config3")
        print("  Execution Time, 100, 120, 110")
        print("  Delay, 50, 55, 52")

print("\n" + "="*50)
print("Visualization Complete!")
print("="*50)
