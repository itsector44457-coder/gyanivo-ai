import os
import random

import joblib

from sklearn.ensemble import (
    RandomForestClassifier,
)

from sklearn.metrics import (
    accuracy_score,
)

from sklearn.model_selection import (
    train_test_split,
)

from app.question_generator.features import (
    extract_question_features,
)

from app.question_generator.generator import (
    generate_question,
)


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "difficulty_model.joblib",
)


def build_dataset(
    samples_per_level: int = 1000,
):

    X = []
    y = []

    for difficulty in [
        1,
        2,
        3,
    ]:

        for _ in range(
            samples_per_level
        ):

            generated = (
                generate_question(
                    difficulty
                )
            )

            equation = (
                generated[
                    "equation"
                ]
            )

            features = (
                extract_question_features(
                    equation
                )
            )

            X.append(
                features
            )

            y.append(
                difficulty
            )

    combined = list(
        zip(X, y)
    )

    random.shuffle(
        combined
    )

    X, y = zip(
        *combined
    )

    return (
        list(X),
        list(y),
    )


def train():

    print(
        "🤖 Building automatic training dataset..."
    )

    X, y = build_dataset(
        samples_per_level=1000
    )

    print(
        f"📊 Dataset size: {len(X)}"
    )

    (
        X_train,
        X_test,
        y_train,
        y_test,
    ) = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = (
        RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            random_state=42,
        )
    )

    print(
        "🧠 Training difficulty model..."
    )

    model.fit(
        X_train,
        y_train,
    )

    predictions = (
        model.predict(
            X_test
        )
    )

    accuracy = (
        accuracy_score(
            y_test,
            predictions,
        )
    )

    print(
        f"✅ Accuracy: "
        f"{accuracy * 100:.2f}%"
    )

    joblib.dump(
        model,
        MODEL_PATH,
    )

    print(
        f"💾 Model saved at:"
    )

    print(
        MODEL_PATH
    )


if __name__ == "__main__":
    train()