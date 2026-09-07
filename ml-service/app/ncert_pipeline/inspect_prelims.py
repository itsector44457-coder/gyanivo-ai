from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader


ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

NCERT_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "ncert"
    / "class_7"
    / "mathematics"
)


PRELIM_FILES = [
    NCERT_ROOT
    / "part_1"
    / "gegp1ps.pdf",

    NCERT_ROOT
    / "part_2"
    / "gegp2ps.pdf",
]


def extract_pages(pdf_path: Path) -> list[str]:
    reader = PdfReader(
        str(pdf_path)
    )

    pages = []

    for page_number, page in enumerate(
        reader.pages,
        start=1,
    ):
        try:
            text = (
                page.extract_text()
                or ""
            )

        except Exception as error:
            print(
                f"⚠ Page {page_number} error: {error}"
            )

            text = ""

        pages.append(
            text
        )

    return pages


def find_contents_pages(
    pages: list[str],
) -> list[tuple[int, str]]:
    results = []

    for index, text in enumerate(
        pages
    ):
        if "contents" in text.lower():
            results.append(
                (
                    index + 1,
                    text,
                )
            )

    return results


def main():
    print(
        "📚 Gyanivo NCERT Prelims Inspector"
    )

    for pdf_path in PRELIM_FILES:

        print()
        print(
            "=" * 70
        )

        print(
            f"📖 FILE: {pdf_path.name}"
        )

        print(
            "=" * 70
        )

        if not pdf_path.exists():
            print(
                f"❌ File not found:\n{pdf_path}"
            )

            continue

        pages = extract_pages(
            pdf_path
        )

        print(
            f"✅ Total pages: {len(pages)}"
        )

        contents_pages = (
            find_contents_pages(
                pages
            )
        )

        if contents_pages:
            print()
            print(
                "🎯 CONTENTS PAGE FOUND"
            )

            for (
                page_number,
                text,
            ) in contents_pages:

                print()
                print(
                    f"----- PDF PAGE {page_number} -----"
                )

                print(
                    text
                )

        else:
            print()
            print(
                "⚠ Couldn't automatically find "
                "'CONTENTS'."
            )

            print(
                "Printing last 5 pages instead:"
            )

            start = max(
                0,
                len(pages) - 5,
            )

            for index in range(
                start,
                len(pages),
            ):
                print()
                print(
                    f"----- PDF PAGE {index + 1} -----"
                )

                print(
                    pages[index]
                )


if __name__ == "__main__":
    main()