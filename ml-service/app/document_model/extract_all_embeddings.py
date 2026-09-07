from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from transformers import AutoModel, AutoProcessor


# =========================================================
# CONFIG
# =========================================================

MODEL_NAME = "microsoft/layoutlmv3-base"

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "layout_dataset"
    / "pages_with_images.jsonl"
)

OUTPUT_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "embeddings"
)

EMBEDDINGS_PATH = (
    OUTPUT_ROOT
    / "page_embeddings.npy"
)

METADATA_PATH = (
    OUTPUT_ROOT
    / "page_embeddings_metadata.json"
)

SUMMARY_PATH = (
    OUTPUT_ROOT
    / "embedding_summary.json"
)


# =========================================================
# DEVICE
# =========================================================

def get_device() -> torch.device:

    if torch.cuda.is_available():
        return torch.device("cuda")

    if (
        hasattr(torch, "xpu")
        and torch.xpu.is_available()
    ):
        return torch.device("xpu")

    return torch.device("cpu")


# =========================================================
# LOAD DATASET
# =========================================================

def load_dataset() -> list[dict]:

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{DATASET_PATH}"
        )

    pages: list[dict] = []

    with DATASET_PATH.open(
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
                page = json.loads(line)

            except json.JSONDecodeError as error:
                raise RuntimeError(
                    f"Invalid JSON line {line_number}: {error}"
                )

            tokens = page.get(
                "tokens",
                []
            )

            boxes = page.get(
                "boxes",
                []
            )

            image_path = page.get(
                "imagePath"
            )

            if not tokens:
                continue

            if len(tokens) != len(boxes):
                print(
                    f"⚠ Skipping {page.get('id')} "
                    f"because token/box count differs."
                )
                continue

            if not image_path:
                continue

            pages.append(
                page
            )

    return pages


# =========================================================
# LOAD IMAGE
# =========================================================

def load_image(
    relative_path: str,
) -> Image.Image:

    image_path = (
        ML_SERVICE_ROOT
        / Path(relative_path)
    )

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image missing:\n{image_path}"
        )

    return Image.open(
        image_path
    ).convert(
        "RGB"
    )


# =========================================================
# EXTRACT ONE PAGE EMBEDDING
# =========================================================

def extract_embedding(
    page: dict,
    processor,
    model,
    device: torch.device,
) -> np.ndarray:

    image = load_image(
        page["imagePath"]
    )

    words = page[
        "tokens"
    ]

    boxes = page[
        "boxes"
    ]

    encoding = processor(
        image,
        words,
        boxes=boxes,
        truncation=True,
        max_length=512,
        return_tensors="pt",
    )

    encoding = {
        key: value.to(device)
        for key, value
        in encoding.items()
    }

    with torch.inference_mode():

        outputs = model(
            **encoding
        )

    # CLS representation of entire multimodal page
    embedding = (
        outputs
        .last_hidden_state[
            0,
            0,
            :
        ]
        .detach()
        .cpu()
        .numpy()
        .astype(
            np.float32
        )
    )

    image.close()

    return embedding


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🧠 Gyanivo NCERT Full Embedding Pipeline"
    )

    print(
        "Real NCERT → LayoutLMv3 → Learned Vectors"
    )

    print()

    device = get_device()

    print(
        f"⚙ Device: {device}"
    )

    # =====================================================
    # LOAD DATASET
    # =====================================================

    pages = load_dataset()

    print(
        f"📄 Valid NCERT pages: {len(pages)}"
    )

    if not pages:
        raise RuntimeError(
            "No valid dataset pages found."
        )

    # =====================================================
    # LOAD MODEL
    # =====================================================

    print()
    print(
        "📥 Loading LayoutLMv3..."
    )

    processor = (
        AutoProcessor.from_pretrained(
            MODEL_NAME,
            apply_ocr=False,
        )
    )

    model = (
        AutoModel.from_pretrained(
            MODEL_NAME
        )
    )

    model.to(
        device
    )

    model.eval()

    print(
        "✅ Model ready"
    )

    # =====================================================
    # RUN ALL REAL NCERT PAGES
    # =====================================================

    embeddings: list[np.ndarray] = []

    metadata: list[dict] = []

    failures = []

    start_time = time.time()

    total_pages = len(
        pages
    )

    print()
    print(
        "🚀 Starting ML inference..."
    )

    print()

    for index, page in enumerate(
        pages,
        start=1,
    ):

        try:

            embedding = (
                extract_embedding(
                    page=page,
                    processor=processor,
                    model=model,
                    device=device,
                )
            )

            embeddings.append(
                embedding
            )

            metadata.append(
                {
                    "embeddingIndex":
                        len(embeddings) - 1,

                    "id":
                        page.get(
                            "id"
                        ),

                    "part":
                        page.get(
                            "part"
                        ),

                    "pdf":
                        page.get(
                            "pdf"
                        ),

                    "pageNumber":
                        page.get(
                            "pageNumber"
                        ),

                    "tokenCount":
                        page.get(
                            "tokenCount",
                            len(
                                page.get(
                                    "tokens",
                                    [],
                                )
                            ),
                        ),

                    "imagePath":
                        page.get(
                            "imagePath"
                        ),

                    # Small text preview only.
                    # Full source text already exists
                    # in pages_with_images.jsonl.
                    "textPreview":
                        page.get(
                            "text",
                            "",
                        )[:300],
                }
            )

            status = "✅"

        except Exception as error:

            failures.append(
                {
                    "id":
                        page.get(
                            "id"
                        ),

                    "error":
                        str(
                            error
                        ),
                }
            )

            status = "❌"

        # ---------------------------------------------
        # Progress
        # ---------------------------------------------

        if (
            index == 1
            or index % 10 == 0
            or index == total_pages
        ):

            elapsed = (
                time.time()
                - start_time
            )

            success_count = len(
                embeddings
            )

            print(
                f"{status} "
                f"{index}/{total_pages} "
                f"| successful: {success_count} "
                f"| elapsed: {elapsed / 60:.1f} min"
            )

    # =====================================================
    # VALIDATION
    # =====================================================

    if not embeddings:

        raise RuntimeError(
            "No embeddings were generated."
        )

    embedding_matrix = np.stack(
        embeddings,
        axis=0,
    )

    print()
    print(
        "🧬 Embedding matrix created"
    )

    print(
        f"Shape: {embedding_matrix.shape}"
    )

    # =====================================================
    # VECTOR NORMALIZATION CHECK
    # =====================================================

    vector_norms = np.linalg.norm(
        embedding_matrix,
        axis=1,
    )

    average_norm = float(
        np.mean(
            vector_norms
        )
    )

    min_norm = float(
        np.min(
            vector_norms
        )
    )

    max_norm = float(
        np.max(
            vector_norms
        )
    )

    # =====================================================
    # SAVE
    # =====================================================

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    np.save(
        EMBEDDINGS_PATH,
        embedding_matrix,
    )

    METADATA_PATH.write_text(
        json.dumps(
            metadata,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    elapsed_seconds = (
        time.time()
        - start_time
    )

    summary = {
        "source":
            "Official NCERT",

        "model":
            MODEL_NAME,

        "device":
            str(
                device
            ),

        "inputPages":
            total_pages,

        "successfulPages":
            len(
                embeddings
            ),

        "failedPages":
            len(
                failures
            ),

        "embeddingDimensions":
            int(
                embedding_matrix.shape[1]
            ),

        "embeddingMatrixShape": [
            int(
                value
            )
            for value
            in embedding_matrix.shape
        ],

        "averageVectorNorm":
            average_norm,

        "minimumVectorNorm":
            min_norm,

        "maximumVectorNorm":
            max_norm,

        "elapsedSeconds":
            round(
                elapsed_seconds,
                2,
            ),

        "failures":
            failures,

        "embeddingFile":
            str(
                EMBEDDINGS_PATH.relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "metadataFile":
            str(
                METADATA_PATH.relative_to(
                    ML_SERVICE_ROOT
                )
            ),
    }

    SUMMARY_PATH.write_text(
        json.dumps(
            summary,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # FINISH
    # =====================================================

    print()
    print(
        "=" * 65
    )

    print(
        "✅ NCERT ML EMBEDDINGS COMPLETE"
    )

    print(
        f"📄 Input pages: {total_pages}"
    )

    print(
        f"✅ Successful: {len(embeddings)}"
    )

    print(
        f"❌ Failed: {len(failures)}"
    )

    print(
        f"🧬 Matrix: {embedding_matrix.shape}"
    )

    print(
        f"📐 Dimensions: "
        f"{embedding_matrix.shape[1]}"
    )

    print(
        f"⏱ Time: "
        f"{elapsed_seconds / 60:.2f} minutes"
    )

    print()
    print(
        f"💾 Embeddings:\n{EMBEDDINGS_PATH}"
    )

    print()
    print(
        f"💾 Metadata:\n{METADATA_PATH}"
    )

    print(
        "=" * 65
    )


if __name__ == "__main__":
    main()