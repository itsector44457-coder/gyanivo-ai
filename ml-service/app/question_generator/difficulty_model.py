import os

import joblib

from app.question_generator.features import (
    extract_question_features,
)


MODEL_PATH = os.path.join(
    os.path.dirname(
        os.path.abspath(__file__)
    ),
    "difficulty_model.joblib",
)


_model = None


def model_exists() -> bool:
    """
    Checks whether the trained difficulty
    model exists on disk.
    """

    return os.path.exists(
        MODEL_PATH
    )


def load_model():
    """
    Lazily loads the trained model.

    We do NOT load it when FastAPI starts,
    because this allows the service itself
    to start even before training.
    """

    global _model

    if _model is not None:
        return _model

    if not model_exists():
        raise RuntimeError(
            (
                "Difficulty model has not "
                "been trained yet. Run:\n\n"
                "python -m "
                "app.question_generator."
                "train_difficulty"
            )
        )

    _model = joblib.load(
        MODEL_PATH
    )

    return _model


def predict_difficulty(
    equation: str,
) -> int:
    """
    Predict Easy / Medium / Hard.

    Returns:

    1 = Easy
    2 = Medium
    3 = Hard
    """

    model = load_model()

    features = (
        extract_question_features(
            equation
        )
    )

    prediction = (
        model.predict(
            [features]
        )[0]
    )

    return int(
        prediction
    )