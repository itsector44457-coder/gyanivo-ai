from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
from transformers import (
    AutoModel,
    AutoTokenizer,
)


# =========================================================
# CONFIG
# =========================================================

MAX_LENGTH = 128

BATCH_SIZE = 16


# =========================================================
# PATHS
# =========================================================

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

MODEL_ROOT = (
    ML_SERVICE_ROOT
    / "models"
    / "ncert_semantic_encoder_class7"
)

BLOCK_DATASET_PATH = (
    MODEL_ROOT
    / "semantic_blocks.jsonl"
)

ENCODER_PATH = (
    MODEL_ROOT
    / "final_encoder"
)

PROJECTION_HEAD_PATH = (
    MODEL_ROOT
    / "projection_head.pt"
)

OUTPUT_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "semantic_embeddings"
)

ENCODER_EMBEDDINGS_PATH = (
    OUTPUT_ROOT
    / "block_embeddings_768.npy"
)

PROJECTED_EMBEDDINGS_PATH = (
    OUTPUT_ROOT
    / "block_embeddings_128.npy"
)

METADATA_PATH = (
    OUTPUT_ROOT
    / "block_metadata.json"
)

JSONL_PATH = (
    OUTPUT_ROOT
    / "block_embedding_index.jsonl"
)

SUMMARY_PATH = (
    OUTPUT_ROOT
    / "summary.json"
)


# =========================================================
# DEVICE
# =========================================================

def get_device() -> torch.device:

    if torch.cuda.is_available():
        return torch.device(
            "cuda"
        )

    if (
        hasattr(torch, "xpu")
        and torch.xpu.is_available()
    ):
        return torch.device(
            "xpu"
        )

    return torch.device(
        "cpu"
    )


# =========================================================
# PROJECTION HEAD
# =========================================================

class ProjectionHead(
    nn.Module
):

    def __init__(
        self,
        input_dimension: int,
        output_dimension: int,
    ):

        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(
                input_dimension,
                input_dimension,
            ),

            nn.GELU(),

            nn.Linear(
                input_dimension,
                output_dimension,
            ),
        )

    def forward(
        self,
        x: torch.Tensor,
    ) -> torch.Tensor:

        return self.network(
            x
        )


# =========================================================
# LOAD REAL NCERT BLOCKS
# =========================================================

def load_blocks() -> list[dict]:

    if not BLOCK_DATASET_PATH.exists():

        raise FileNotFoundError(
            (
                "Semantic block dataset not found:\n"
                f"{BLOCK_DATASET_PATH}"
            )
        )

    blocks = []

    with BLOCK_DATASET_PATH.open(
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

                block = json.loads(
                    line
                )

            except json.JSONDecodeError as error:

                raise RuntimeError(
                    (
                        f"Invalid JSON at line "
                        f"{line_number}: "
                        f"{error}"
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

            blocks.append(
                block
            )

    return blocks


# =========================================================
# DATASET
# =========================================================

class BlockDataset(
    Dataset
):

    def __init__(
        self,
        blocks: list[dict],
    ):

        self.blocks = blocks

    def __len__(
        self,
    ):

        return len(
            self.blocks
        )

    def __getitem__(
        self,
        index: int,
    ):

        block = self.blocks[
            index
        ]

        return {
            "index":
                index,

            "text":
                block[
                    "text"
                ],
        }


# =========================================================
# COLLATE
# =========================================================

def collate_blocks(
    batch: list[dict],
):

    return {
        "indices": [
            item[
                "index"
            ]
            for item
            in batch
        ],

        "texts": [
            item[
                "text"
            ]
            for item
            in batch
        ],
    }


# =========================================================
# MEAN POOLING
# =========================================================

def mean_pool(
    hidden_states: torch.Tensor,
    attention_mask: torch.Tensor,
) -> torch.Tensor:

    expanded_mask = (
        attention_mask
        .unsqueeze(
            -1
        )
        .expand_as(
            hidden_states
        )
        .float()
    )

    weighted_sum = (
        hidden_states
        * expanded_mask
    ).sum(
        dim=1
    )

    token_count = (
        expanded_mask
        .sum(
            dim=1
        )
        .clamp(
            min=1e-9
        )
    )

    pooled = (
        weighted_sum
        / token_count
    )

    return pooled


# =========================================================
# LOAD TRAINED PROJECTION HEAD
# =========================================================

def load_projection_head(
    hidden_size: int,
    device: torch.device,
):

    if not PROJECTION_HEAD_PATH.exists():

        raise FileNotFoundError(
            (
                "Projection head not found:\n"
                f"{PROJECTION_HEAD_PATH}"
            )
        )

    checkpoint = torch.load(
        PROJECTION_HEAD_PATH,
        map_location="cpu",
    )

    input_dimension = int(
        checkpoint.get(
            "inputDimension",
            hidden_size,
        )
    )

    output_dimension = int(
        checkpoint.get(
            "outputDimension",
            128,
        )
    )

    if input_dimension != hidden_size:

        raise RuntimeError(
            (
                "Projection input dimension mismatch.\n"
                f"Encoder hidden size: {hidden_size}\n"
                f"Projection input: {input_dimension}"
            )
        )

    projection_head = (
        ProjectionHead(
            input_dimension=
                input_dimension,

            output_dimension=
                output_dimension,
        )
    )

    projection_head.load_state_dict(
        checkpoint[
            "state_dict"
        ]
    )

    projection_head.to(
        device
    )

    projection_head.eval()

    return (
        projection_head,
        output_dimension,
    )


# =========================================================
# VALIDATE MATRIX
# =========================================================

def validate_matrix(
    matrix: np.ndarray,
    expected_rows: int,
    name: str,
):

    if matrix.ndim != 2:

        raise RuntimeError(
            (
                f"{name} should be 2D, "
                f"found shape {matrix.shape}"
            )
        )

    if matrix.shape[0] != expected_rows:

        raise RuntimeError(
            (
                f"{name} row count mismatch.\n"
                f"Expected: {expected_rows}\n"
                f"Found: {matrix.shape[0]}"
            )
        )

    if not np.isfinite(
        matrix
    ).all():

        raise RuntimeError(
            (
                f"{name} contains NaN "
                "or infinite values."
            )
        )


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🧠 Gyanivo NCERT Semantic "
        "Embedding Extraction"
    )

    print(
        "Using REAL trained semantic encoder"
    )

    print()

    device = get_device()

    print(
        f"⚙ Device: {device}"
    )

    # =====================================================
    # VERIFY TRAINED MODEL
    # =====================================================

    if not ENCODER_PATH.exists():

        raise FileNotFoundError(
            (
                "Trained NCERT semantic encoder "
                "not found:\n"
                f"{ENCODER_PATH}"
            )
        )

    # =====================================================
    # LOAD REAL BLOCKS
    # =====================================================

    print()
    print(
        "📚 Loading real NCERT blocks..."
    )

    blocks = load_blocks()

    if not blocks:

        raise RuntimeError(
            "No semantic blocks found."
        )

    print(
        f"✅ Blocks: {len(blocks)}"
    )

    # =====================================================
    # LOAD TOKENIZER
    # =====================================================

    print()
    print(
        "📥 Loading tokenizer..."
    )

    tokenizer = (
        AutoTokenizer
        .from_pretrained(
            ENCODER_PATH
        )
    )

    print(
        "✅ Tokenizer loaded"
    )

    # =====================================================
    # LOAD OUR TRAINED ENCODER
    # =====================================================

    print()
    print(
        "📥 Loading trained NCERT "
        "semantic encoder..."
    )

    encoder = (
        AutoModel
        .from_pretrained(
            ENCODER_PATH
        )
    )

    encoder.to(
        device
    )

    encoder.eval()

    hidden_size = int(
        encoder.config.hidden_size
    )

    print(
        "✅ Encoder loaded"
    )

    print(
        f"🧬 Encoder dimension: "
        f"{hidden_size}"
    )

    # =====================================================
    # LOAD OUR TRAINED PROJECTION HEAD
    # =====================================================

    print()
    print(
        "📥 Loading trained "
        "projection head..."
    )

    (
        projection_head,
        projection_dimension,
    ) = load_projection_head(
        hidden_size=
            hidden_size,

        device=
            device,
    )

    print(
        "✅ Projection head loaded"
    )

    print(
        f"🧬 Projection dimension: "
        f"{projection_dimension}"
    )

    # =====================================================
    # DATA LOADER
    # =====================================================

    dataset = BlockDataset(
        blocks
    )

    dataloader = DataLoader(
        dataset,

        batch_size=
            BATCH_SIZE,

        shuffle=False,

        num_workers=0,

        collate_fn=
            collate_blocks,

        drop_last=False,
    )

    # =====================================================
    # EXTRACT REAL LEARNED REPRESENTATIONS
    # =====================================================

    encoder_vectors = []

    projected_vectors = []

    ordered_indices = []

    start_time = time.time()

    print()
    print(
        "=" * 65
    )

    print(
        "🚀 EXTRACTING LEARNED "
        "SEMANTIC REPRESENTATIONS"
    )

    print(
        "=" * 65
    )

    total_batches = len(
        dataloader
    )

    with torch.inference_mode():

        for batch_number, batch in enumerate(
            dataloader,
            start=1,
        ):

            texts = batch[
                "texts"
            ]

            indices = batch[
                "indices"
            ]

            encoded = tokenizer(
                texts,

                padding=True,

                truncation=True,

                max_length=
                    MAX_LENGTH,

                return_tensors=
                    "pt",
            )

            input_ids = (
                encoded[
                    "input_ids"
                ]
                .to(
                    device
                )
            )

            attention_mask = (
                encoded[
                    "attention_mask"
                ]
                .to(
                    device
                )
            )

            outputs = encoder(
                input_ids=
                    input_ids,

                attention_mask=
                    attention_mask,
            )

            # =============================================
            # 768-D semantic representation
            # =============================================

            pooled = mean_pool(
                hidden_states=
                    outputs
                    .last_hidden_state,

                attention_mask=
                    attention_mask,
            )

            # Normalize encoder vector
            normalized_encoder = (
                F.normalize(
                    pooled,
                    p=2,
                    dim=-1,
                )
            )

            # =============================================
            # 128-D contrastively-trained space
            # =============================================

            projected = (
                projection_head(
                    pooled
                )
            )

            normalized_projected = (
                F.normalize(
                    projected,
                    p=2,
                    dim=-1,
                )
            )

            encoder_vectors.append(
                normalized_encoder
                .cpu()
                .numpy()
                .astype(
                    np.float32
                )
            )

            projected_vectors.append(
                normalized_projected
                .cpu()
                .numpy()
                .astype(
                    np.float32
                )
            )

            ordered_indices.extend(
                indices
            )

            if (
                batch_number == 1
                or batch_number % 25 == 0
                or batch_number == total_batches
            ):

                processed = min(
                    batch_number
                    * BATCH_SIZE,
                    len(blocks),
                )

                elapsed = (
                    time.time()
                    - start_time
                )

                print(
                    f"✅ {processed}/"
                    f"{len(blocks)} blocks "
                    f"| {elapsed / 60:.2f} min"
                )

    # =====================================================
    # STACK
    # =====================================================

    encoder_matrix = np.concatenate(
        encoder_vectors,
        axis=0,
    )

    projected_matrix = np.concatenate(
        projected_vectors,
        axis=0,
    )

    # =====================================================
    # ORDER CHECK
    # =====================================================

    expected_indices = list(
        range(
            len(blocks)
        )
    )

    if ordered_indices != expected_indices:

        raise RuntimeError(
            (
                "Embedding/block ordering "
                "validation failed."
            )
        )

    # =====================================================
    # VALIDATE
    # =====================================================

    validate_matrix(
        matrix=
            encoder_matrix,

        expected_rows=
            len(blocks),

        name=
            "Encoder embeddings",
    )

    validate_matrix(
        matrix=
            projected_matrix,

        expected_rows=
            len(blocks),

        name=
            "Projected embeddings",
    )

    print()
    print(
        "🧬 Embedding matrices ready"
    )

    print(
        f"Encoder shape: "
        f"{encoder_matrix.shape}"
    )

    print(
        f"Projected shape: "
        f"{projected_matrix.shape}"
    )

    # =====================================================
    # NORM CHECK
    # =====================================================

    encoder_norms = np.linalg.norm(
        encoder_matrix,
        axis=1,
    )

    projected_norms = np.linalg.norm(
        projected_matrix,
        axis=1,
    )

    print()
    print(
        f"Encoder average norm: "
        f"{encoder_norms.mean():.6f}"
    )

    print(
        f"Projected average norm: "
        f"{projected_norms.mean():.6f}"
    )

    # =====================================================
    # SAVE
    # =====================================================

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    np.save(
        ENCODER_EMBEDDINGS_PATH,
        encoder_matrix,
    )

    np.save(
        PROJECTED_EMBEDDINGS_PATH,
        projected_matrix,
    )

    # =====================================================
    # METADATA
    # =====================================================

    metadata = []

    with JSONL_PATH.open(
        "w",
        encoding="utf-8",
    ) as jsonl_file:

        for index, block in enumerate(
            blocks
        ):

            item = {
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

                "characterCount":
                    block.get(
                        "characterCount"
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

            metadata.append(
                item
            )

            jsonl_file.write(
                json.dumps(
                    item,
                    ensure_ascii=False,
                )
            )

            jsonl_file.write(
                "\n"
            )

    METADATA_PATH.write_text(
        json.dumps(
            metadata,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    elapsed_seconds = (
        time.time()
        - start_time
    )

    summary = {
        "dataSource":
            "Official NCERT Class 7 Mathematics",

        "representationSource":
            "Real trained NCERT semantic encoder",

        "blockCount":
            len(
                blocks
            ),

        "encoderDimension":
            int(
                encoder_matrix.shape[1]
            ),

        "projectedDimension":
            int(
                projected_matrix.shape[1]
            ),

        "encoderMatrixShape": [
            int(value)
            for value
            in encoder_matrix.shape
        ],

        "projectedMatrixShape": [
            int(value)
            for value
            in projected_matrix.shape
        ],

        "encoderVectorsNormalized":
            True,

        "projectedVectorsNormalized":
            True,

        "encoderAverageNorm":
            float(
                encoder_norms.mean()
            ),

        "projectedAverageNorm":
            float(
                projected_norms.mean()
            ),

        "device":
            str(
                device
            ),

        "elapsedSeconds":
            round(
                elapsed_seconds,
                2,
            ),

        "trainedEncoderPath":
            str(
                ENCODER_PATH.relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "encoderEmbeddingsPath":
            str(
                ENCODER_EMBEDDINGS_PATH
                .relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "projectedEmbeddingsPath":
            str(
                PROJECTED_EMBEDDINGS_PATH
                .relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "metadataPath":
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
    # SAMPLE SIMILARITY CHECK
    # =====================================================

    print()
    print(
        "🔬 Quick learned-space check"
    )

    if len(
        projected_matrix
    ) >= 2:

        first_vector = (
            projected_matrix[
                0
            ]
        )

        similarities = (
            projected_matrix
            @ first_vector
        )

        # Don't match itself.
        similarities[
            0
        ] = -999.0

        nearest_index = int(
            np.argmax(
                similarities
            )
        )

        similarity_score = float(
            similarities[
                nearest_index
            ]
        )

        print()
        print(
            "Block A:"
        )

        print(
            blocks[
                0
            ]["text"][:250]
        )

        print()
        print(
            "Nearest learned neighbour:"
        )

        print(
            blocks[
                nearest_index
            ]["text"][:250]
        )

        print()
        print(
            f"Cosine similarity: "
            f"{similarity_score:.4f}"
        )

    # =====================================================
    # FINAL
    # =====================================================

    print()
    print(
        "=" * 70
    )

    print(
        "✅ NCERT SEMANTIC EMBEDDINGS READY"
    )

    print(
        "=" * 70
    )

    print(
        f"📚 Real blocks: "
        f"{len(blocks)}"
    )

    print(
        f"🧠 Encoder matrix: "
        f"{encoder_matrix.shape}"
    )

    print(
        f"🎯 Contrastive matrix: "
        f"{projected_matrix.shape}"
    )

    print(
        f"⏱ Time: "
        f"{elapsed_seconds / 60:.2f} minutes"
    )

    print()

    print(
        "💾 768-D embeddings:"
    )

    print(
        ENCODER_EMBEDDINGS_PATH
    )

    print()

    print(
        "💾 128-D trained semantic embeddings:"
    )

    print(
        PROJECTED_EMBEDDINGS_PATH
    )

    print()

    print(
        "💾 Metadata:"
    )

    print(
        METADATA_PATH
    )

    print(
        "=" * 70
    )


if __name__ == "__main__":
    main()