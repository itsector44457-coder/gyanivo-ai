from __future__ import annotations

import json
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

OUTPUT_EMBEDDING = (
    OUTPUT_ROOT
    / "first_page_embedding.npy"
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
# LOAD REAL NCERT PAGE
# =========================================================

def load_first_valid_page() -> dict:

    if not DATASET_PATH.exists():

        raise FileNotFoundError(
            f"Dataset not found:\n{DATASET_PATH}"
        )

    with DATASET_PATH.open(
        "r",
        encoding="utf-8",
    ) as file:

        for line in file:

            line = line.strip()

            if not line:
                continue

            page = json.loads(line)

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

            if (
                len(tokens) >= 20
                and len(tokens) == len(boxes)
                and image_path
            ):
                return page

    raise RuntimeError(
        "No valid NCERT page found."
    )


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🧠 Gyanivo LayoutLMv3 Test"
    )

    print(
        "Using REAL NCERT page data"
    )

    print()

    # -----------------------------------------------------
    # DEVICE
    # -----------------------------------------------------

    device = get_device()

    print(
        f"⚙ Device: {device}"
    )

    # -----------------------------------------------------
    # LOAD PAGE
    # -----------------------------------------------------

    page = load_first_valid_page()

    print()
    print(
        "📄 NCERT page selected"
    )

    print(
        f"PDF: {page['pdf']}"
    )

    print(
        f"Page: {page['pageNumber']}"
    )

    print(
        f"Words: {len(page['tokens'])}"
    )

    # -----------------------------------------------------
    # IMAGE
    # -----------------------------------------------------

    image_path = (
        ML_SERVICE_ROOT
        / Path(
            page["imagePath"]
        )
    )

    if not image_path.exists():

        raise FileNotFoundError(
            f"Page image not found:\n{image_path}"
        )

    image = Image.open(
        image_path
    ).convert(
        "RGB"
    )

    print(
        f"Image: {image.size}"
    )

    # -----------------------------------------------------
    # LOAD PRETRAINED MODEL
    # -----------------------------------------------------

    print()
    print(
        "📥 Loading pretrained LayoutLMv3..."
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
        "✅ Model loaded"
    )

    # -----------------------------------------------------
    # PREPARE REAL PAGE INPUT
    # -----------------------------------------------------

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

    print()
    print(
        "📦 Model input prepared"
    )

    print(
        f"Input token tensor: "
        f"{tuple(encoding['input_ids'].shape)}"
    )

    print(
        f"BBox tensor: "
        f"{tuple(encoding['bbox'].shape)}"
    )

    print(
        f"Pixel tensor: "
        f"{tuple(encoding['pixel_values'].shape)}"
    )

    # -----------------------------------------------------
    # MOVE INPUT TO DEVICE
    # -----------------------------------------------------

    encoding = {
        key: value.to(
            device
        )
        for key, value
        in encoding.items()
    }

    # -----------------------------------------------------
    # ACTUAL ML INFERENCE
    # -----------------------------------------------------

    print()
    print(
        "🤖 Running NCERT page through model..."
    )

    with torch.no_grad():

        outputs = model(
            **encoding
        )

    hidden_states = (
        outputs.last_hidden_state
    )

    print(
        "✅ ML inference completed"
    )

    print(
        f"Hidden state shape: "
        f"{tuple(hidden_states.shape)}"
    )

    # -----------------------------------------------------
    # PAGE EMBEDDING
    # -----------------------------------------------------
    #
    # CLS token represents the full multimodal page.
    # -----------------------------------------------------

    page_embedding = (
        hidden_states[
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

    print()
    print(
        f"🧬 Embedding dimensions: "
        f"{page_embedding.shape[0]}"
    )

    print(
        f"Embedding norm: "
        f"{np.linalg.norm(page_embedding):.4f}"
    )

    print()
    print(
        "First 10 learned values:"
    )

    print(
        page_embedding[:10]
    )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    np.save(
        OUTPUT_EMBEDDING,
        page_embedding,
    )

    print()
    print(
        "💾 Embedding saved:"
    )

    print(
        OUTPUT_EMBEDDING
    )

    # -----------------------------------------------------
    # FINISH
    # -----------------------------------------------------

    print()
    print(
        "=" * 60
    )

    print(
        "✅ REAL NCERT → LayoutLMv3 SUCCESS"
    )

    print(
        f"📄 Source: {page['pdf']} "
        f"page {page['pageNumber']}"
    )

    print(
        f"🔤 Real words: "
        f"{len(words)}"
    )

    print(
        "📐 Real bounding boxes: YES"
    )

    print(
        "🖼 Real page image: YES"
    )

    print(
        f"🧠 Learned embedding: "
        f"{page_embedding.shape[0]} dimensions"
    )

    print(
        "=" * 60
    )


if __name__ == "__main__":
    main()