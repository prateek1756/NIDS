import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import pickle
import os

# Create dummy NSL-KDD like data for demonstration training
def generate_synthetic_data(n_samples=2000):
    np.random.seed(42)
    
    data = {
        'protocol_type': np.random.choice(['tcp', 'udp', 'icmp'], n_samples),
        'service': np.random.choice(['http', 'smtp', 'ftp', 'ssh', 'other'], n_samples),
        'flag': np.random.choice(['SF', 'S0', 'REJ', 'RSTR'], n_samples),
        'src_bytes': np.random.randint(0, 50000, n_samples),
        'dst_bytes': np.random.randint(0, 50000, n_samples),
        'count': np.random.randint(1, 511, n_samples),
        'srv_count': np.random.randint(1, 511, n_samples),
        'serror_rate': np.random.random(n_samples),
        'label': np.zeros(n_samples) # 0 = Normal
    }
    
    df = pd.DataFrame(data)
    
    # Inject Attacks
    # 1. DoS (High count, high serror_rate)
    dos_idx = np.random.choice(n_samples, int(n_samples * 0.1), replace=False)
    df.loc[dos_idx, 'count'] = np.random.randint(400, 511, len(dos_idx))
    df.loc[dos_idx, 'serror_rate'] = np.random.uniform(0.8, 1.0, len(dos_idx))
    df.loc[dos_idx, 'label'] = 1 # DoS
    
    # 2. Probe (Specific ports, unusual services)
    probe_idx = np.random.choice(list(set(range(n_samples)) - set(dos_idx)), int(n_samples * 0.05), replace=False)
    df.loc[probe_idx, 'service'] = 'other'
    df.loc[probe_idx, 'dst_bytes'] = np.random.randint(0, 100, len(probe_idx))
    df.loc[probe_idx, 'label'] = 2 # Probe
    
    return df

def train():
    print("Generating synthetic NSL-KDD dataset...")
    df = generate_synthetic_data()
    
    # Preprocessing
    le_proto = LabelEncoder()
    le_service = LabelEncoder()
    le_flag = LabelEncoder()
    
    df['protocol_type'] = le_proto.fit_transform(df['protocol_type'])
    df['service'] = le_service.fit_transform(df['service'])
    df['flag'] = le_flag.fit_transform(df['flag'])
    
    X = df.drop('label', axis=1)
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Save artifacts
    os.makedirs('ml/models', exist_ok=True)
    
    print("Saving model to ml/models/nids_model.pkl")
    with open('ml/models/nids_model.pkl', 'wb') as f:
        pickle.dump(model, f)
        
    print("Saving scaler to ml/models/scaler.pkl")
    with open('ml/models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
        
    # Save label encoders for the engine
    with open('ml/models/encoders.pkl', 'wb') as f:
        pickle.dump({
            'protocol_type': le_proto,
            'service': le_service,
            'flag': le_flag
        }, f)
        
    print(f"Training complete. Accuracy: {model.score(scaler.transform(X_test), y_test):.4f}")

if __name__ == "__main__":
    train()
