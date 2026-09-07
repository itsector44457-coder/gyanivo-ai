import random

from app.question_generator.verifier import (
    verify_generated_question,
)


# =========================================================
# HELPERS
# =========================================================


def random_x():
    return random.randint(
        2,
        12,
    )


def random_coefficient():
    return random.randint(
        2,
        9,
    )


# =========================================================
# EASY GENERATORS
# =========================================================


def generate_easy_division():
    """
    Example:

    4x = 28

    x = 28 / 4
    x = 7
    """

    x_value = random_x()

    coefficient = random_coefficient()

    result = (
        coefficient
        * x_value
    )

    equation = (
        f"{coefficient}x = {result}"
    )

    steps = [
        f"x = {result} / {coefficient}",
        f"x = {x_value}",
    ]

    return {
        "question":
            f"Solve: {equation}",

        "equation":
            equation,

        "answer":
            f"x = {x_value}",

        "steps":
            steps,

        "difficulty":
            1,

        "skillCodes": [
            "division",
            "variable_isolation",
        ],
    }


def generate_easy_inverse(
    force_subtraction=False,
):
    """
    Examples:

    x + 5 = 12

    or

    x - 5 = 7
    """

    x_value = random_x()

    constant = random.randint(
        2,
        12,
    )

    use_subtraction = (
        force_subtraction
        or random.choice(
            [True, False]
        )
    )

    if use_subtraction:

        result = (
            x_value
            - constant
        )

        equation = (
            f"x - {constant} = {result}"
        )

        steps = [
            (
                f"x = {result} + "
                f"{constant}"
            ),

            f"x = {x_value}",
        ]

        skills = [
            "inverse_operations",
            "sign_handling",
        ]

    else:

        result = (
            x_value
            + constant
        )

        equation = (
            f"x + {constant} = {result}"
        )

        steps = [
            (
                f"x = {result} - "
                f"{constant}"
            ),

            f"x = {x_value}",
        ]

        skills = [
            "inverse_operations",
        ]

    return {
        "question":
            f"Solve: {equation}",

        "equation":
            equation,

        "answer":
            f"x = {x_value}",

        "steps":
            steps,

        "difficulty":
            1,

        "skillCodes":
            skills,
    }


def generate_easy(
    target_skill=None,
):
    if target_skill == "sign_handling":
        return generate_easy_inverse(
            force_subtraction=True
        )

    if target_skill == "inverse_operations":
        return generate_easy_inverse()

    return generate_easy_division()


# =========================================================
# MEDIUM GENERATORS
# =========================================================


def generate_medium_addition():
    """
    Example:

    6x + 5 = 41
    """

    x_value = random_x()

    coefficient = random_coefficient()

    constant = random.randint(
        2,
        15,
    )

    coefficient_x = (
        coefficient
        * x_value
    )

    result = (
        coefficient_x
        + constant
    )

    equation = (
        f"{coefficient}x + "
        f"{constant} = "
        f"{result}"
    )

    steps = [
        (
            f"{coefficient}x = "
            f"{result} - "
            f"{constant}"
        ),

        (
            f"{coefficient}x = "
            f"{coefficient_x}"
        ),

        (
            f"x = "
            f"{coefficient_x} / "
            f"{coefficient}"
        ),

        f"x = {x_value}",
    ]

    return {
        "question":
            f"Solve: {equation}",

        "equation":
            equation,

        "answer":
            f"x = {x_value}",

        "steps":
            steps,

        "difficulty":
            2,

        "skillCodes": [
            "inverse_operations",
            "division",
            "variable_isolation",
        ],
    }


def generate_medium_subtraction():
    """
    Specifically useful for:

    sign_handling

    Example:

    6x - 8 = 34
    """

    x_value = random_x()

    coefficient = random_coefficient()

    coefficient_x = (
        coefficient
        * x_value
    )

    max_constant = max(
        2,
        min(
            15,
            coefficient_x - 1,
        ),
    )

    constant = random.randint(
        2,
        max_constant,
    )

    result = (
        coefficient_x
        - constant
    )

    equation = (
        f"{coefficient}x - "
        f"{constant} = "
        f"{result}"
    )

    steps = [
        (
            f"{coefficient}x = "
            f"{result} + "
            f"{constant}"
        ),

        (
            f"{coefficient}x = "
            f"{coefficient_x}"
        ),

        (
            f"x = "
            f"{coefficient_x} / "
            f"{coefficient}"
        ),

        f"x = {x_value}",
    ]

    return {
        "question":
            f"Solve: {equation}",

        "equation":
            equation,

        "answer":
            f"x = {x_value}",

        "steps":
            steps,

        "difficulty":
            2,

        "skillCodes": [
            "sign_handling",
            "inverse_operations",
            "division",
            "variable_isolation",
        ],
    }


def generate_medium(
    target_skill=None,
):
    # -----------------------------------------
    # Explicit weak-skill targeting
    # -----------------------------------------

    if target_skill == "sign_handling":

        return (
            generate_medium_subtraction()
        )

    if target_skill in [
        "division",
        "variable_isolation",
    ]:

        return (
            random.choice(
                [
                    generate_medium_addition,
                    generate_medium_subtraction,
                ]
            )()
        )

    if target_skill == "inverse_operations":

        return (
            random.choice(
                [
                    generate_medium_addition,
                    generate_medium_subtraction,
                ]
            )()
        )

    return (
        random.choice(
            [
                generate_medium_addition,
                generate_medium_subtraction,
            ]
        )()
    )


# =========================================================
# HARD GENERATORS
# =========================================================


def generate_hard_variables_both_sides(
    use_negative_constant=False,
):
    """
    Example:

    7x + 4 = 3x + 28

    or sign-focused:

    7x - 4 = 3x + 20
    """

    x_value = random.randint(
        2,
        10,
    )

    right_coefficient = (
        random.randint(
            1,
            5,
        )
    )

    difference = (
        random.randint(
            2,
            6,
        )
    )

    left_coefficient = (
        right_coefficient
        + difference
    )

    left_constant = random.randint(
        1,
        12,
    )

    reduced_value = (
        difference
        * x_value
    )

    if use_negative_constant:

        # -----------------------------------------
        # ax - b = cx + d
        #
        # difference*x - b = d
        #
        # d = difference*x - b
        # -----------------------------------------

        if left_constant >= reduced_value:

            left_constant = random.randint(
                1,
                max(
                    1,
                    reduced_value - 1,
                ),
            )

        right_constant = (
            reduced_value
            - left_constant
        )

        equation = (
            f"{left_coefficient}x - "
            f"{left_constant} = "
            f"{right_coefficient}x + "
            f"{right_constant}"
        )

        steps = [
            (
                f"{difference}x - "
                f"{left_constant} = "
                f"{right_constant}"
            ),

            (
                f"{difference}x = "
                f"{right_constant} + "
                f"{left_constant}"
            ),

            (
                f"{difference}x = "
                f"{reduced_value}"
            ),

            (
                f"x = "
                f"{reduced_value} / "
                f"{difference}"
            ),

            f"x = {x_value}",
        ]

        skills = [
            "variables_both_sides",
            "sign_handling",
            "inverse_operations",
            "division",
            "variable_isolation",
        ]

    else:

        # -----------------------------------------
        # ax + b = cx + d
        # -----------------------------------------

        right_constant = (
            reduced_value
            + left_constant
        )

        equation = (
            f"{left_coefficient}x + "
            f"{left_constant} = "
            f"{right_coefficient}x + "
            f"{right_constant}"
        )

        steps = [
            (
                f"{difference}x + "
                f"{left_constant} = "
                f"{right_constant}"
            ),

            (
                f"{difference}x = "
                f"{right_constant} - "
                f"{left_constant}"
            ),

            (
                f"{difference}x = "
                f"{reduced_value}"
            ),

            (
                f"x = "
                f"{reduced_value} / "
                f"{difference}"
            ),

            f"x = {x_value}",
        ]

        skills = [
            "variables_both_sides",
            "inverse_operations",
            "division",
            "variable_isolation",
        ]

    return {
        "question":
            f"Solve: {equation}",

        "equation":
            equation,

        "answer":
            f"x = {x_value}",

        "steps":
            steps,

        "difficulty":
            3,

        "skillCodes":
            skills,
    }


def generate_hard(
    target_skill=None,
):
    if target_skill == "sign_handling":

        return (
            generate_hard_variables_both_sides(
                use_negative_constant=True
            )
        )

    return (
        generate_hard_variables_both_sides(
            use_negative_constant=False
        )
    )


# =========================================================
# QUESTION GENERATOR
# =========================================================


def generate_question(
    difficulty: int,
    target_skill: str | None = None,
):
    """
    Generates a verified question.

    target_skill allows Adaptive Engine to request:

    difficulty = 2
    target_skill = sign_handling

    instead of merely:

    difficulty = 2
    """

    generators = {
        1: generate_easy,
        2: generate_medium,
        3: generate_hard,
    }

    if difficulty not in generators:

        raise ValueError(
            "Difficulty must be 1, 2 or 3"
        )

    generator = (
        generators[
            difficulty
        ]
    )

    for _ in range(50):

        question = (
            generator(
                target_skill
            )
        )

        verified = (
            verify_generated_question(
                question[
                    "equation"
                ],

                question[
                    "answer"
                ],

                question[
                    "steps"
                ],
            )
        )

        if verified:

            question[
                "verified"
            ] = True

            question[
                "targetSkill"
            ] = target_skill

            return question

    raise RuntimeError(
        (
            "Unable to generate "
            f"difficulty {difficulty} "
            f"question targeting "
            f"{target_skill}"
        )
    )