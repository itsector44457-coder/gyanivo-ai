from __future__ import annotations

import json
from pathlib import Path

import pymupdf


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

LAYOUT_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "layout_dataset"
)

INPUT_JSONL = (
    LAYOUT_ROOT
    / "pages.jsonl"
)

IMAGE_ROOT = (
    LAYOUT_ROOT
    / "images"
)

OUTPUT_JSONL = (
    LAYOUT_ROOT
    / "pages_with_images.jsonl"
)


# =========================================================
# CONFIG
# =========================================================

PDF_CONFIG = [
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
# RENDER PDF
# =========================================================

def render_pdf(
    pdf_path: Path,
    part_name: str,
) -> dict[int, str]:

    print()
    print(
        f"🖼 Rendering: {pdf_path.name}"
    )

    document = pymupdf.open(
        str(pdf_path)
    )

    pdf_output_dir = (
        IMAGE_ROOT
        / part_name
        / pdf_path.stem
    )

    pdf_output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    page_paths: dict[int, str] = {}

    # 1.5x scale gives enough visual detail
    # without creating extremely large files.
    matrix = pymupdf.Matrix(
        1.5,
        1.5,
    )

    for page_index in range(
        len(document)
    ):

        page_number = (
            page_index + 1
        )

        page = document[
            page_index
        ]

        pixmap = page.get_pixmap(
            matrix=matrix,
            alpha=False,
        )

        image_path = (
            pdf_output_dir
            / f"page_{page_number:03d}.png"
        )

        pixmap.save(
            str(image_path)
        )

        relative_path = (
            image_path
            .relative_to(
                ML_SERVICE_ROOT
            )
        )

        page_paths[
            page_number
        ] = str(
            relative_path
        )

    document.close()

    print(
        f"   ✅ Images: {len(page_paths)}"
    )

    return page_paths


# =========================================================
# LOAD EXISTING DATASET
# =========================================================

def load_pages() -> list[dict]:

    if not INPUT_JSONL.exists():

        raise FileNotFoundError(
            (
                "Layout dataset not found:\n"
                f"{INPUT_JSONL}"
            )
        )

    pages = []

    with INPUT_JSONL.open(
        "r",
        encoding="utf-8",
    ) as file:

        for line_number, line in enumerate(
            file,
            start=1,
        ):

            line = line.strip()

            if not line:
                continue

            try:
                pages.append(
                    json.loads(
                        line
                    )
                )

            except json.JSONDecodeError as error:

                raise RuntimeError(
                    (
                        f"Invalid JSON on line "
                        f"{line_number}: "
                        f"{error}"
                    )
                )

    return pages


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🧠 Gyanivo NCERT Page Image Builder"
    )

    print(
        "Real page images for document ML"
    )

    IMAGE_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    # -----------------------------------------------------
    # Render all PDFs
    # -----------------------------------------------------

    image_lookup = {}

    total_images = 0

    for config in PDF_CONFIG:

        part_name = config[
            "part"
        ]

        part_folder = (
            NCERT_ROOT
            / part_name
        )

        if not part_folder.exists():

            raise FileNotFoundError(
                f"Missing folder: {part_folder}"
            )

        pdf_files = sorted(
            part_folder.glob(
                config[
                    "pattern"
                ]
            )
        )

        skip_names = {
            name.lower()
            for name in config[
                "skip"
            ]
        }

        pdf_files = [
            pdf
            for pdf in pdf_files
            if pdf.name.lower()
            not in skip_names
        ]

        for pdf_path in pdf_files:

            rendered_pages = render_pdf(
                pdf_path=pdf_path,
                part_name=part_name,
            )

            for (
                page_number,
                image_path,
            ) in rendered_pages.items():

                key = (
                    part_name,
                    pdf_path.name,
                    page_number,
                )

                image_lookup[
                    key
                ] = image_path

                total_images += 1

    # -----------------------------------------------------
    # Load existing word + box dataset
    # -----------------------------------------------------

    pages = load_pages()

    print()
    print(
        f"📄 Existing dataset pages: "
        f"{len(pages)}"
    )

    # -----------------------------------------------------
    # Add image path
    # -----------------------------------------------------

    enriched_pages = []

    missing_images = []

    for page in pages:

        key = (
            page["part"],
            page["pdf"],
            page["pageNumber"],
        )

        image_path = (
            image_lookup.get(
                key
            )
        )

        if image_path is None:

            missing_images.append(
                {
                    "part":
                        page["part"],

                    "pdf":
                        page["pdf"],

                    "pageNumber":
                        page[
                            "pageNumber"
                        ],
                }
            )

            continue

        enriched_page = {
            **page,

            "imagePath":
                image_path,
        }

        enriched_pages.append(
            enriched_page
        )

    # -----------------------------------------------------
    # Strict validation
    # -----------------------------------------------------

    if missing_images:

        print()
        print(
            "❌ Some pages do not have images:"
        )

        for missing in (
            missing_images[:10]
        ):

            print(
                missing
            )

        raise RuntimeError(
            (
                f"{len(missing_images)} "
                "dataset pages are missing images."
            )
        )

    if (
        len(enriched_pages)
        != len(pages)
    ):

        raise RuntimeError(
            "Page/image count mismatch."
        )

    # -----------------------------------------------------
    # Save enriched ML dataset
    # -----------------------------------------------------

    with OUTPUT_JSONL.open(
        "w",
        encoding="utf-8",
    ) as file:

        for page in enriched_pages:

            file.write(
                json.dumps(
                    page,
                    ensure_ascii=False,
                )
            )

            file.write(
                "\n"
            )

    # -----------------------------------------------------
    # Summary
    # -----------------------------------------------------

    summary = {
        "source":
            "Official NCERT PDFs",

        "pageCount":
            len(
                enriched_pages
            ),

        "imageCount":
            total_images,

        "hasRealText":
            True,

        "hasRealBoundingBoxes":
            True,

        "hasRealPageImages":
            True,

        "dataset":
            str(
                OUTPUT_JSONL
                .relative_to(
                    ML_SERVICE_ROOT
                )
            ),
    }

    summary_path = (
        LAYOUT_ROOT
        / "image_dataset_summary.json"
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
        "✅ MULTIMODAL NCERT DATASET READY"
    )

    print(
        f"📄 Pages: "
        f"{len(enriched_pages)}"
    )

    print(
        f"🖼 Images: "
        f"{total_images}"
    )

    print(
        "🔤 Real text: YES"
    )

    print(
        "📐 Real bounding boxes: YES"
    )

    print(
        "🖼 Real page images: YES"
    )

    print()
    print(
        f"💾 Dataset:\n{OUTPUT_JSONL}"
    )

    print(
        "=" * 60
    )


if __name__ == "__main__":
    main()