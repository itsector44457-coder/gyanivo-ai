import sympy as sp

from sympy.parsing.sympy_parser import (
    implicit_multiplication_application,
    standard_transformations,
)


TRANSFORMATIONS = (
    standard_transformations
    + (
        implicit_multiplication_application,
    )
)


def parse_expression(
    value: str,
):
    return sp.parse_expr(
        value,
        transformations=TRANSFORMATIONS,
    )


def parse_equation(
    equation: str,
):
    if equation.count("=") != 1:
        raise ValueError(
            "Invalid equation"
        )

    left, right = equation.split(
        "=",
        1,
    )

    return (
        parse_expression(left),
        parse_expression(right),
    )


def solve_equation(
    equation: str,
):
    left, right = parse_equation(
        equation
    )

    x = sp.Symbol("x")

    solutions = sp.solve(
        sp.Eq(left, right),
        x,
    )

    return solutions


def verify_answer(
    equation: str,
    answer: str,
) -> bool:

    try:
        solutions = solve_equation(
            equation
        )

        if len(solutions) != 1:
            return False

        answer_clean = (
            answer
            .replace(" ", "")
        )

        if not answer_clean.startswith(
            "x="
        ):
            return False

        answer_value = (
            answer_clean.split(
                "=",
                1,
            )[1]
        )

        parsed_answer = (
            parse_expression(
                answer_value
            )
        )

        return bool(
            sp.simplify(
                solutions[0]
                - parsed_answer
            )
            == 0
        )

    except Exception:
        return False


def equations_equivalent(
    first: str,
    second: str,
) -> bool:

    try:
        x = sp.Symbol("x")

        first_solutions = (
            solve_equation(first)
        )

        second_solutions = (
            solve_equation(second)
        )

        if (
            len(first_solutions) != 1
            or len(second_solutions) != 1
        ):
            return False

        return bool(
            sp.simplify(
                first_solutions[0]
                - second_solutions[0]
            )
            == 0
        )

    except Exception:
        return False


def verify_steps(
    original_equation: str,
    steps: list[str],
) -> bool:

    previous = original_equation

    for step in steps:

        if not equations_equivalent(
            previous,
            step,
        ):
            return False

        previous = step

    return True


def verify_generated_question(
    equation: str,
    answer: str,
    steps: list[str],
) -> bool:

    if not verify_answer(
        equation,
        answer,
    ):
        return False

    if not verify_steps(
        equation,
        steps,
    ):
        return False

    return True