from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader


# =========================================================
# PATHS
# =========================================================

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

NCERT_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "ncert"
    / "class_7"
    / "mathematics"
)

PROCESSED_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
)

TEXT_ROOT = (
    PROCESSED_ROOT
    / "text"
)

CATALOG_PATH = (
    PROCESSED_ROOT
    / "chapter_catalog.json"
)


# =========================================================
# BOOK CONFIG
# =========================================================

BOOKS = [
    {
        "part": "part_1",
        "bookName": "Ganita Prakash Part 1",
        "prelims": "gegp1ps.pdf",
        "filePrefix": "gegp1",
        "globalOffset": 0,
        "expectedChapters": 8,
    },
    {
        "part": "part_2",
        "bookName": "Ganita Prakash Part 2",
        "prelims": "gegp2ps.pdf",
        "filePrefix": "gegp2",
        "globalOffset": 8,
        "expectedChapters": 7,
    },
]


# =========================================================
# PDF TEXT
# =========================================================

def read_pdf_pages(
    pdf_path: Path,
) -> list[str]:

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
                f"⚠ Could not read "
                f"{pdf_path.name} "
                f"page {page_number}: "
                f"{error}"
            )

            text = ""

        pages.append(
            text
        )

    return pages


# =========================================================
# CONTENTS PAGE
# =========================================================

def find_contents_text(
    pdf_path: Path,
) -> str:

    pages = read_pdf_pages(
        pdf_path
    )

    for text in pages:

        if (
            "contents"
            in text.lower()
            and "chapter"
            in text.lower()
        ):
            return text

    raise RuntimeError(
        (
            "Could not find CONTENTS "
            f"page inside {pdf_path.name}"
        )
    )


# =========================================================
# CLEAN LINE
# =========================================================

def clean_line(
    value: str,
) -> str:

    value = (
        value
        .replace("\t", " ")
        .strip()
    )

    value = re.sub(
        r"\s+",
        " ",
        value,
    )

    return value.strip()


# =========================================================
# PARSE CONTENTS
# =========================================================

def parse_chapters(
    contents_text: str,
) -> list[dict]:

    lines = [
        clean_line(line)
        for line
        in contents_text.splitlines()
    ]

    lines = [
        line
        for line in lines
        if line
    ]

    chapters = []

    index = 0

    while index < len(lines):

        line = lines[index]

        chapter_match = re.fullmatch(
            r"Chapter\s+(\d+)",
            line,
            flags=re.IGNORECASE,
        )

        if not chapter_match:

            index += 1
            continue

        chapter_number = int(
            chapter_match.group(1)
        )

        # ---------------------------------------------
        # Next meaningful line should contain:
        #
        # Large Numbers Around Us  1
        #
        # Arithmetic Expressions  24
        # ---------------------------------------------

        next_index = (
            index + 1
        )

        title_line = None

        while (
            next_index
            < len(lines)
        ):

            candidate = lines[
                next_index
            ]

            if re.fullmatch(
                r"Chapter\s+\d+",
                candidate,
                flags=re.IGNORECASE,
            ):
                break

            if candidate.lower().startswith(
                "learning material"
            ):
                break

            title_line = candidate

            break

        if not title_line:

            raise RuntimeError(
                (
                    "Could not find title "
                    f"for chapter "
                    f"{chapter_number}"
                )
            )

        # ---------------------------------------------
        # Extract ending page number
        #
        # "Large Numbers Around Us 1"
        #
        # title = Large Numbers Around Us
        # page = 1
        # ---------------------------------------------

        title_match = re.match(
            r"^(.*\S)\s+(\d+)$",
            title_line,
        )

        if not title_match:

            raise RuntimeError(
                (
                    "Could not parse chapter title "
                    f"line:\n{title_line}"
                )
            )

        chapter_title = (
            title_match
            .group(1)
            .strip()
        )

        start_page = int(
            title_match.group(2)
        )

        chapters.append(
            {
                "localChapterNumber":
                    chapter_number,

                "chapterTitle":
                    chapter_title,

                "bookStartPage":
                    start_page,
            }
        )

        index = (
            next_index + 1
        )

    return chapters


# =========================================================
# BUILD ONE BOOK
# =========================================================

def process_book(
    config: dict,
) -> list[dict]:

    part_name = config[
        "part"
    ]

    prelims_path = (
        NCERT_ROOT
        / part_name
        / config["prelims"]
    )

    if not prelims_path.exists():

        raise FileNotFoundError(
            (
                "Prelims file not found:\n"
                f"{prelims_path}"
            )
        )

    print()
    print(
        f"📖 Reading "
        f"{config['bookName']}"
    )

    contents = (
        find_contents_text(
            prelims_path
        )
    )

    parsed = (
        parse_chapters(
            contents
        )
    )

    if (
        len(parsed)
        != config[
            "expectedChapters"
        ]
    ):

        raise RuntimeError(
            (
                f"{config['bookName']} "
                f"expected "
                f"{config['expectedChapters']} "
                f"chapters but detected "
                f"{len(parsed)}"
            )
        )

    chapters = []

    for item in parsed:

        local_number = (
            item[
                "localChapterNumber"
            ]
        )

        global_number = (
            config[
                "globalOffset"
            ]
            + local_number
        )

        # =============================================
        # SOURCE FILE
        #
        # Part 1:
        # Chapter 1 -> gegp101.pdf
        #
        # Part 2:
        # Chapter 1 -> gegp201.pdf
        # =============================================

        source_pdf = (
            f"{config['filePrefix']}"
            f"{local_number:02d}.pdf"
        )

        source_txt = (
            TEXT_ROOT
            / part_name
            / source_pdf.replace(
                ".pdf",
                ".txt",
            )
        )

        source_json = (
            TEXT_ROOT
            / part_name
            / source_pdf.replace(
                ".pdf",
                ".json",
            )
        )

        source_original_pdf = (
            NCERT_ROOT
            / part_name
            / source_pdf
        )

        if not source_original_pdf.exists():

            print(
                f"⚠ Original PDF missing: "
                f"{source_pdf}"
            )

        if not source_txt.exists():

            print(
                f"⚠ Extracted TXT missing: "
                f"{source_txt.name}"
            )

        chapter = {
            "chapterNumber":
                global_number,

            "localChapterNumber":
                local_number,

            "chapterTitle":
                item[
                    "chapterTitle"
                ],

            "part":
                part_name,

            "bookName":
                config[
                    "bookName"
                ],

            "bookStartPage":
                item[
                    "bookStartPage"
                ],

            "sourcePdf":
                source_pdf,

            "sourcePdfPath":
                str(
                    source_original_pdf
                    .relative_to(
                        ML_SERVICE_ROOT
                    )
                ),

            "sourceTextPath":
                str(
                    source_txt
                    .relative_to(
                        ML_SERVICE_ROOT
                    )
                ),

            "sourceJsonPath":
                str(
                    source_json
                    .relative_to(
                        ML_SERVICE_ROOT
                    )
                ),

            "source":
                "NCERT_OFFICIAL_CONTENTS",

            "verifiedTitle":
                True,
        }

        chapters.append(
            chapter
        )

        print(
            f"   ✅ "
            f"{global_number:02d}. "
            f"{chapter['chapterTitle']}"
        )

    return chapters


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "📚 Gyanivo Official NCERT "
        "Chapter Catalog Builder"
    )

    all_chapters = []

    for config in BOOKS:

        chapters = (
            process_book(
                config
            )
        )

        all_chapters.extend(
            chapters
        )

    all_chapters.sort(
        key=lambda item:
            item[
                "chapterNumber"
            ]
    )

    # =====================================================
    # VALIDATE 15 CHAPTERS
    # =====================================================

    expected_numbers = list(
        range(
            1,
            16,
        )
    )

    actual_numbers = [
        chapter[
            "chapterNumber"
        ]
        for chapter in all_chapters
    ]

    if (
        actual_numbers
        != expected_numbers
    ):

        raise RuntimeError(
            (
                "Chapter numbering validation "
                "failed.\n"
                f"Expected: "
                f"{expected_numbers}\n"
                f"Found: "
                f"{actual_numbers}"
            )
        )

    # =====================================================
    # FINAL CATALOG
    # =====================================================

    catalog = {
        "board":
            "CBSE",

        "source":
            "NCERT",

        "curriculum":
            "NCERT",

        "classLevel":
            7,

        "subject":
            "Mathematics",

        "book":
            "Ganita Prakash",

        "totalParts":
            2,

        "totalChapters":
            len(
                all_chapters
            ),

        "catalogSource":
            "Official NCERT contents pages",

        "titleDetection":
            "OFFICIAL",

        "chapters":
            all_chapters,
    }

    PROCESSED_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    CATALOG_PATH.write_text(
        json.dumps(
            catalog,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # OUTPUT
    # =====================================================

    print()
    print(
        "======================================"
    )

    print(
        "✅ OFFICIAL CHAPTER CATALOG READY"
    )

    print(
        f"📚 Chapters: "
        f"{len(all_chapters)}/15"
    )

    print(
        f"💾 Saved:\n{CATALOG_PATH}"
    )

    print(
        "======================================"
    )

    print()
    print(
        "📋 CLASS 7 MATHEMATICS"
    )

    print()

    for chapter in all_chapters:

        print(
            f"{chapter['chapterNumber']:02d}. "
            f"{chapter['chapterTitle']}"
        )


if __name__ == "__main__":
    main()