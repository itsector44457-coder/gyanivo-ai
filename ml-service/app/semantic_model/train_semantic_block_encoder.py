from __future__ import annotations

import json
import math
import random
import time
from collections import defaultdict
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.optim import AdamW
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoModel,
    AutoTokenizer,
)


# =========================================================
# CONFIG
# =========================================================

SEED = 42

MAX_LENGTH = 128

TRAIN_EPOCHS = 1

TRAIN_BATCH_SIZE = 4

EVAL_BATCH_SIZE = 4

ENCODER_LEARNING_RATE = 1e-5

PROJECTION_LEARNING_RATE = 1e-4

WEIGHT_DECAY = 0.01

TEMPERATURE = 0.07

MASK_PROBABILITY = 0.12

EVAL_RATIO = 0.10

MIN_BLOCK_WORDS = 8

MIN_BLOCK_CHARACTERS = 40

UNFREEZE_LAST_N_LAYERS = 2

PROJECTION_DIMENSION = 128


# =========================================================
# PATHS
# =========================================================

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

SOURCE_DATASET = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "layout_dataset"
    / "pages_with_images.jsonl"
)

ADAPTED_MATHBERT = (
    ML_SERVICE_ROOT
    / "models"
    / "ncert_mathbert_class7"
    / "final"
)

MODEL_ROOT = (
    ML_SERVICE_ROOT
    / "models"
    / "ncert_semantic_encoder_class7"
)

FINAL_ENCODER_ROOT = (
    MODEL_ROOT
    / "final_encoder"
)

PROJECTION_HEAD_PATH = (
    MODEL_ROOT
    / "projection_head.pt"
)

BLOCK_DATASET_PATH = (
    MODEL_ROOT
    / "semantic_blocks.jsonl"
)

SUMMARY_PATH = (
    MODEL_ROOT
    / "training_summary.json"
)


# =========================================================
# REPRODUCIBILITY
# =========================================================

def set_seed():

    random.seed(
        SEED
    )

    torch.manual_seed(
        SEED
    )

    if torch.cuda.is_available():

        torch.cuda.manual_seed_all(
            SEED
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
# LOAD REAL NCERT LAYOUT BLOCKS
# =========================================================

def load_real_ncert_blocks() -> list[dict]:

    if not SOURCE_DATASET.exists():

        raise FileNotFoundError(
            (
                "NCERT layout dataset not found:\n"
                f"{SOURCE_DATASET}"
            )
        )

    blocks: list[dict] = []

    with SOURCE_DATASET.open(
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

                page = json.loads(
                    line
                )

            except json.JSONDecodeError as error:

                raise RuntimeError(
                    (
                        f"Invalid JSON line "
                        f"{line_number}: {error}"
                    )
                )

            words = page.get(
                "words",
                []
            )

            if not words:

                continue

            # ---------------------------------------------
            # PyMuPDF gives us real block numbers.
            #
            # No educational label is being invented here.
            # ---------------------------------------------

            grouped_words = defaultdict(
                list
            )

            for word in words:

                block_number = word.get(
                    "blockNumber"
                )

                if block_number is None:

                    continue

                grouped_words[
                    int(block_number)
                ].append(
                    word
                )

            # ---------------------------------------------
            # Build block text
            # ---------------------------------------------

            for (
                block_number,
                block_words,
            ) in grouped_words.items():

                block_words = sorted(
                    block_words,
                    key=lambda item: (
                        int(
                            item.get(
                                "lineNumber",
                                0,
                            )
                        ),
                        int(
                            item.get(
                                "wordNumber",
                                0,
                            )
                        ),
                    ),
                )

                text_parts = [
                    str(
                        item.get(
                            "text",
                            ""
                        )
                    ).strip()
                    for item
                    in block_words
                ]

                text_parts = [
                    value
                    for value
                    in text_parts
                    if value
                ]

                if len(text_parts) < MIN_BLOCK_WORDS:

                    continue

                text = " ".join(
                    text_parts
                )

                text = " ".join(
                    text.split()
                )

                if (
                    len(text)
                    < MIN_BLOCK_CHARACTERS
                ):

                    continue

                # -----------------------------------------
                # Calculate real block bounding box
                # -----------------------------------------

                x0_values = []

                y0_values = []

                x1_values = []

                y1_values = []

                for item in block_words:

                    bbox = item.get(
                        "bbox",
                        {}
                    )

                    try:

                        x0_values.append(
                            float(
                                bbox["x0"]
                            )
                        )

                        y0_values.append(
                            float(
                                bbox["y0"]
                            )
                        )

                        x1_values.append(
                            float(
                                bbox["x1"]
                            )
                        )

                        y1_values.append(
                            float(
                                bbox["y1"]
                            )
                        )

                    except (
                        KeyError,
                        TypeError,
                        ValueError,
                    ):

                        pass

                if (
                    x0_values
                    and y0_values
                    and x1_values
                    and y1_values
                ):

                    block_bbox = {
                        "x0":
                            min(
                                x0_values
                            ),

                        "y0":
                            min(
                                y0_values
                            ),

                        "x1":
                            max(
                                x1_values
                            ),

                        "y1":
                            max(
                                y1_values
                            ),
                    }

                else:

                    block_bbox = None

                block_id = (
                    f"{page.get('pdf')}"
                    f"_p{page.get('pageNumber')}"
                    f"_b{block_number}"
                )

                page_id = (
                    f"{page.get('pdf')}"
                    f"_p{page.get('pageNumber')}"
                )

                blocks.append(
                    {
                        "blockId":
                            block_id,

                        "pageId":
                            page_id,

                        "pdf":
                            page.get(
                                "pdf"
                            ),

                        "part":
                            page.get(
                                "part"
                            ),

                        "pageNumber":
                            page.get(
                                "pageNumber"
                            ),

                        "blockNumber":
                            block_number,

                        "wordCount":
                            len(
                                text_parts
                            ),

                        "characterCount":
                            len(
                                text
                            ),

                        "bbox":
                            block_bbox,

                        "text":
                            text,
                    }
                )

    return blocks


# =========================================================
# SAVE REAL BLOCK DATASET
# =========================================================

def save_blocks(
    blocks: list[dict],
):

    MODEL_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    with BLOCK_DATASET_PATH.open(
        "w",
        encoding="utf-8",
    ) as file:

        for block in blocks:

            file.write(
                json.dumps(
                    block,
                    ensure_ascii=False,
                )
            )

            file.write(
                "\n"
            )


# =========================================================
# PAGE-LEVEL TRAIN / EVAL SPLIT
# =========================================================

def split_blocks_by_page(
    blocks: list[dict],
) -> tuple[
    list[dict],
    list[dict],
]:

    pages = sorted(
        {
            block["pageId"]
            for block
            in blocks
        }
    )

    rng = random.Random(
        SEED
    )

    rng.shuffle(
        pages
    )

    eval_page_count = max(
        1,
        int(
            round(
                len(pages)
                * EVAL_RATIO
            )
        ),
    )

    eval_page_ids = set(
        pages[
            :eval_page_count
        ]
    )

    train_blocks = []

    eval_blocks = []

    for block in blocks:

        if (
            block["pageId"]
            in eval_page_ids
        ):

            eval_blocks.append(
                block
            )

        else:

            train_blocks.append(
                block
            )

    return (
        train_blocks,
        eval_blocks,
    )


# =========================================================
# DATASET
# =========================================================

class SemanticBlockDataset(
    Dataset
):

    def __init__(
        self,
        blocks: list[dict],
    ):

        self.blocks = (
            blocks
        )

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

        return self.blocks[
            index
        ]


# =========================================================
# COLLATE
# =========================================================

def collate_blocks(
    batch: list[dict],
):

    return [
        item["text"]
        for item
        in batch
    ]


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
# FREEZE MOST OF BERT
# =========================================================

def configure_trainable_layers(
    encoder,
):

    # Freeze everything first.
    for parameter in (
        encoder.parameters()
    ):

        parameter.requires_grad = (
            False
        )

    # BERT model:
    #
    # encoder.encoder.layer
    #
    if not hasattr(
        encoder,
        "encoder"
    ):

        raise RuntimeError(
            (
                "Loaded model does not expose "
                "BERT encoder layers."
            )
        )

    transformer_encoder = (
        encoder.encoder
    )

    if not hasattr(
        transformer_encoder,
        "layer"
    ):

        raise RuntimeError(
            (
                "Could not find transformer "
                "layers."
            )
        )

    layers = (
        transformer_encoder.layer
    )

    total_layers = len(
        layers
    )

    if total_layers == 0:

        raise RuntimeError(
            "Model has zero encoder layers."
        )

    number_to_unfreeze = min(
        UNFREEZE_LAST_N_LAYERS,
        total_layers,
    )

    for layer in layers[
        -number_to_unfreeze:
    ]:

        for parameter in (
            layer.parameters()
        ):

            parameter.requires_grad = (
                True
            )

    print()
    print(
        f"🧠 Transformer layers: "
        f"{total_layers}"
    )

    print(
        f"🔥 Trainable final layers: "
        f"{number_to_unfreeze}"
    )


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

    summed = (
        hidden_states
        * expanded_mask
    ).sum(
        dim=1
    )

    counts = (
        expanded_mask
        .sum(
            dim=1
        )
        .clamp(
            min=1e-9
        )
    )

    return (
        summed
        / counts
    )


# =========================================================
# RANDOM SELF-SUPERVISED VIEW
# =========================================================

def create_masked_view(
    input_ids: torch.Tensor,
    attention_mask: torch.Tensor,
    tokenizer,
) -> torch.Tensor:

    augmented = (
        input_ids.clone()
    )

    special_mask = torch.zeros_like(
        augmented,
        dtype=torch.bool,
    )

    special_ids = [
        tokenizer.cls_token_id,
        tokenizer.sep_token_id,
        tokenizer.pad_token_id,
    ]

    for token_id in special_ids:

        if token_id is None:

            continue

        special_mask |= (
            augmented
            == token_id
        )

    valid_positions = (
        attention_mask.bool()
        & ~special_mask
    )

    random_values = torch.rand(
        augmented.shape,
        device=
            augmented.device,
    )

    positions_to_mask = (
        valid_positions
        & (
            random_values
            < MASK_PROBABILITY
        )
    )

    # ---------------------------------------------
    # Ensure at least one changed token per sample.
    # ---------------------------------------------

    for row in range(
        augmented.shape[0]
    ):

        if (
            positions_to_mask[
                row
            ].sum()
            == 0
        ):

            candidate_positions = (
                valid_positions[
                    row
                ]
                .nonzero(
                    as_tuple=False
                )
                .flatten()
            )

            if (
                len(
                    candidate_positions
                )
                > 0
            ):

                random_index = (
                    torch.randint(
                        low=0,
                        high=len(
                            candidate_positions
                        ),
                        size=(1,),
                        device=
                            augmented.device,
                    )
                )

                chosen_position = (
                    candidate_positions[
                        random_index
                    ]
                )

                positions_to_mask[
                    row,
                    chosen_position,
                ] = True

    mask_token_id = (
        tokenizer.mask_token_id
    )

    if mask_token_id is None:

        raise RuntimeError(
            (
                "MathBERT tokenizer "
                "does not have [MASK]."
            )
        )

    augmented[
        positions_to_mask
    ] = mask_token_id

    return augmented


# =========================================================
# ENCODE ONE VIEW
# =========================================================

def encode_view(
    encoder,
    projection_head,
    input_ids: torch.Tensor,
    attention_mask: torch.Tensor,
) -> torch.Tensor:

    outputs = encoder(
        input_ids=
            input_ids,

        attention_mask=
            attention_mask,
    )

    pooled = mean_pool(
        hidden_states=
            outputs.last_hidden_state,

        attention_mask=
            attention_mask,
    )

    projected = (
        projection_head(
            pooled
        )
    )

    normalized = F.normalize(
        projected,
        p=2,
        dim=-1,
    )

    return normalized


# =========================================================
# CONTRASTIVE LOSS
# =========================================================

def contrastive_loss(
    view_a: torch.Tensor,
    view_b: torch.Tensor,
) -> tuple[
    torch.Tensor,
    float,
]:

    # ---------------------------------------------
    # Similarity matrix:
    #
    # row i in A
    # should match
    # row i in B
    # ---------------------------------------------

    similarity = (
        view_a
        @ view_b.T
    )

    logits = (
        similarity
        / TEMPERATURE
    )

    labels = torch.arange(
        logits.shape[0],
        device=
            logits.device,
    )

    loss_a_to_b = (
        F.cross_entropy(
            logits,
            labels,
        )
    )

    loss_b_to_a = (
        F.cross_entropy(
            logits.T,
            labels,
        )
    )

    loss = (
        loss_a_to_b
        + loss_b_to_a
    ) / 2

    # ---------------------------------------------
    # Pair matching accuracy
    # ---------------------------------------------

    predictions = (
        logits.argmax(
            dim=1
        )
    )

    accuracy = float(
        (
            predictions
            == labels
        )
        .float()
        .mean()
        .item()
    )

    return (
        loss,
        accuracy,
    )


# =========================================================
# TOKENIZE TEXT BATCH
# =========================================================

def tokenize_batch(
    texts: list[str],
    tokenizer,
    device: torch.device,
):

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

    return (
        input_ids,
        attention_mask,
    )


# =========================================================
# EVALUATION
# =========================================================

def evaluate(
    encoder,
    projection_head,
    dataloader,
    tokenizer,
    device: torch.device,
) -> dict:

    encoder.eval()

    projection_head.eval()

    total_loss = 0.0

    total_accuracy = 0.0

    total_batches = 0

    with torch.inference_mode():

        for texts in dataloader:

            if len(texts) < 2:

                continue

            (
                input_ids,
                attention_mask,
            ) = tokenize_batch(
                texts=
                    texts,

                tokenizer=
                    tokenizer,

                device=
                    device,
            )

            view_a_ids = (
                create_masked_view(
                    input_ids=
                        input_ids,

                    attention_mask=
                        attention_mask,

                    tokenizer=
                        tokenizer,
                )
            )

            view_b_ids = (
                create_masked_view(
                    input_ids=
                        input_ids,

                    attention_mask=
                        attention_mask,

                    tokenizer=
                        tokenizer,
                )
            )

            embedding_a = (
                encode_view(
                    encoder=
                        encoder,

                    projection_head=
                        projection_head,

                    input_ids=
                        view_a_ids,

                    attention_mask=
                        attention_mask,
                )
            )

            embedding_b = (
                encode_view(
                    encoder=
                        encoder,

                    projection_head=
                        projection_head,

                    input_ids=
                        view_b_ids,

                    attention_mask=
                        attention_mask,
                )
            )

            (
                loss,
                accuracy,
            ) = contrastive_loss(
                view_a=
                    embedding_a,

                view_b=
                    embedding_b,
            )

            total_loss += float(
                loss.item()
            )

            total_accuracy += (
                accuracy
            )

            total_batches += 1

    if total_batches == 0:

        raise RuntimeError(
            (
                "No valid evaluation "
                "batches."
            )
        )

    return {
        "loss":
            (
                total_loss
                / total_batches
            ),

        "matchingAccuracy":
            (
                total_accuracy
                / total_batches
            ),
    }


# =========================================================
# GET TRACKED WEIGHT
# =========================================================

def get_tracked_weight(
    encoder,
):

    layers = (
        encoder
        .encoder
        .layer
    )

    last_layer = (
        layers[-1]
    )

    tracked_name = (
        "encoder.layer[-1].output.dense.weight"
    )

    tracked_parameter = (
        last_layer
        .output
        .dense
        .weight
    )

    return (
        tracked_name,
        tracked_parameter,
    )


# =========================================================
# MAIN
# =========================================================

def main():

    set_seed()

    print(
        "🧠 Gyanivo Real NCERT "
        "Semantic Block Training"
    )

    print(
        "Self-supervised Contrastive Learning"
    )

    print()

    device = get_device()

    print(
        f"⚙ Device: {device}"
    )

    # =====================================================
    # VERIFY EXISTING TRAINED MATHBERT
    # =====================================================

    if not ADAPTED_MATHBERT.exists():

        raise FileNotFoundError(
            (
                "NCERT-adapted MathBERT "
                "not found:\n"
                f"{ADAPTED_MATHBERT}"
            )
        )

    # =====================================================
    # REAL BLOCK DATASET
    # =====================================================

    print()
    print(
        "📚 Building real NCERT "
        "layout blocks..."
    )

    blocks = (
        load_real_ncert_blocks()
    )

    if len(blocks) < 100:

        raise RuntimeError(
            (
                "Too few usable NCERT "
                "blocks were found."
            )
        )

    print(
        f"✅ Real semantic blocks: "
        f"{len(blocks)}"
    )

    save_blocks(
        blocks
    )

    print(
        f"💾 Block dataset:\n"
        f"{BLOCK_DATASET_PATH}"
    )

    # =====================================================
    # PAGE-LEVEL SPLIT
    # =====================================================

    (
        train_blocks,
        eval_blocks,
    ) = split_blocks_by_page(
        blocks
    )

    print()
    print(
        "📑 PAGE-LEVEL SPLIT"
    )

    print(
        f"📘 Train blocks: "
        f"{len(train_blocks)}"
    )

    print(
        f"📗 Eval blocks: "
        f"{len(eval_blocks)}"
    )

    # =====================================================
    # TOKENIZER
    # =====================================================

    print()
    print(
        "📥 Loading NCERT tokenizer..."
    )

    tokenizer = (
        AutoTokenizer
        .from_pretrained(
            ADAPTED_MATHBERT
        )
    )

    print(
        "✅ Tokenizer loaded"
    )

    # =====================================================
    # LOAD REAL NCERT-ADAPTED ENCODER
    # =====================================================

    print()
    print(
        "📥 Loading NCERT-adapted "
        "MathBERT encoder..."
    )

    encoder = (
        AutoModel
        .from_pretrained(
            ADAPTED_MATHBERT
        )
    )

    print(
        "✅ Encoder loaded"
    )

    hidden_size = int(
        encoder.config.hidden_size
    )

    print(
        f"🧬 Hidden size: "
        f"{hidden_size}"
    )

    # =====================================================
    # CONFIGURE REAL TRAINING
    # =====================================================

    configure_trainable_layers(
        encoder
    )

    projection_head = (
        ProjectionHead(
            input_dimension=
                hidden_size,

            output_dimension=
                PROJECTION_DIMENSION,
        )
    )

    encoder.to(
        device
    )

    projection_head.to(
        device
    )

    # =====================================================
    # COUNT PARAMETERS
    # =====================================================

    total_encoder_parameters = sum(
        parameter.numel()
        for parameter
        in encoder.parameters()
    )

    trainable_encoder_parameters = sum(
        parameter.numel()
        for parameter
        in encoder.parameters()
        if parameter.requires_grad
    )

    projection_parameters = sum(
        parameter.numel()
        for parameter
        in projection_head.parameters()
    )

    print()
    print(
        f"🧠 Encoder parameters: "
        f"{total_encoder_parameters:,}"
    )

    print(
        f"🔥 Trainable encoder params: "
        f"{trainable_encoder_parameters:,}"
    )

    print(
        f"🔥 Projection params: "
        f"{projection_parameters:,}"
    )

    # =====================================================
    # TRACK REAL ENCODER WEIGHT CHANGE
    # =====================================================

    (
        tracked_name,
        tracked_parameter,
    ) = get_tracked_weight(
        encoder
    )

    track_rows = min(
        64,
        tracked_parameter.shape[0],
    )

    track_cols = min(
        64,
        tracked_parameter.shape[1],
    )

    before_training = (
        tracked_parameter[
            :track_rows,
            :track_cols
        ]
        .detach()
        .cpu()
        .clone()
    )

    print()
    print(
        "🔬 Tracking encoder weight:"
    )

    print(
        f"   {tracked_name}"
    )

    # =====================================================
    # DATA LOADERS
    # =====================================================

    train_dataset = (
        SemanticBlockDataset(
            train_blocks
        )
    )

    eval_dataset = (
        SemanticBlockDataset(
            eval_blocks
        )
    )

    train_loader = (
        DataLoader(
            train_dataset,

            batch_size=
                TRAIN_BATCH_SIZE,

            shuffle=True,

            num_workers=0,

            collate_fn=
                collate_blocks,

            drop_last=True,
        )
    )

    eval_loader = (
        DataLoader(
            eval_dataset,

            batch_size=
                EVAL_BATCH_SIZE,

            shuffle=False,

            num_workers=0,

            collate_fn=
                collate_blocks,

            drop_last=False,
        )
    )

    # =====================================================
    # OPTIMIZER
    # =====================================================

    trainable_encoder_params = [
        parameter
        for parameter
        in encoder.parameters()
        if parameter.requires_grad
    ]

    optimizer = AdamW(
        [
            {
                "params":
                    trainable_encoder_params,

                "lr":
                    ENCODER_LEARNING_RATE,
            },
            {
                "params":
                    projection_head.parameters(),

                "lr":
                    PROJECTION_LEARNING_RATE,
            },
        ],

        weight_decay=
            WEIGHT_DECAY,
    )

    # =====================================================
    # BASELINE EVALUATION BEFORE TRAINING
    # =====================================================

    print()
    print(
        "📊 Evaluating BEFORE "
        "contrastive training..."
    )

    torch.manual_seed(
        SEED + 100
    )

    before_eval = evaluate(
        encoder=
            encoder,

        projection_head=
            projection_head,

        dataloader=
            eval_loader,

        tokenizer=
            tokenizer,

        device=
            device,
    )

    print(
        f"Before loss: "
        f"{before_eval['loss']:.6f}"
    )

    print(
        f"Before matching accuracy: "
        f"{before_eval['matchingAccuracy'] * 100:.2f}%"
    )

    # =====================================================
    # ACTUAL TRAINING
    # =====================================================

    print()
    print(
        "=" * 72
    )

    print(
        "🚀 REAL SELF-SUPERVISED "
        "NCERT TRAINING STARTING"
    )

    print(
        "Real NCERT blocks: YES"
    )

    print(
        "Manual topic labels: NO"
    )

    print(
        "Manual skill labels: NO"
    )

    print(
        "Contrastive loss: YES"
    )

    print(
        "Backpropagation: YES"
    )

    print(
        "Encoder weights update: YES"
    )

    print(
        "=" * 72
    )

    start_time = (
        time.time()
    )

    training_losses = []

    training_accuracies = []

    global_step = 0

    for epoch in range(
        TRAIN_EPOCHS
    ):

        encoder.train()

        projection_head.train()

        epoch_loss = 0.0

        epoch_accuracy = 0.0

        epoch_batches = 0

        print()
        print(
            f"📘 Epoch "
            f"{epoch + 1}/"
            f"{TRAIN_EPOCHS}"
        )

        for texts in train_loader:

            if len(texts) < 2:

                continue

            (
                input_ids,
                attention_mask,
            ) = tokenize_batch(
                texts=
                    texts,

                tokenizer=
                    tokenizer,

                device=
                    device,
            )

            # ---------------------------------------------
            # TWO AUTOMATIC VIEWS
            # ---------------------------------------------

            view_a_ids = (
                create_masked_view(
                    input_ids=
                        input_ids,

                    attention_mask=
                        attention_mask,

                    tokenizer=
                        tokenizer,
                )
            )

            view_b_ids = (
                create_masked_view(
                    input_ids=
                        input_ids,

                    attention_mask=
                        attention_mask,

                    tokenizer=
                        tokenizer,
                )
            )

            # ---------------------------------------------
            # REAL FORWARD PASS
            # ---------------------------------------------

            embedding_a = (
                encode_view(
                    encoder=
                        encoder,

                    projection_head=
                        projection_head,

                    input_ids=
                        view_a_ids,

                    attention_mask=
                        attention_mask,
                )
            )

            embedding_b = (
                encode_view(
                    encoder=
                        encoder,

                    projection_head=
                        projection_head,

                    input_ids=
                        view_b_ids,

                    attention_mask=
                        attention_mask,
                )
            )

            # ---------------------------------------------
            # SELF-SUPERVISED LOSS
            # ---------------------------------------------

            (
                loss,
                accuracy,
            ) = contrastive_loss(
                view_a=
                    embedding_a,

                view_b=
                    embedding_b,
            )

            # ---------------------------------------------
            # REAL BACKPROP
            # ---------------------------------------------

            optimizer.zero_grad(
                set_to_none=True
            )

            loss.backward()

            torch.nn.utils.clip_grad_norm_(
                list(
                    trainable_encoder_params
                )
                +
                list(
                    projection_head.parameters()
                ),
                max_norm=1.0,
            )

            optimizer.step()

            global_step += 1

            epoch_loss += float(
                loss.item()
            )

            epoch_accuracy += (
                accuracy
            )

            epoch_batches += 1

            if (
                global_step == 1
                or global_step % 25 == 0
            ):

                print(
                    f"Step {global_step} "
                    f"| loss "
                    f"{loss.item():.4f} "
                    f"| match "
                    f"{accuracy * 100:.2f}%"
                )

        if epoch_batches == 0:

            raise RuntimeError(
                "No valid training batches."
            )

        average_epoch_loss = (
            epoch_loss
            / epoch_batches
        )

        average_epoch_accuracy = (
            epoch_accuracy
            / epoch_batches
        )

        training_losses.append(
            average_epoch_loss
        )

        training_accuracies.append(
            average_epoch_accuracy
        )

        print()
        print(
            f"✅ Epoch loss: "
            f"{average_epoch_loss:.6f}"
        )

        print(
            f"✅ Epoch match accuracy: "
            f"{average_epoch_accuracy * 100:.2f}%"
        )

    elapsed_seconds = (
        time.time()
        - start_time
    )

    # =====================================================
    # FINAL EVALUATION
    # =====================================================

    print()
    print(
        "📊 Evaluating AFTER "
        "contrastive training..."
    )

    # Same seed as before evaluation so the
    # comparison uses reproducible augmentations.
    torch.manual_seed(
        SEED + 100
    )

    after_eval = evaluate(
        encoder=
            encoder,

        projection_head=
            projection_head,

        dataloader=
            eval_loader,

        tokenizer=
            tokenizer,

        device=
            device,
    )

    print(
        f"After loss: "
        f"{after_eval['loss']:.6f}"
    )

    print(
        f"After matching accuracy: "
        f"{after_eval['matchingAccuracy'] * 100:.2f}%"
    )

    # =====================================================
    # VERIFY REAL WEIGHT UPDATE
    # =====================================================

    after_training = (
        tracked_parameter[
            :track_rows,
            :track_cols
        ]
        .detach()
        .cpu()
        .clone()
    )

    weight_difference = (
        after_training
        - before_training
    ).abs()

    mean_weight_change = float(
        weight_difference
        .mean()
        .item()
    )

    max_weight_change = float(
        weight_difference
        .max()
        .item()
    )

    changed_values = int(
        (
            weight_difference
            > 0
        )
        .sum()
        .item()
    )

    total_tracked_values = int(
        weight_difference
        .numel()
    )

    weights_changed = (
        changed_values > 0
    )

    # =====================================================
    # SAVE TRAINED ENCODER
    # =====================================================

    MODEL_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    FINAL_ENCODER_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    encoder.save_pretrained(
        FINAL_ENCODER_ROOT
    )

    tokenizer.save_pretrained(
        FINAL_ENCODER_ROOT
    )

    torch.save(
        {
            "state_dict":
                projection_head.state_dict(),

            "inputDimension":
                hidden_size,

            "outputDimension":
                PROJECTION_DIMENSION,
        },

        PROJECTION_HEAD_PATH,
    )

    # =====================================================
    # METRICS
    # =====================================================

    loss_improvement = (
        before_eval["loss"]
        -
        after_eval["loss"]
    )

    accuracy_improvement = (
        after_eval[
            "matchingAccuracy"
        ]
        -
        before_eval[
            "matchingAccuracy"
        ]
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    summary = {
        "trainingType":
            "SELF_SUPERVISED_CONTRASTIVE_LEARNING",

        "dataSource":
            "Official NCERT Class 7 Mathematics",

        "baseEncoder":
            str(
                ADAPTED_MATHBERT
                .relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "device":
            str(
                device
            ),

        "totalBlocks":
            len(
                blocks
            ),

        "trainBlocks":
            len(
                train_blocks
            ),

        "evalBlocks":
            len(
                eval_blocks
            ),

        "epochs":
            TRAIN_EPOCHS,

        "batchSize":
            TRAIN_BATCH_SIZE,

        "maxLength":
            MAX_LENGTH,

        "maskProbability":
            MASK_PROBABILITY,

        "temperature":
            TEMPERATURE,

        "encoderLearningRate":
            ENCODER_LEARNING_RATE,

        "projectionLearningRate":
            PROJECTION_LEARNING_RATE,

        "unfrozenEncoderLayers":
            UNFREEZE_LAST_N_LAYERS,

        "trainableEncoderParameters":
            trainable_encoder_parameters,

        "projectionParameters":
            projection_parameters,

        "beforeEvalLoss":
            before_eval[
                "loss"
            ],

        "afterEvalLoss":
            after_eval[
                "loss"
            ],

        "beforeMatchingAccuracy":
            before_eval[
                "matchingAccuracy"
            ],

        "afterMatchingAccuracy":
            after_eval[
                "matchingAccuracy"
            ],

        "lossImprovement":
            loss_improvement,

        "accuracyImprovement":
            accuracy_improvement,

        "trackedParameter":
            tracked_name,

        "trackedValues":
            total_tracked_values,

        "changedTrackedValues":
            changed_values,

        "meanWeightChange":
            mean_weight_change,

        "maxWeightChange":
            max_weight_change,

        "weightsChanged":
            weights_changed,

        "elapsedSeconds":
            round(
                elapsed_seconds,
                2,
            ),

        "finalEncoder":
            str(
                FINAL_ENCODER_ROOT
                .relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "projectionHead":
            str(
                PROJECTION_HEAD_PATH
                .relative_to(
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
    # FINAL OUTPUT
    # =====================================================

    print()
    print(
        "=" * 72
    )

    print(
        "✅ REAL NCERT SEMANTIC "
        "TRAINING COMPLETE"
    )

    print(
        "=" * 72
    )

    print(
        f"📚 Real NCERT blocks: "
        f"{len(blocks)}"
    )

    print(
        f"📘 Train blocks: "
        f"{len(train_blocks)}"
    )

    print(
        f"📗 Eval blocks: "
        f"{len(eval_blocks)}"
    )

    print()

    print(
        "BEFORE TRAINING"
    )

    print(
        f"Loss: "
        f"{before_eval['loss']:.6f}"
    )

    print(
        f"Match accuracy: "
        f"{before_eval['matchingAccuracy'] * 100:.2f}%"
    )

    print()

    print(
        "AFTER TRAINING"
    )

    print(
        f"Loss: "
        f"{after_eval['loss']:.6f}"
    )

    print(
        f"Match accuracy: "
        f"{after_eval['matchingAccuracy'] * 100:.2f}%"
    )

    print()

    print(
        "IMPROVEMENT"
    )

    print(
        f"Loss improvement: "
        f"{loss_improvement:.6f}"
    )

    print(
        f"Accuracy improvement: "
        f"{accuracy_improvement * 100:.2f} "
        f"percentage points"
    )

    print()

    print(
        "🧬 ENCODER WEIGHT CHECK"
    )

    print(
        f"Tracked: "
        f"{tracked_name}"
    )

    print(
        f"Changed values: "
        f"{changed_values}/"
        f"{total_tracked_values}"
    )

    print(
        f"Mean change: "
        f"{mean_weight_change:.12f}"
    )

    print(
        f"Max change: "
        f"{max_weight_change:.12f}"
    )

    print(
        f"Weights changed: "
        f"{weights_changed}"
    )

    print()

    print(
        f"⏱ Training time: "
        f"{elapsed_seconds / 60:.2f} minutes"
    )

    print()

    print(
        "💾 TRAINED ENCODER:"
    )

    print(
        FINAL_ENCODER_ROOT
    )

    print()

    print(
        "💾 PROJECTION HEAD:"
    )

    print(
        PROJECTION_HEAD_PATH
    )

    print()

    print(
        "📄 SUMMARY:"
    )

    print(
        SUMMARY_PATH
    )

    print(
        "=" * 72
    )

    if not weights_changed:

        raise RuntimeError(
            (
                "Training completed but "
                "encoder weights did not change."
            )
        )


if __name__ == "__main__":
    main()