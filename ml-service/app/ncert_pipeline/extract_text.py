from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader


# =========================================================
# PATHS
# =========================================================

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

SOURCE_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "ncert"
    / "class_7"
    / "mathematics"
)

OUTPUT_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "text"
)


# =========================================================
# HELPERS
# =========================================================

def clean_text(text: str) -> str:
    """
    Basic cleanup without aggressively changing
    mathematical content.
    """

    text = text.replace("\x00", "")

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove trailing spaces from lines
    lines = [
        line.rstrip()
        for line in text.split("\n")
    ]

    text = "\n".join(lines)

    # Maximum two blank lines
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


def should_process_pdf(
    pdf_path: Path,
) -> bool:
    """
    Process chapter PDFs only.

    Examples:
        gegp101.pdf ✅
        gegp108.pdf ✅
        gegp201.pdf ✅
        gegp207.pdf ✅

    Skip:
        gegp1ps.pdf ❌
        gegp2ps.pdf ❌
    """

    name = pdf_path.name.lower()

    if name.endswith("ps.pdf"):
        return False

    return bool(
        re.fullmatch(
            r"gegp[12]\d{2}\.pdf",
            name,
        )
    )


def extract_pdf(
    pdf_path: Path,
) -> dict:
    print(
        f"\n📖 Reading: {pdf_path.name}"
    )

    reader = PdfReader(
        str(pdf_path)
    )

    pages_data = []

    full_text_parts = []

    empty_pages = 0

    for page_number, page in enumerate(
        reader.pages,
        start=1,
    ):
        try:
            page_text = (
                page.extract_text()
                or ""
            )

        except Exception as error:
            print(
                f"   ⚠ Page {page_number}: "
                f"{error}"
            )

            page_text = ""

        page_text = clean_text(
            page_text
        )

        if not page_text:
            empty_pages += 1

        pages_data.append(
            {
                "pageNumber":
                    page_number,

                "text":
                    page_text,
            }
        )

        if page_text:
            full_text_parts.append(
                (
                    f"\n\n"
                    f"===== PAGE {page_number} ====="
                    f"\n\n"
                    f"{page_text}"
                )
            )

    full_text = "".join(
        full_text_parts
    ).strip()

    return {
        "fileName":
            pdf_path.name,

        "pageCount":
            len(reader.pages),

        "emptyPages":
            empty_pages,

        "characterCount":
            len(full_text),

        "text":
            full_text,

        "pages":
            pages_data,
    }


# =========================================================
# MAIN
# =========================================================

def main():
    print(
        "🚀 Gyanivo NCERT Text Extractor"
    )

    print(
        f"📂 Source: {SOURCE_ROOT}"
    )

    print(
        f"📂 Output: {OUTPUT_ROOT}"
    )

    if not SOURCE_ROOT.exists():
        raise FileNotFoundError(
            (
                "\nNCERT source folder not found:\n"
                f"{SOURCE_ROOT}"
            )
        )

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    manifest = []

    processed_count = 0

    total_characters = 0

    # Part 1 + Part 2
    for part_name in [
        "part_1",
        "part_2",
    ]:
        part_directory = (
            SOURCE_ROOT
            / part_name
        )

        if not part_directory.exists():
            print(
                f"⚠ Missing folder: "
                f"{part_directory}"
            )

            continue

        output_part_directory = (
            OUTPUT_ROOT
            / part_name
        )

        output_part_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        pdf_files = sorted(
            [
                pdf
                for pdf
                in part_directory.glob(
                    "*.pdf"
                )
                if should_process_pdf(
                    pdf
                )
            ]
        )

        print(
            f"\n📚 {part_name}: "
            f"{len(pdf_files)} chapter PDFs found"
        )

        for pdf_path in pdf_files:
            result = extract_pdf(
                pdf_path
            )

            stem = pdf_path.stem

            # ---------------------------------------------
            # TXT OUTPUT
            # ---------------------------------------------

            txt_path = (
                output_part_directory
                / f"{stem}.txt"
            )

            txt_path.write_text(
                result["text"],
                encoding="utf-8",
            )

            # ---------------------------------------------
            # PAGE-BY-PAGE JSON OUTPUT
            # ---------------------------------------------

            json_path = (
                output_part_directory
                / f"{stem}.json"
            )

            json_path.write_text(
                json.dumps(
                    {
                        "sourceFile":
                            result[
                                "fileName"
                            ],

                        "part":
                            part_name,

                        "pageCount":
                            result[
                                "pageCount"
                            ],

                        "emptyPages":
                            result[
                                "emptyPages"
                            ],

                        "characterCount":
                            result[
                                "characterCount"
                            ],

                        "pages":
                            result[
                                "pages"
                            ],
                    },
                    indent=2,
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )

            manifest.append(
                {
                    "part":
                        part_name,

                    "sourceFile":
                        result[
                            "fileName"
                        ],

                    "textFile":
                        str(
                            txt_path.relative_to(
                                ML_SERVICE_ROOT
                            )
                        ),

                    "jsonFile":
                        str(
                            json_path.relative_to(
                                ML_SERVICE_ROOT
                            )
                        ),

                    "pageCount":
                        result[
                            "pageCount"
                        ],

                    "emptyPages":
                        result[
                            "emptyPages"
                        ],

                    "characterCount":
                        result[
                            "characterCount"
                        ],
                }
            )

            processed_count += 1

            total_characters += (
                result[
                    "characterCount"
                ]
            )

            print(
                f"   ✅ Pages: "
                f"{result['pageCount']}"
            )

            print(
                f"   ✅ Characters: "
                f"{result['characterCount']:,}"
            )

            if (
                result[
                    "emptyPages"
                ] > 0
            ):
                print(
                    f"   ⚠ Empty pages: "
                    f"{result['emptyPages']}"
                )

    # =====================================================
    # MANIFEST
    # =====================================================

    manifest_path = (
        OUTPUT_ROOT
        / "manifest.json"
    )

    manifest_path.write_text(
        json.dumps(
            {
                "board":
                    "CBSE",

                "source":
                    "NCERT",

                "classLevel":
                    7,

                "subject":
                    "Mathematics",

                "processedFiles":
                    processed_count,

                "totalCharacters":
                    total_characters,

                "chapters":
                    manifest,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        "\n=================================="
    )

    print(
        "✅ NCERT extraction completed"
    )

    print(
        f"📄 PDFs processed: "
        f"{processed_count}"
    )

    print(
        f"🔤 Total characters: "
        f"{total_characters:,}"
    )

    print(
        f"📋 Manifest: "
        f"{manifest_path}"
    )

    print(
        "=================================="
    )


if __name__ == "__main__":
    main()