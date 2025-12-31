# =========================================
# MENOPAUSE ML TRAINING SCRIPT
# =========================================

import pandas as pd
import pickle
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# -----------------------------------------
# 1. CREATE MODELS FOLDER
# -----------------------------------------
# This folder will store trained ML files
os.makedirs("models", exist_ok=True)

# -----------------------------------------
# 2. LOAD DATASET
# -----------------------------------------
df = pd.read_csv("menopause_dataset.csv")

# -----------------------------------------
# 3. ENCODE YES / NO VALUES → 1 / 0
# -----------------------------------------
yes_no_cols = [
    "Irregular_Periods",
    "Missed_Periods",
    "Hot_Flashes",
    "Night_Sweats",
    "Sleep_Problems",
    "Vaginal_Dryness",
    "Joint_Pain"
]

for col in yes_no_cols:
    df[col] = df[col].map({"Yes": 1, "No": 0})

# -----------------------------------------
# 4. MEDICAL RULE-BASED STAGE ASSIGNMENT
# -----------------------------------------
def assign_stage(row):
    if row["Years_Since_Last_Period"] >= 1:
        return "Postmenopause"
    elif row["Age"] >= 40 and (
        row["Irregular_Periods"] == 1 or
        row["Missed_Periods"] == 1 or
        row["Hot_Flashes"] == 1
    ):
        return "Perimenopause"
    else:
        return "Premenopause"

df["Menopause_Stage"] = df.apply(assign_stage, axis=1)

# -----------------------------------------
# 5. SELECT IMPORTANT FEATURES
# -----------------------------------------
features = [
    "Age",
    "Estrogen_Level",
    "FSH_Level",
    "Years_Since_Last_Period",
    "Irregular_Periods",
    "Missed_Periods",
    "Hot_Flashes",
    "Night_Sweats",
    "Sleep_Problems",
    "Vaginal_Dryness",
    "Joint_Pain"
]

X = df[features]
y = df["Menopause_Stage"]

# -----------------------------------------
# 6. ENCODE TARGET LABEL
# -----------------------------------------
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# -----------------------------------------
# 7. SCALE INPUT FEATURES
# -----------------------------------------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# -----------------------------------------
# 8. TRAIN-TEST SPLIT
# -----------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# -----------------------------------------
# 9. TRAIN RANDOM FOREST MODEL
# -----------------------------------------
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)
model.fit(X_train, y_train)

# -----------------------------------------
# 10. EVALUATE MODEL
# -----------------------------------------
accuracy = accuracy_score(y_test, model.predict(X_test))
print("✅ Model Accuracy:", round(accuracy * 100, 2), "%")

# -----------------------------------------
# 11. SAVE TRAINED FILES
# -----------------------------------------
pickle.dump(model, open("models/rf_model.pkl", "wb"))
pickle.dump(scaler, open("models/scaler.pkl", "wb"))
pickle.dump(label_encoder, open("models/label_encoder.pkl", "wb"))

print("📦 Files saved in models/")
print(" - rf_model.pkl")
print(" - scaler.pkl")
print(" - label_encoder.pkl")
print("🎉 Model trained successfully with 11 features")
