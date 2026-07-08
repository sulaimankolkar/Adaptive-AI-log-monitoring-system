import os
import pandas as pd
import numpy as np

def generate_mock_datasets():
    os.makedirs("mock_data", exist_ok=True)
    np.random.seed(42)
    
    num_samples = 1000
    
    # 1. Generate Reference (Baseline)
    ref_data = {}
    ref_data['Time'] = np.linspace(0, 10000, num_samples)
    for i in range(1, 29):
        ref_data[f'V{i}'] = np.random.normal(loc=0.0, scale=1.0, size=num_samples)
    
    ref_data['Amount'] = np.random.exponential(scale=50.0, size=num_samples)
    # Binary class (fraud rate 0.2%)
    ref_data['Class'] = np.random.choice([0, 1], size=num_samples, p=[0.998, 0.002])
    
    df_ref = pd.DataFrame(ref_data)
    df_ref.to_csv("mock_data/credit_card_reference.csv", index=False)
    print("Created mock_data/credit_card_reference.csv")
    
    # 2. Generate Target (Current - showing Drift!)
    tar_data = {}
    tar_data['Time'] = np.linspace(10000, 20000, num_samples)
    for i in range(1, 29):
        if i == 14:
            # Shifted mean + higher variance (major drift)
            tar_data[f'V{i}'] = np.random.normal(loc=1.5, scale=2.5, size=num_samples)
        elif i == 12:
            # Shifted mean (moderate drift)
            tar_data[f'V{i}'] = np.random.normal(loc=-1.2, scale=1.0, size=num_samples)
        else:
            tar_data[f'V{i}'] = np.random.normal(loc=0.0, scale=1.0, size=num_samples)
            
    # Shifted mean for Amount (moderate/major drift)
    tar_data['Amount'] = np.random.exponential(scale=100.0, size=num_samples)
    # Fraud rate increases in target (drift in target variable Class)
    tar_data['Class'] = np.random.choice([0, 1], size=num_samples, p=[0.990, 0.010])
    
    df_tar = pd.DataFrame(tar_data)
    df_tar.to_csv("mock_data/credit_card_target.csv", index=False)
    print("Created mock_data/credit_card_target.csv")

if __name__ == '__main__':
    generate_mock_datasets()
