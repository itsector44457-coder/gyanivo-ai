from __future__ import annotations

import re

import sympy as sp

from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)


TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)


# =========================================================
# NORMALIZATION
# =========================================================


def normalize_math_text(value: str) -> str:
    value = value.strip()

    # Common symbols students may type
    value = value.replace("×", "*")
    value = value.replace("÷", "/")
    value = value.replace("−", "-")
    value = value.replace("–", "-")
    value = value.replace("^", "**")

    # Remove Solve:
    value = re.sub(
        r"^\s*solve\s*:\s*",
        "",
        value,
        flags=re.IGNORECASE,
    )

    return value.strip()


# =========================================================
# PARSING
# =========================================================


def parse_expression(value: str) -> sp.Expr:
    value = normalize_math_text(value)

    return parse_expr(
        value,
        transformations=TRANSFORMATIONS,
        evaluate=True,
    )


def parse_equation(value: str):
    """
    Example:

    6x + 4 = 40

    returns:

    left  = 6*x + 4
    right = 40
    """

    value = normalize_math_text(value)

    if value.count("=") != 1:
        raise ValueError(
            "Equation must contain exactly one '=' sign."
        )

    left_text, right_text = value.split(
        "=",
        1,
    )

    left = parse_expression(
        left_text
    )

    right = parse_expression(
        right_text
    )

    return left, right


def equation_expression(
    equation: str,
) -> sp.Expr:
    """
    Turns:

    6x + 4 = 40

    into:

    6x - 36
    """

    left, right = parse_equation(
        equation
    )

    return sp.expand(
        left - right
    )


# =========================================================
# VARIABLE DETECTION
# =========================================================


def get_variables(
    *equations: str,
):
    symbols = set()

    for equation in equations:
        try:
            expression = equation_expression(
                equation
            )

            symbols.update(
                expression.free_symbols
            )

        except Exception:
            continue

    return sorted(
        symbols,
        key=lambda item: item.name,
    )


# =========================================================
# SOLUTION SET
# =========================================================


def get_solution_set(
    equation: str,
    variable: sp.Symbol,
):
    expression = equation_expression(
        equation
    )

    return sp.solveset(
        expression,
        variable,
        domain=sp.S.Reals,
    )


# =========================================================
# EQUIVALENCE
# =========================================================


def equations_are_equivalent(
    first: str,
    second: str,
) -> bool:
    """
    Two equations are considered equivalent if they
    represent the same solution.

    Examples:

    6x + 4 = 40
    6x = 40 - 4

    are equivalent.

    Also:

    6x = 36
    x = 6

    are equivalent.
    """

    try:
        first_expression = (
            equation_expression(
                first
            )
        )

        second_expression = (
            equation_expression(
                second
            )
        )

    except Exception:
        return False

    # -----------------------------------------------------
    # METHOD 1:
    # Exact symbolic equivalence
    # -----------------------------------------------------

    try:
        difference = sp.simplify(
            first_expression
            - second_expression
        )

        if difference == 0:
            return True

    except Exception:
        pass

    # -----------------------------------------------------
    # METHOD 2:
    # Same equation but multiplied by -1
    #
    # x = 5
    # 5 = x
    # -----------------------------------------------------

    try:
        reversed_difference = (
            sp.simplify(
                first_expression
                + second_expression
            )
        )

        if reversed_difference == 0:
            return True

    except Exception:
        pass

    # -----------------------------------------------------
    # METHOD 3:
    # Compare solution sets
    #
    # This is most important for our current
    # Class 7 linear-equation engine.
    # -----------------------------------------------------

    variables = get_variables(
        first,
        second,
    )

    if len(variables) == 1:
        variable = variables[0]

        try:
            first_solution = (
                get_solution_set(
                    first,
                    variable,
                )
            )

            second_solution = (
                get_solution_set(
                    second,
                    variable,
                )
            )

            if (
                first_solution
                == second_solution
            ):
                return True

        except Exception:
            pass

    # -----------------------------------------------------
    # METHOD 4:
    # Proportional equations
    #
    # 6x - 36 = 0
    # x - 6 = 0
    #
    # First is 6 times second.
    # -----------------------------------------------------

    try:
        if second_expression != 0:
            ratio = sp.simplify(
                first_expression
                / second_expression
            )

            if (
                ratio.is_number
                and ratio != 0
            ):
                return True

    except Exception:
        pass

    return False


# =========================================================
# SIMPLE LINEAR INFO
# =========================================================


def get_linear_info(
    equation: str,
):
    try:
        expression = (
            equation_expression(
                equation
            )
        )

        variables = list(
            expression.free_symbols
        )

        if len(variables) != 1:
            return None

        variable = variables[0]

        polynomial = sp.Poly(
            expression,
            variable,
        )

        if polynomial.degree() > 1:
            return None

        coefficient = (
            polynomial.coeff_monomial(
                variable
            )
        )

        constant = (
            polynomial.coeff_monomial(
                1
            )
        )

        return {
            "variable":
                variable,

            "coefficient":
                sp.simplify(
                    coefficient
                ),

            "constant":
                sp.simplify(
                    constant
                ),
        }

    except Exception:
        return None


# =========================================================
# SIGN ERROR
# =========================================================


def looks_like_sign_error(
    original_equation: str,
    student_step: str,
) -> bool:

    original = get_linear_info(
        original_equation
    )

    student = get_linear_info(
        student_step
    )

    if (
        original is None
        or student is None
    ):
        return False

    original_coefficient = (
        original["coefficient"]
    )

    student_coefficient = (
        student["coefficient"]
    )

    original_constant = (
        original["constant"]
    )

    student_constant = (
        student["constant"]
    )

    # Same variable coefficient but
    # incorrect constant transformation.
    if (
        original_coefficient
        == student_coefficient
        and original_constant
        != student_constant
    ):
        return True

    return False


# =========================================================
# OPERATION ERROR
# =========================================================


def looks_like_operation_error(
    previous_step: str,
    student_step: str,
) -> bool:

    previous = (
        normalize_math_text(
            previous_step
        )
        .replace(" ", "")
    )

    student = (
        normalize_math_text(
            student_step
        )
        .replace(" ", "")
    )

    # Example:
    #
    # 3x = 15
    #
    # Wrong:
    #
    # x = 15 * 3
    #
    if (
        "*" in student
        and "*" not in previous
    ):
        return True

    return False


# =========================================================
# VALIDATOR
# =========================================================


def validate_student_step(
    equation: str,
    previous_step: str,
    student_step: str,
) -> dict:

    equation = normalize_math_text(
        equation
    )

    previous_step = (
        normalize_math_text(
            previous_step
        )
    )

    student_step = (
        normalize_math_text(
            student_step
        )
    )

    # -----------------------------------------------------
    # EMPTY INPUT
    # -----------------------------------------------------

    if not student_step:
        return {
            "correct": False,
            "mistakeType":
                "PROCEDURAL_ERROR",
            "skill":
                "variable_isolation",
            "retry": True,
            "message":
                "Enter your next mathematical step.",
        }

    # -----------------------------------------------------
    # PARSE STUDENT INPUT
    # -----------------------------------------------------

    try:
        parse_equation(
            student_step
        )

    except Exception:
        return {
            "correct": False,
            "mistakeType":
                "FORMAT_ERROR",
            "skill": None,
            "retry": True,
            "message":
                "I couldn't read that equation. Try a format like 6x = 40 - 4.",
        }

    # =====================================================
    # MOST IMPORTANT PART
    #
    # Student step can be mathematically equivalent to:
    #
    # 1. previous step
    # OR
    # 2. original equation
    #
    # If either is true → CORRECT
    # =====================================================

    correct_against_previous = (
        equations_are_equivalent(
            previous_step,
            student_step,
        )
    )

    correct_against_original = (
        equations_are_equivalent(
            equation,
            student_step,
        )
    )

    if (
        correct_against_previous
        or correct_against_original
    ):
        return {
            "correct": True,
            "mistakeType":
                "CORRECT",
            "skill": None,
            "retry": False,
            "message":
                "Great! This step is mathematically correct.",
        }

    # =====================================================
    # ONLY INCORRECT STEPS REACH THIS POINT
    # =====================================================

    if looks_like_sign_error(
        equation,
        student_step,
    ):
        return {
            "correct": False,
            "mistakeType":
                "SIGN_ERROR",
            "skill":
                "sign_handling",
            "retry": True,
            "message":
                "Your approach is close. Check how the sign changes when you apply the operation.",
        }

    if looks_like_operation_error(
        previous_step,
        student_step,
    ):
        return {
            "correct": False,
            "mistakeType":
                "OPERATION_ERROR",
            "skill":
                "inverse_operations",
            "retry": True,
            "message":
                "Check which inverse operation should be used to isolate the variable.",
        }

    return {
        "correct": False,
        "mistakeType":
            "PROCEDURAL_ERROR",
        "skill":
            "variable_isolation",
        "retry": True,
        "message":
            "That step changes the solution of the equation. Try one operation while keeping both sides balanced.",
    }


# =========================================================
# COMPATIBILITY ALIAS
# =========================================================
#
# If any old code imports validate_step(),
# it will still work.
# =========================================================


def validate_step(
    equation: str,
    previous_step: str,
    student_step: str,
) -> dict:

    return validate_student_step(
        equation=equation,
        previous_step=previous_step,
        student_step=student_step,
    )