from __future__ import annotations

import json
from pathlib import Path

import fitz


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

OUTPUT_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "layout_dataset"
)

OUTPUT_JSONL = (
    OUTPUT_ROOT
    / "pages.jsonl"
)


# =========================================================
# PDF CONFIG
# =========================================================

BOOK_PARTS = [
    {
        "part": "part_1",
        "pattern": "gegp1*.pdf",
        "skip": {"gegp1ps.pdf"},
    },
    {
        "part": "part_2",
        "pattern": "gegp2*.pdf",
        "skip": {"gegp2ps.pdf"},
    },
]


# =========================================================
# NORMALIZE BOX
# =========================================================

def normalize_box(
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    page_width: float,
    page_height: float,
) -> list[int]:

    """
    LayoutLM-style coordinates:
    all coordinates normalized to 0-1000.
    """

    if page_width <= 0 or page_height <= 0:
        return [0, 0, 0, 0]

    nx0 = int(
        max(
            0,
            min(
                1000,
                (x0 / page_width) * 1000,
            ),
        )
    )

    ny0 = int(
        max(
            0,
            min(
                1000,
                (y0 / page_height) * 1000,
            ),
        )
    )

    nx1 = int(
        max(
            0,
            min(
                1000,
                (x1 / page_width) * 1000,
            ),
        )
    )

    ny1 = int(
        max(
            0,
            min(
                1000,
                (y1 / page_height) * 1000,
            ),
        )
    )

    return [
        nx0,
        ny0,
        nx1,
        ny1,
    ]


# =========================================================
# PAGE EXTRACTION
# =========================================================

def extract_page(
    page,
    pdf_name: str,
    part_name: str,
    page_number: int,
) -> dict:

    rect = page.rect

    page_width = float(
        rect.width
    )

    page_height = float(
        rect.height
    )

    words_raw = page.get_text(
        "words"
    )

    tokens = []

    boxes = []

    word_metadata = []

    for word in words_raw:

        (
            x0,
            y0,
            x1,
            y1,
            text,
            block_number,
            line_number,
            word_number,
        ) = word

        text = str(
            text
        ).strip()

        if not text:
            continue

        normalized = normalize_box(
            x0=x0,
            y0=y0,
            x1=x1,
            y1=y1,
            page_width=page_width,
            page_height=page_height,
        )

        tokens.append(
            text
        )

        boxes.append(
            normalized
        )

        word_metadata.append(
            {
                "text": text,

                "bbox": {
                    "x0": round(
                        float(x0),
                        2,
                    ),
                    "y0": round(
                        float(y0),
                        2,
                    ),
                    "x1": round(
                        float(x1),
                        2,
                    ),
                    "y1": round(
                        float(y1),
                        2,
                    ),
                },

                "normalizedBox":
                    normalized,

                "blockNumber":
                    int(
                        block_number
                    ),

                "lineNumber":
                    int(
                        line_number
                    ),

                "wordNumber":
                    int(
                        word_number
                    ),
            }
        )

    page_text = " ".join(
        tokens
    )

    return {
        "id":
            f"{pdf_name}_page_{page_number}",

        "source":
            "NCERT",

        "board":
            "CBSE",

        "classLevel":
            7,

        "subject":
            "Mathematics",

        "part":
            part_name,

        "pdf":
            pdf_name,

        "pageNumber":
            page_number,

        "pageWidth":
            round(
                page_width,
                2,
            ),

        "pageHeight":
            round(
                page_height,
                2,
            ),

        "tokenCount":
            len(
                tokens
            ),

        "text":
            page_text,

        "tokens":
            tokens,

        "boxes":
            boxes,

        "words":
            word_metadata,
    }


# =========================================================
# PROCESS PDF
# =========================================================

def process_pdf(
    pdf_path: Path,
    part_name: str,
) -> list[dict]:

    print()
    print(
        f"📖 {pdf_path.name}"
    )

    document = fitz.open(
        str(
            pdf_path
        )
    )

    pages = []

    for page_index in range(
        len(document)
    ):

        page = document[
            page_index
        ]

        page_data = extract_page(
            page=page,
            pdf_name=pdf_path.name,
            part_name=part_name,
            page_number=page_index + 1,
        )

        pages.append(
            page_data
        )

    document.close()

    total_tokens = sum(
        page["tokenCount"]
        for page in pages
    )

    print(
        f"   ✅ Pages: {len(pages)}"
    )

    print(
        f"   ✅ Tokens: {total_tokens:,}"
    )

    return pages


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🧠 Gyanivo Real NCERT Layout Dataset Builder"
    )

    print(
        "Source: official NCERT PDFs"
    )

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    all_pages = []

    pdf_count = 0

    for book in BOOK_PARTS:

        part_name = book[
            "part"
        ]

        folder = (
            NCERT_ROOT
            / part_name
        )

        if not folder.exists():

            raise FileNotFoundError(
                f"Missing folder: {folder}"
            )

        pdf_files = sorted(
            folder.glob(
                book[
                    "pattern"
                ]
            )
        )

        pdf_files = [
            pdf
            for pdf in pdf_files
            if pdf.name.lower()
            not in {
                name.lower()
                for name
                in book["skip"]
            }
        ]

        print()
        print(
            "=" * 60
        )

        print(
            f"📚 {part_name}"
        )

        print(
            f"Found {len(pdf_files)} chapter PDFs"
        )

        print(
            "=" * 60
        )

        for pdf_path in pdf_files:

            pages = process_pdf(
                pdf_path,
                part_name,
            )

            all_pages.extend(
                pages
            )

            pdf_count += 1

    # =====================================================
    # SAVE JSONL
    # =====================================================

    with OUTPUT_JSONL.open(
        "w",
        encoding="utf-8",
    ) as file:

        for page in all_pages:

            file.write(
                json.dumps(
                    page,
                    ensure_ascii=False,
                )
            )

            file.write(
                "\n"
            )

    # =====================================================
    # SUMMARY
    # =====================================================

    total_tokens = sum(
        page[
            "tokenCount"
        ]
        for page
        in all_pages
    )

    non_empty_pages = sum(
        1
        for page
        in all_pages
        if page[
            "tokenCount"
        ] > 0
    )

    summary = {
        "source":
            "Official NCERT PDFs",

        "board":
            "CBSE",

        "classLevel":
            7,

        "subject":
            "Mathematics",

        "pdfCount":
            pdf_count,

        "pageCount":
            len(
                all_pages
            ),

        "nonEmptyPages":
            non_empty_pages,

        "totalTokens":
            total_tokens,

        "dataset":
            str(
                OUTPUT_JSONL
                .relative_to(
                    ML_SERVICE_ROOT
                )
            ),
    }

    summary_path = (
        OUTPUT_ROOT
        / "summary.json"
    )

    summary_path.write_text(
        json.dumps(
            summary,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print()
    print(
        "=" * 60
    )

    print(
        "✅ REAL NCERT LAYOUT DATASET READY"
    )

    print(
        f"📚 PDFs: {pdf_count}"
    )

    print(
        f"📄 Pages: {len(all_pages)}"
    )

    print(
        f"🔤 Tokens: {total_tokens:,}"
    )

    print(
        f"💾 Dataset:\n{OUTPUT_JSONL}"
    )

    print(
        "=" * 60
    )


if __name__ == "__main__":
    main()