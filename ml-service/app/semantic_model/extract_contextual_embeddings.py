from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModel, AutoTokenizer


# =========================================================
# CONFIG
# =========================================================

MAX_LENGTH = 128
BATCH_SIZE = 16


# =========================================================
# PATHS
# =========================================================

ROOT = Path(__file__).resolve().parents[2]

BLOCK_DATASET = (
    ROOT
    / "models"
    / "ncert_semantic_encoder_class7"
    / "semantic_blocks.jsonl"
)

MODEL_ROOT = (
    ROOT
    / "models"
    / "ncert_contextual_encoder_class7"
)

ENCODER_PATH = (
    MODEL_ROOT
    / "final_encoder"
)

PROJECTION_PATH = (
    MODEL_ROOT
    / "projection_head.pt"
)

OUTPUT_ROOT = (
    ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "contextual_embeddings"
)

ENCODER_OUTPUT = (
    OUTPUT_ROOT
    / "block_embeddings_768.npy"
)

PROJECTED_OUTPUT = (
    OUTPUT_ROOT
    / "block_embeddings_128.npy"
)

METADATA_OUTPUT = (
    OUTPUT_ROOT
    / "block_metadata.json"
)

SUMMARY_OUTPUT = (
    OUTPUT_ROOT
    / "summary.json"
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
# PROJECTION HEAD
# =========================================================

class ProjectionHead(nn.Module):

    def __init__(
        self,
        input_dim: int,
        output_dim: int,
    ):

        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(
                input_dim,
                input_dim,
            ),

            nn.GELU(),

            nn.Linear(
                input_dim,
                output_dim,
            ),
        )

    def forward(
        self,
        x: torch.Tensor,
    ) -> torch.Tensor:

        return self.network(x)


# =========================================================
# LOAD BLOCKS
# =========================================================

def load_blocks() -> list[dict]:

    if not BLOCK_DATASET.exists():

        raise FileNotFoundError(
            f"Block dataset missing:\n{BLOCK_DATASET}"
        )

    blocks = []

    with BLOCK_DATASET.open(
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
                block = json.loads(line)

            except json.JSONDecodeError as error:

                raise RuntimeError(
                    (
                        f"Invalid JSON at line "
                        f"{line_number}: {error}"
                    )
                )

            text = str(
                block.get(
                    "text",
                    ""
                )
            ).strip()

            if not text:
                continue

            blocks.append(block)

    return blocks


# =========================================================
# DATASET
# =========================================================

class BlockDataset(Dataset):

    def __init__(
        self,
        blocks: list[dict],
    ):

        self.blocks = blocks

    def __len__(self):

        return len(self.blocks)

    def __getitem__(
        self,
        index: int,
    ):

        return {
            "index": index,
            "text": self.blocks[index]["text"],
        }


def collate_blocks(
    batch: list[dict],
):

    return {
        "indices": [
            item["index"]
            for item in batch
        ],

        "texts": [
            item["text"]
            for item in batch
        ],
    }


# =========================================================
# MEAN POOLING
# =========================================================

def mean_pool(
    hidden_states: torch.Tensor,
    attention_mask: torch.Tensor,
) -> torch.Tensor:

    mask = (
        attention_mask
        .unsqueeze(-1)
        .expand_as(hidden_states)
        .float()
    )

    summed = (
        hidden_states
        * mask
    ).sum(
        dim=1
    )

    count = (
        mask
        .sum(
            dim=1
        )
        .clamp(
            min=1e-9
        )
    )

    return summed / count


# =========================================================
# LOAD PROJECTION
# =========================================================

def load_projection(
    hidden_size: int,
    device: torch.device,
):

    if not PROJECTION_PATH.exists():

        raise FileNotFoundError(
            (
                "Contextual projection "
                f"head missing:\n{PROJECTION_PATH}"
            )
        )

    checkpoint = torch.load(
        PROJECTION_PATH,
        map_location="cpu",
    )

    input_dim = int(
        checkpoint.get(
            "inputDimension",
            hidden_size,
        )
    )

    output_dim = int(
        checkpoint.get(
            "outputDimension",
            128,
        )
    )

    if input_dim != hidden_size:

        raise RuntimeError(
            (
                "Projection input mismatch.\n"
                f"Encoder: {hidden_size}\n"
                f"Projection: {input_dim}"
            )
        )

    projection = ProjectionHead(
        input_dim=input_dim,
        output_dim=output_dim,
    )

    projection.load_state_dict(
        checkpoint["state_dict"]
    )

    projection.to(device)
    projection.eval()

    return (
        projection,
        output_dim,
    )


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🧠 Gyanivo Contextual NCERT "
        "Embedding Extraction"
    )

    device = get_device()

    print()
    print(
        f"⚙ Device: {device}"
    )

    # =====================================================
    # LOAD BLOCKS
    # =====================================================

    blocks = load_blocks()

    print()
    print(
        f"📚 Real NCERT blocks: {len(blocks)}"
    )

    # =====================================================
    # LOAD MODEL
    # =====================================================

    print()
    print(
        "📥 Loading contextual encoder..."
    )

    tokenizer = (
        AutoTokenizer
        .from_pretrained(
            ENCODER_PATH
        )
    )

    encoder = (
        AutoModel
        .from_pretrained(
            ENCODER_PATH
        )
    )

    encoder.to(device)
    encoder.eval()

    hidden_size = int(
        encoder.config.hidden_size
    )

    print(
        f"✅ Encoder loaded: {hidden_size}-D"
    )

    # =====================================================
    # PROJECTION
    # =====================================================

    (
        projection,
        projection_dim,
    ) = load_projection(
        hidden_size,
        device,
    )

    print(
        f"✅ Projection loaded: "
        f"{projection_dim}-D"
    )

    # =====================================================
    # LOADER
    # =====================================================

    dataset = BlockDataset(
        blocks
    )

    loader = DataLoader(
        dataset,

        batch_size=BATCH_SIZE,

        shuffle=False,

        num_workers=0,

        collate_fn=
            collate_blocks,
    )

    encoder_vectors = []

    projected_vectors = []

    ordered_indices = []

    start_time = time.time()

    print()
    print(
        "🚀 Extracting new contextual embeddings..."
    )

    # =====================================================
    # INFERENCE
    # =====================================================

    with torch.inference_mode():

        for batch_number, batch in enumerate(
            loader,
            start=1,
        ):

            encoded = tokenizer(
                batch["texts"],

                padding=True,

                truncation=True,

                max_length=
                    MAX_LENGTH,

                return_tensors="pt",
            )

            input_ids = (
                encoded[
                    "input_ids"
                ]
                .to(device)
            )

            attention_mask = (
                encoded[
                    "attention_mask"
                ]
                .to(device)
            )

            outputs = encoder(
                input_ids=
                    input_ids,

                attention_mask=
                    attention_mask,
            )

            pooled = mean_pool(
                outputs.last_hidden_state,
                attention_mask,
            )

            encoder_embedding = (
                F.normalize(
                    pooled,
                    p=2,
                    dim=-1,
                )
            )

            projected = projection(
                pooled
            )

            projected_embedding = (
                F.normalize(
                    projected,
                    p=2,
                    dim=-1,
                )
            )

            encoder_vectors.append(
                encoder_embedding
                .cpu()
                .numpy()
                .astype(
                    np.float32
                )
            )

            projected_vectors.append(
                projected_embedding
                .cpu()
                .numpy()
                .astype(
                    np.float32
                )
            )

            ordered_indices.extend(
                batch["indices"]
            )

            if (
                batch_number == 1
                or batch_number % 25 == 0
                or batch_number == len(loader)
            ):

                processed = min(
                    batch_number
                    * BATCH_SIZE,
                    len(blocks),
                )

                print(
                    f"✅ {processed}/"
                    f"{len(blocks)}"
                )

    # =====================================================
    # MATRICES
    # =====================================================

    encoder_matrix = (
        np.concatenate(
            encoder_vectors,
            axis=0,
        )
    )

    projected_matrix = (
        np.concatenate(
            projected_vectors,
            axis=0,
        )
    )

    expected_indices = list(
        range(
            len(blocks)
        )
    )

    if (
        ordered_indices
        != expected_indices
    ):

        raise RuntimeError(
            "Embedding ordering mismatch."
        )

    if not np.isfinite(
        encoder_matrix
    ).all():

        raise RuntimeError(
            "Encoder matrix has NaN/Inf."
        )

    if not np.isfinite(
        projected_matrix
    ).all():

        raise RuntimeError(
            "Projected matrix has NaN/Inf."
        )

    # =====================================================
    # SAVE
    # =====================================================

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    np.save(
        ENCODER_OUTPUT,
        encoder_matrix,
    )

    np.save(
        PROJECTED_OUTPUT,
        projected_matrix,
    )

    metadata = []

    for index, block in enumerate(
        blocks
    ):

        metadata.append(
            {
                "embeddingIndex":
                    index,

                "blockId":
                    block.get(
                        "blockId"
                    ),

                "pageId":
                    block.get(
                        "pageId"
                    ),

                "pdf":
                    block.get(
                        "pdf"
                    ),

                "part":
                    block.get(
                        "part"
                    ),

                "pageNumber":
                    block.get(
                        "pageNumber"
                    ),

                "blockNumber":
                    block.get(
                        "blockNumber"
                    ),

                "wordCount":
                    block.get(
                        "wordCount"
                    ),

                "bbox":
                    block.get(
                        "bbox"
                    ),

                "text":
                    block.get(
                        "text"
                    ),
            }
        )

    METADATA_OUTPUT.write_text(
        json.dumps(
            metadata,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # QUICK SIMILARITY CHECK
    # =====================================================

    first_vector = (
        projected_matrix[0]
    )

    similarities = (
        projected_matrix
        @ first_vector
    )

    similarities[0] = -999

    nearest_index = int(
        np.argmax(
            similarities
        )
    )

    nearest_similarity = float(
        similarities[
            nearest_index
        ]
    )

    elapsed = (
        time.time()
        - start_time
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    summary = {
        "source":
            "Official NCERT Class 7 Mathematics",

        "model":
            "NCERT contextual semantic encoder",

        "blocks":
            len(blocks),

        "encoderShape": [
            int(value)
            for value
            in encoder_matrix.shape
        ],

        "projectedShape": [
            int(value)
            for value
            in projected_matrix.shape
        ],

        "device":
            str(device),

        "elapsedSeconds":
            round(
                elapsed,
                2,
            ),

        "nearestNeighbourExample":
            {
                "sourceText":
                    blocks[0][
                        "text"
                    ],

                "nearestText":
                    blocks[
                        nearest_index
                    ][
                        "text"
                    ],

                "cosineSimilarity":
                    nearest_similarity,
            },
    }

    SUMMARY_OUTPUT.write_text(
        json.dumps(
            summary,
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
        "=" * 70
    )

    print(
        "✅ CONTEXTUAL EMBEDDINGS READY"
    )

    print(
        "=" * 70
    )

    print(
        f"📚 Blocks: "
        f"{len(blocks)}"
    )

    print(
        f"🧠 Encoder matrix: "
        f"{encoder_matrix.shape}"
    )

    print(
        f"🎯 Projected matrix: "
        f"{projected_matrix.shape}"
    )

    print(
        f"⏱ Time: "
        f"{elapsed / 60:.2f} minutes"
    )

    print()
    print(
        "🔬 QUICK NEIGHBOUR CHECK"
    )

    print()
    print(
        "Original:"
    )

    print(
        blocks[0]["text"][:300]
    )

    print()
    print(
        "Nearest:"
    )

    print(
        blocks[
            nearest_index
        ]["text"][:300]
    )

    print()
    print(
        f"Cosine similarity: "
        f"{nearest_similarity:.4f}"
    )

    print()
    print(
        "💾 768-D:"
    )

    print(
        ENCODER_OUTPUT
    )

    print()
    print(
        "💾 128-D:"
    )

    print(
        PROJECTED_OUTPUT
    )

    print(
        "=" * 70
    )


if __name__ == "__main__":
    main()