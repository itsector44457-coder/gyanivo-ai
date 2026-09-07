import re


def extract_question_features(
    equation: str,
) -> list[float]:

    clean = (
        equation
        .replace(" ", "")
        .lower()
    )

    # -----------------------------------------
    # Basic structural features
    # -----------------------------------------

    plus_count = clean.count("+")
    minus_count = clean.count("-")
    multiply_count = clean.count("*")
    divide_count = clean.count("/")

    left, right = clean.split("=")

    x_left = left.count("x")
    x_right = right.count("x")

    variable_both_sides = int(
        x_left > 0 and x_right > 0
    )

    has_parentheses = int(
        "(" in clean or ")" in clean
    )

    has_fraction = int(
        "/" in clean
    )

    numbers = re.findall(
        r"-?\d+",
        clean,
    )

    numeric_values = [
        abs(int(value))
        for value in numbers
        if value not in ("", "-")
    ]

    max_number = (
        max(numeric_values)
        if numeric_values
        else 0
    )

    number_count = len(
        numeric_values
    )

    operation_count = (
        plus_count
        + minus_count
        + multiply_count
        + divide_count
    )

    return [
        float(operation_count),
        float(variable_both_sides),
        float(has_parentheses),
        float(has_fraction),
        float(max_number),
        float(number_count),
        float(x_left + x_right),
    ]