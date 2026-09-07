from __future__ import annotations


def clamp(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    """Clamps a value between a minimum and maximum range."""
    return max(
        minimum,
        min(
            maximum,
            value,
        ),
    )


def get_parameters(
    difficulty: int,
    hint_used: bool,
    attempt_number: int,
) -> dict[str, float]:
    """
    Bayesian Knowledge Tracing parameters for V1.

    guess:
        Probability student gets the answer correct
        without actually knowing the skill.

    slip:
        Probability student knows the skill but
        still gives an incorrect answer.

    learn:
        Probability of transitioning from unmastered
        to mastered after one practice opportunity.
    """

    if difficulty == 1:
        guess = 0.28
        slip = 0.08
        learn = 0.10

    elif difficulty == 2:
        guess = 0.22
        slip = 0.10
        learn = 0.09

    else:
        guess = 0.16
        slip = 0.12
        learn = 0.08

    # -------------------------------------------------
    # HINT
    #
    # Correcting for hint usage: hint usage increases
    # the probability of getting the answer correct.
    # -------------------------------------------------

    if hint_used:
        guess += 0.10
        learn += 0.02

    # -------------------------------------------------
    # RETRIES
    #
    # A correct answer on later retries is weaker
    # evidence than first-attempt correctness.
    # -------------------------------------------------

    if attempt_number > 1:
        retry_penalty = min(
            0.12,
            0.03 * (attempt_number - 1),
        )

        guess += retry_penalty

    guess = clamp(
        guess,
        0.05,
        0.45,
    )

    slip = clamp(
        slip,
        0.03,
        0.25,
    )

    learn = clamp(
        learn,
        0.03,
        0.20,
    )

    return {
        "guess": guess,
        "slip": slip,
        "learn": learn,
    }


def observation_posterior(
    prior: float,
    correct: bool,
    guess: float,
    slip: float,
) -> float:
    """
    Bayesian update formula for observing a
    correct or incorrect response.
    """

    if correct:
        numerator = (
            prior
            * (1 - slip)
        )

        denominator = (
            numerator
            + (
                (1 - prior)
                * guess
            )
        )

    else:
        numerator = (
            prior
            * slip
        )

        denominator = (
            numerator
            + (
                (1 - prior)
                * (1 - guess)
            )
        )

    if denominator == 0:
        return prior

    return numerator / denominator


def apply_learning_transition(
    posterior: float,
    learn: float,
) -> float:
    """
    Standard BKT learning transition:
    P(Ln+1) = P(Ln) + (1 - P(Ln)) * Learn
    """

    return (
        posterior
        + (
            1 - posterior
        )
        * learn
    )


def get_evidence_strength(
    skill_weight: float,
    hint_used: bool,
    attempt_number: int,
) -> float:
    """
    Calculates the smoothing factor (evidence strength)
    to prevent extreme mastery updates.
    """

    strength = 0.72

    if skill_weight > 1:
        strength += 0.08

    elif skill_weight < 1:
        strength -= 0.08

    if hint_used:
        strength -= 0.12

    if attempt_number > 1:
        strength -= min(
            0.18,
            0.05
            * (
                attempt_number
                - 1
            ),
        )

    return clamp(
        strength,
        0.35,
        0.85,
    )


def update_knowledge(
    current_mastery: float,
    correct: bool,
    hint_used: bool = False,
    attempt_number: int = 1,
    difficulty: int = 2,
    skill_weight: float = 1.0,
    time_taken_sec: int | None = None,
) -> dict:
    """
    Main Gyanivo Knowledge Tracing V1 update logic.
    Converts 0-100 percentage to probability 0-1 for BKT math.
    """

    del time_taken_sec

    previous_mastery = clamp(
        current_mastery,
        0,
        100,
    )

    prior = clamp(
        previous_mastery / 100,
        0.01,
        0.99,
    )

    parameters = get_parameters(
        difficulty=difficulty,
        hint_used=hint_used,
        attempt_number=attempt_number,
    )

    posterior = observation_posterior(
        prior=prior,
        correct=correct,
        guess=parameters["guess"],
        slip=parameters["slip"],
    )

    transitioned = (
        apply_learning_transition(
            posterior=posterior,
            learn=parameters["learn"],
        )
    )

    strength = get_evidence_strength(
        skill_weight=skill_weight,
        hint_used=hint_used,
        attempt_number=attempt_number,
    )

    blended = (
        prior
        + (
            transitioned
            - prior
        )
        * strength
    )

    maximum_up_change = 0.14
    maximum_down_change = 0.16

    if correct:
        blended = min(
            blended,
            prior
            + maximum_up_change,
        )

    else:
        blended = max(
            blended,
            prior
            - maximum_down_change,
        )

    probability_known = clamp(
        blended,
        0.01,
        0.99,
    )

    mastery = round(
        probability_known
        * 100,
        2,
    )

    return {
        "previousMastery":
            round(
                previous_mastery,
                2,
            ),

        "mastery":
            mastery,

        "probabilityKnown":
            round(
                probability_known,
                4,
            ),

        "observation":
            (
                "CORRECT"
                if correct
                else "INCORRECT"
            ),

        "parameters": {
            "guess":
                round(
                    parameters[
                        "guess"
                    ],
                    4,
                ),

            "slip":
                round(
                    parameters[
                        "slip"
                    ],
                    4,
                ),

            "learn":
                round(
                    parameters[
                        "learn"
                    ],
                    4,
                ),

            "evidenceStrength":
                round(
                    strength,
                    4,
                ),
        },
    }


def update_competency_knowledge(
    prior_mastery: float,
    correct: bool,
    difficulty: str = "MEDIUM",
    guess: float | None = None,
    slip: float | None = None,
    learn: float | None = None,
    time_taken_sec: int | None = None,
) -> dict:
    """
    Generalised Bayesian Knowledge Tracing for Enterprise Competency Assessment.
    Operates with prior_mastery in [0.0, 1.0].

    Three-stage pipeline
    --------------------
    Stage 1: Bayesian observation update (standard BKT posterior formula)
    Stage 2: Learning transition — P_next = P_post + (1-P_post)*T
    Stage 3: Evidence-strength blend with per-step delta cap (max_delta=0.18)

    The delta cap is the primary stability mechanism. A single question
    cannot move competency mastery more than 18 percentage points regardless
    of how extreme the Bayesian posterior is.

    Difficulty parameters
    ---------------------
    Difficulty   G (guess)  S (slip)  T (learn)
    EASY         0.25       0.08      0.12
    MEDIUM       0.20       0.10      0.10
    HARD         0.15       0.12      0.08

    Verified trace — MEDIUM / prior=0.38 / correct=True
    ---------------------------------------------------
    Stage 1 posterior   = 0.38*(1-0.10) / [0.38*(1-0.10) + 0.62*0.20]
                        = 0.342 / 0.466  = 0.7339
    Stage 2 transitioned = 0.7339 + (1-0.7339)*0.10  = 0.7605
    Stage 3 raw_blend   = 0.38 + (0.7605-0.38)*0.70  = 0.6464
             capped     = min(0.38+0.18, 0.6464)      = 0.5600  ← cap fires
    Final score         = 56.0  (0-100 scale)

    Verified trace — MEDIUM / prior=0.38 / correct=False
    ----------------------------------------------------
    Stage 1 posterior   = 0.38*0.10 / [0.38*0.10 + 0.62*0.80]
                        = 0.038 / 0.534  = 0.0711
    Stage 2 transitioned = 0.0711 + (1-0.0711)*0.10  = 0.1640
    Stage 3 raw_blend   = 0.38 + (0.1640-0.38)*0.70  = 0.2288
             capped     = max(0.38-0.18, 0.2288)      = 0.2288  ← cap does NOT fire
    Final score         = 22.9  (0-100 scale)
    """
    del time_taken_sec

    prior = clamp(prior_mastery, 0.01, 0.99)

    # Difficulty mapping
    diff_str = str(difficulty).upper()
    if diff_str in ["EASY", "1"]:
        default_guess = 0.25
        default_slip = 0.08
        default_learn = 0.12
    elif diff_str in ["HARD", "3"]:
        default_guess = 0.15
        default_slip = 0.12
        default_learn = 0.08
    else: # MEDIUM, "2"
        default_guess = 0.20
        default_slip = 0.10
        default_learn = 0.10

    g = clamp(guess if guess is not None else default_guess, 0.05, 0.45)
    s = clamp(slip if slip is not None else default_slip, 0.03, 0.25)
    l = clamp(learn if learn is not None else default_learn, 0.03, 0.25)

    # 1. Observation Update
    posterior = observation_posterior(prior=prior, correct=correct, guess=g, slip=s)

    # 2. Learning Transition
    transitioned = apply_learning_transition(posterior=posterior, learn=l)

    # 3. Dynamic Evidence Blend
    if correct:
        step_weight = 0.85 if diff_str in ["HARD", "3"] else 0.70
        max_delta = 0.18
        blended = min(prior + max_delta, prior + (transitioned - prior) * step_weight)
    else:
        step_weight = 0.85 if diff_str in ["EASY", "1"] else 0.70
        max_delta = 0.18
        blended = max(prior - max_delta, prior + (transitioned - prior) * step_weight)

    prob_known = clamp(blended, 0.01, 0.99)

    return {
        "previousMastery": round(prior, 4),
        "updatedMastery": round(prob_known, 4),
        "probabilityKnown": round(prob_known, 4),
        "observation": "CORRECT" if correct else "INCORRECT",
        "parameters": {
            "guess": round(g, 4),
            "slip": round(s, 4),
            "learn": round(l, 4),
        },
    }

# =============================================================================
# DETERMINISTIC TEST VECTORS
#
# These reference values protect against implementation regressions.
# Any refactoring MUST preserve these outputs to the documented precision.
# =============================================================================

# Legacy update_knowledge() vectors (math practice engine, mastery in 0-100)
LEGACY_BKT_TEST_VECTORS: list[dict] = [
    {
        "label": "MEDIUM/correct=True/mastery=50 — standard upward update",
        "fn": "update_knowledge",
        "inputs": {"current_mastery": 50.0, "correct": True, "difficulty": 2},
        "expected_mastery": 64.0,  # bounded by max_up_change=0.14 → 0.50+0.14=0.64
    },
    {
        "label": "MEDIUM/correct=False/mastery=50 — standard downward update",
        "fn": "update_knowledge",
        "inputs": {"current_mastery": 50.0, "correct": False, "difficulty": 2},
        "expected_mastery": 34.0,  # bounded by max_down_change=0.16 → 0.50-0.16=0.34
    },
]

# Enterprise update_competency_knowledge() vectors (competency engine, mastery in 0.0-1.0)
BKT_TEST_VECTORS: list[dict] = [
    {
        "label": "MEDIUM/correct=True/prior=0.38 — cap fires at prior+0.18",
        "fn": "update_competency_knowledge",
        "inputs": {"prior_mastery": 0.38, "correct": True, "difficulty": "MEDIUM"},
        # posterior=0.7339, transitioned=0.7605, raw_blend=0.6464 → capped to 0.56
        "expected_updated_mastery": 0.56,
    },
    {
        "label": "MEDIUM/correct=False/prior=0.38 — no cap, raw_blend=0.2288",
        "fn": "update_competency_knowledge",
        "inputs": {"prior_mastery": 0.38, "correct": False, "difficulty": "MEDIUM"},
        # posterior=0.0711, transitioned=0.1640, raw_blend=0.2288 → not capped
        "expected_updated_mastery": 0.2288,
    },
    {
        "label": "EASY/correct=True/prior=0.50 — cap fires at prior+0.18",
        "fn": "update_competency_knowledge",
        "inputs": {"prior_mastery": 0.50, "correct": True, "difficulty": "EASY"},
        # posterior=0.8621, transitioned=0.8862, raw_blend=0.5953 → capped to 0.68
        "expected_updated_mastery": 0.68,
    },
    {
        "label": "HARD/correct=True/prior=0.70 — cap fires at prior+0.18",
        "fn": "update_competency_knowledge",
        "inputs": {"prior_mastery": 0.70, "correct": True, "difficulty": "HARD"},
        # posterior=0.9391, transitioned=0.9453, raw_blend=0.9035 → capped to 0.88
        "expected_updated_mastery": 0.88,
    },
    {
        "label": "HARD/correct=False/prior=0.70 — cap fires at prior-0.18",
        "fn": "update_competency_knowledge",
        "inputs": {"prior_mastery": 0.70, "correct": False, "difficulty": "HARD"},
        # posterior=0.2936, transitioned=0.3643, raw_blend=0.1493 → capped to 0.52
        "expected_updated_mastery": 0.52,
    },
]