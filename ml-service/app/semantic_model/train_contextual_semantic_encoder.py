from __future__ import annotations

import json
import random
import time
from collections import defaultdict
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.optim import AdamW
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModel, AutoTokenizer


# =========================================================
# CONFIG
# =========================================================

SEED = 42

MAX_LENGTH = 128

EPOCHS = 1

BATCH_SIZE = 6

ENCODER_LR = 8e-6

PROJECTION_LR = 1e-4

WEIGHT_DECAY = 0.01

TEMPERATURE = 0.07

PROJECTION_DIM = 128

UNFREEZE_LAST_N_LAYERS = 3

EVAL_RATIO = 0.10


# =========================================================
# PATHS
# =========================================================

ROOT = Path(__file__).resolve().parents[2]

PREVIOUS_ENCODER = (
    ROOT
    / "models"
    / "ncert_semantic_encoder_class7"
    / "final_encoder"
)

BLOCK_DATASET = (
    ROOT
    / "models"
    / "ncert_semantic_encoder_class7"
    / "semantic_blocks.jsonl"
)

OUTPUT_ROOT = (
    ROOT
    / "models"
    / "ncert_contextual_encoder_class7"
)

FINAL_ENCODER = (
    OUTPUT_ROOT
    / "final_encoder"
)

PROJECTION_PATH = (
    OUTPUT_ROOT
    / "projection_head.pt"
)

PAIR_DATASET_PATH = (
    OUTPUT_ROOT
    / "automatic_positive_pairs.jsonl"
)

SUMMARY_PATH = (
    OUTPUT_ROOT
    / "training_summary.json"
)


# =========================================================
# SEED
# =========================================================

def set_seed():

    random.seed(SEED)
    torch.manual_seed(SEED)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(SEED)


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
                    f"Invalid JSON line {line_number}: {error}"
                )

            text = str(
                block.get(
                    "text",
                    ""
                )
            ).strip()

            if len(text) < 30:
                continue

            blocks.append(block)

    return blocks


# =========================================================
# AUTOMATIC POSITIVE PAIRS
# =========================================================

def build_positive_pairs(
    blocks: list[dict],
) -> list[dict]:

    """
    No concept labels.

    Positive relationships come automatically from
    real textbook structure:

    consecutive blocks on the same page are treated
    as contextual neighbors.
    """

    page_groups = defaultdict(list)

    for block in blocks:

        key = (
            block.get("pdf"),
            int(
                block.get(
                    "pageNumber",
                    0
                )
            ),
        )

        page_groups[key].append(block)

    pairs = []

    for (
        pdf,
        page_number,
    ), page_blocks in page_groups.items():

        page_blocks = sorted(
            page_blocks,
            key=lambda item:
                int(
                    item.get(
                        "blockNumber",
                        0
                    )
                ),
        )

        if len(page_blocks) < 2:
            continue

        for index in range(
            len(page_blocks) - 1
        ):

            anchor = page_blocks[
                index
            ]

            positive = page_blocks[
                index + 1
            ]

            anchor_text = str(
                anchor["text"]
            ).strip()

            positive_text = str(
                positive["text"]
            ).strip()

            if (
                len(anchor_text) < 30
                or len(positive_text) < 30
            ):
                continue

            pairs.append(
                {
                    "pairId":
                        (
                            f"{pdf}"
                            f"_p{page_number}"
                            f"_b{anchor.get('blockNumber')}"
                            f"_b{positive.get('blockNumber')}"
                        ),

                    "pdf":
                        pdf,

                    "pageNumber":
                        page_number,

                    "anchorBlockId":
                        anchor.get(
                            "blockId"
                        ),

                    "positiveBlockId":
                        positive.get(
                            "blockId"
                        ),

                    "anchorText":
                        anchor_text,

                    "positiveText":
                        positive_text,

                    "signal":
                        "ADJACENT_REAL_NCERT_BLOCKS",
                }
            )

    return pairs


# =========================================================
# SAVE PAIRS
# =========================================================

def save_pairs(
    pairs: list[dict],
):

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    with PAIR_DATASET_PATH.open(
        "w",
        encoding="utf-8",
    ) as file:

        for pair in pairs:

            file.write(
                json.dumps(
                    pair,
                    ensure_ascii=False,
                )
            )

            file.write("\n")


# =========================================================
# SPLIT BY PAGE
# =========================================================

def split_pairs(
    pairs: list[dict],
) -> tuple[
    list[dict],
    list[dict],
]:

    pages = sorted(
        {
            (
                pair["pdf"],
                pair["pageNumber"],
            )
            for pair in pairs
        }
    )

    rng = random.Random(
        SEED
    )

    rng.shuffle(
        pages
    )

    eval_count = max(
        1,
        round(
            len(pages)
            * EVAL_RATIO
        ),
    )

    eval_pages = set(
        pages[
            :eval_count
        ]
    )

    train_pairs = []

    eval_pairs = []

    for pair in pairs:

        key = (
            pair["pdf"],
            pair["pageNumber"],
        )

        if key in eval_pages:
            eval_pairs.append(pair)

        else:
            train_pairs.append(pair)

    return (
        train_pairs,
        eval_pairs,
    )


# =========================================================
# DATASET
# =========================================================

class PairDataset(
    Dataset
):

    def __init__(
        self,
        pairs: list[dict],
    ):

        self.pairs = pairs

    def __len__(self):

        return len(
            self.pairs
        )

    def __getitem__(
        self,
        index: int,
    ):

        item = self.pairs[
            index
        ]

        return {
            "anchor":
                item[
                    "anchorText"
                ],

            "positive":
                item[
                    "positiveText"
                ],
        }


# =========================================================
# COLLATE
# =========================================================

def collate_pairs(
    batch: list[dict],
):

    return {
        "anchors": [
            item[
                "anchor"
            ]
            for item in batch
        ],

        "positives": [
            item[
                "positive"
            ]
            for item in batch
        ],
    }


# =========================================================
# PROJECTION HEAD
# =========================================================

class ProjectionHead(
    nn.Module
):

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
# MEAN POOL
# =========================================================

def mean_pool(
    hidden_states: torch.Tensor,
    attention_mask: torch.Tensor,
):

    mask = (
        attention_mask
        .unsqueeze(-1)
        .expand_as(
            hidden_states
        )
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

    return (
        summed
        / count
    )


# =========================================================
# TOKENIZE
# =========================================================

def tokenize(
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

    return {
        key:
            value.to(
                device
            )
        for key, value
        in encoded.items()
    }


# =========================================================
# ENCODE
# =========================================================

def encode(
    texts: list[str],
    encoder,
    projection,
    tokenizer,
    device,
):

    batch = tokenize(
        texts=
            texts,

        tokenizer=
            tokenizer,

        device=
            device,
    )

    outputs = encoder(
        input_ids=
            batch[
                "input_ids"
            ],

        attention_mask=
            batch[
                "attention_mask"
            ],
    )

    pooled = mean_pool(
        hidden_states=
            outputs
            .last_hidden_state,

        attention_mask=
            batch[
                "attention_mask"
            ],
    )

    projected = projection(
        pooled
    )

    return F.normalize(
        projected,
        p=2,
        dim=-1,
    )


# =========================================================
# CONTRASTIVE LOSS
# =========================================================

def contextual_loss(
    anchors: torch.Tensor,
    positives: torch.Tensor,
):

    """
    Anchor i should match positive i.

    Every other positive in the batch acts as
    an automatically-created negative.
    """

    similarity = (
        anchors
        @ positives.T
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

    loss_forward = (
        F.cross_entropy(
            logits,
            labels,
        )
    )

    loss_reverse = (
        F.cross_entropy(
            logits.T,
            labels,
        )
    )

    loss = (
        loss_forward
        + loss_reverse
    ) / 2

    predictions = (
        logits.argmax(
            dim=1
        )
    )

    accuracy = (
        (
            predictions
            == labels
        )
        .float()
        .mean()
        .item()
    )

    positive_similarity = (
        (
            anchors
            * positives
        )
        .sum(
            dim=-1
        )
        .mean()
        .item()
    )

    return (
        loss,
        accuracy,
        positive_similarity,
    )


# =========================================================
# CONFIGURE TRAINABLE LAYERS
# =========================================================

def configure_encoder(
    encoder,
):

    for parameter in (
        encoder.parameters()
    ):
        parameter.requires_grad = False

    layers = (
        encoder
        .encoder
        .layer
    )

    count = min(
        UNFREEZE_LAST_N_LAYERS,
        len(layers),
    )

    for layer in layers[
        -count:
    ]:

        for parameter in (
            layer.parameters()
        ):

            parameter.requires_grad = True

    print(
        f"🧠 Total transformer layers: "
        f"{len(layers)}"
    )

    print(
        f"🔥 Trainable final layers: "
        f"{count}"
    )


# =========================================================
# TRACK WEIGHT
# =========================================================

def get_tracked_parameter(
    encoder,
):

    parameter = (
        encoder
        .encoder
        .layer[-1]
        .output
        .dense
        .weight
    )

    return (
        "encoder.layer[-1].output.dense.weight",
        parameter,
    )


# =========================================================
# EVALUATE
# =========================================================

def evaluate(
    encoder,
    projection,
    loader,
    tokenizer,
    device,
):

    encoder.eval()
    projection.eval()

    total_loss = 0.0
    total_accuracy = 0.0
    total_similarity = 0.0

    batches = 0

    with torch.inference_mode():

        for batch in loader:

            anchors = batch[
                "anchors"
            ]

            positives = batch[
                "positives"
            ]

            if len(anchors) < 2:
                continue

            anchor_vectors = encode(
                texts=
                    anchors,

                encoder=
                    encoder,

                projection=
                    projection,

                tokenizer=
                    tokenizer,

                device=
                    device,
            )

            positive_vectors = encode(
                texts=
                    positives,

                encoder=
                    encoder,

                projection=
                    projection,

                tokenizer=
                    tokenizer,

                device=
                    device,
            )

            (
                loss,
                accuracy,
                similarity,
            ) = contextual_loss(
                anchor_vectors,
                positive_vectors,
            )

            total_loss += float(
                loss.item()
            )

            total_accuracy += (
                accuracy
            )

            total_similarity += (
                similarity
            )

            batches += 1

    if batches == 0:

        raise RuntimeError(
            "No evaluation batches."
        )

    return {
        "loss":
            total_loss
            / batches,

        "retrievalAccuracy":
            total_accuracy
            / batches,

        "positiveCosineSimilarity":
            total_similarity
            / batches,
    }


# =========================================================
# MAIN
# =========================================================

def main():

    set_seed()

    print(
        "🧠 Gyanivo Context-Aware "
        "NCERT Semantic Training"
    )

    print(
        "REAL self-supervised "
        "contextual contrastive learning"
    )

    device = get_device()

    print()
    print(
        f"⚙ Device: {device}"
    )

    # =====================================================
    # VERIFY
    # =====================================================

    if not PREVIOUS_ENCODER.exists():

        raise FileNotFoundError(
            (
                "Previous NCERT encoder "
                "not found:\n"
                f"{PREVIOUS_ENCODER}"
            )
        )

    # =====================================================
    # LOAD REAL DATA
    # =====================================================

    print()
    print(
        "📚 Loading real NCERT blocks..."
    )

    blocks = load_blocks()

    print(
        f"✅ Blocks: {len(blocks)}"
    )

    # =====================================================
    # AUTOMATIC PAIRS
    # =====================================================

    print()
    print(
        "🔗 Building automatic "
        "contextual positive pairs..."
    )

    pairs = build_positive_pairs(
        blocks
    )

    if len(pairs) < 100:

        raise RuntimeError(
            "Too few contextual pairs."
        )

    print(
        f"✅ Real contextual pairs: "
        f"{len(pairs)}"
    )

    save_pairs(
        pairs
    )

    (
        train_pairs,
        eval_pairs,
    ) = split_pairs(
        pairs
    )

    print()
    print(
        "📑 PAGE-LEVEL SPLIT"
    )

    print(
        f"📘 Train pairs: "
        f"{len(train_pairs)}"
    )

    print(
        f"📗 Eval pairs: "
        f"{len(eval_pairs)}"
    )

    # =====================================================
    # MODEL
    # =====================================================

    print()
    print(
        "📥 Loading trained "
        "NCERT semantic encoder..."
    )

    tokenizer = (
        AutoTokenizer
        .from_pretrained(
            PREVIOUS_ENCODER
        )
    )

    encoder = (
        AutoModel
        .from_pretrained(
            PREVIOUS_ENCODER
        )
    )

    encoder.to(
        device
    )

    hidden_size = int(
        encoder.config.hidden_size
    )

    print(
        f"✅ Encoder loaded: "
        f"{hidden_size}-D"
    )

    # =====================================================
    # TRAINABLE LAYERS
    # =====================================================

    configure_encoder(
        encoder
    )

    projection = ProjectionHead(
        input_dim=
            hidden_size,

        output_dim=
            PROJECTION_DIM,
    )

    projection.to(
        device
    )

    trainable_encoder_parameters = [
        parameter
        for parameter
        in encoder.parameters()
        if parameter.requires_grad
    ]

    print()
    print(
        f"🔥 Trainable encoder parameters: "
        f"{sum(p.numel() for p in trainable_encoder_parameters):,}"
    )

    print(
        f"🔥 Projection parameters: "
        f"{sum(p.numel() for p in projection.parameters()):,}"
    )

    # =====================================================
    # WEIGHT TRACKING
    # =====================================================

    (
        tracked_name,
        tracked_parameter,
    ) = get_tracked_parameter(
        encoder
    )

    rows = min(
        64,
        tracked_parameter.shape[0],
    )

    cols = min(
        64,
        tracked_parameter.shape[1],
    )

    weight_before = (
        tracked_parameter[
            :rows,
            :cols
        ]
        .detach()
        .cpu()
        .clone()
    )

    # =====================================================
    # LOADERS
    # =====================================================

    train_loader = DataLoader(
        PairDataset(
            train_pairs
        ),

        batch_size=
            BATCH_SIZE,

        shuffle=True,

        num_workers=0,

        collate_fn=
            collate_pairs,

        drop_last=True,
    )

    eval_loader = DataLoader(
        PairDataset(
            eval_pairs
        ),

        batch_size=
            BATCH_SIZE,

        shuffle=False,

        num_workers=0,

        collate_fn=
            collate_pairs,

        drop_last=False,
    )

    # =====================================================
    # OPTIMIZER
    # =====================================================

    optimizer = AdamW(
        [
            {
                "params":
                    trainable_encoder_parameters,

                "lr":
                    ENCODER_LR,
            },

            {
                "params":
                    projection.parameters(),

                "lr":
                    PROJECTION_LR,
            },
        ],

        weight_decay=
            WEIGHT_DECAY,
    )

    # =====================================================
    # BEFORE TRAINING
    # =====================================================

    print()
    print(
        "📊 Evaluating BEFORE training..."
    )

    before = evaluate(
        encoder=
            encoder,

        projection=
            projection,

        loader=
            eval_loader,

        tokenizer=
            tokenizer,

        device=
            device,
    )

    print(
        f"Before loss: "
        f"{before['loss']:.6f}"
    )

    print(
        f"Before retrieval accuracy: "
        f"{before['retrievalAccuracy'] * 100:.2f}%"
    )

    print(
        f"Before positive cosine: "
        f"{before['positiveCosineSimilarity']:.4f}"
    )

    # =====================================================
    # ACTUAL TRAINING
    # =====================================================

    print()
    print(
        "=" * 72
    )

    print(
        "🚀 REAL CONTEXTUAL "
        "ML TRAINING STARTING"
    )

    print(
        "Manual concept labels: NO"
    )

    print(
        "Automatic real NCERT context pairs: YES"
    )

    print(
        "In-batch negatives: YES"
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

    start_time = time.time()

    global_step = 0

    for epoch in range(
        EPOCHS
    ):

        encoder.train()
        projection.train()

        epoch_loss = 0.0
        epoch_accuracy = 0.0
        epoch_similarity = 0.0

        batches = 0

        print()
        print(
            f"📘 Epoch "
            f"{epoch + 1}/{EPOCHS}"
        )

        for batch in train_loader:

            anchors = batch[
                "anchors"
            ]

            positives = batch[
                "positives"
            ]

            anchor_vectors = encode(
                texts=
                    anchors,

                encoder=
                    encoder,

                projection=
                    projection,

                tokenizer=
                    tokenizer,

                device=
                    device,
            )

            positive_vectors = encode(
                texts=
                    positives,

                encoder=
                    encoder,

                projection=
                    projection,

                tokenizer=
                    tokenizer,

                device=
                    device,
            )

            (
                loss,
                accuracy,
                similarity,
            ) = contextual_loss(
                anchor_vectors,
                positive_vectors,
            )

            optimizer.zero_grad(
                set_to_none=True
            )

            loss.backward()

            torch.nn.utils.clip_grad_norm_(
                (
                    trainable_encoder_parameters
                    +
                    list(
                        projection.parameters()
                    )
                ),

                max_norm=1.0,
            )

            optimizer.step()

            global_step += 1
            batches += 1

            epoch_loss += float(
                loss.item()
            )

            epoch_accuracy += (
                accuracy
            )

            epoch_similarity += (
                similarity
            )

            if (
                global_step == 1
                or global_step % 25 == 0
            ):

                print(
                    f"Step {global_step} "
                    f"| loss {loss.item():.4f} "
                    f"| retrieval "
                    f"{accuracy * 100:.2f}% "
                    f"| positive cosine "
                    f"{similarity:.4f}"
                )

        print()
        print(
            f"✅ Epoch loss: "
            f"{epoch_loss / batches:.6f}"
        )

        print(
            f"✅ Epoch retrieval accuracy: "
            f"{(epoch_accuracy / batches) * 100:.2f}%"
        )

        print(
            f"✅ Epoch positive cosine: "
            f"{epoch_similarity / batches:.4f}"
        )

    elapsed = (
        time.time()
        - start_time
    )

    # =====================================================
    # AFTER TRAINING
    # =====================================================

    print()
    print(
        "📊 Evaluating AFTER training..."
    )

    after = evaluate(
        encoder=
            encoder,

        projection=
            projection,

        loader=
            eval_loader,

        tokenizer=
            tokenizer,

        device=
            device,
    )

    # =====================================================
    # WEIGHT UPDATE PROOF
    # =====================================================

    weight_after = (
        tracked_parameter[
            :rows,
            :cols
        ]
        .detach()
        .cpu()
        .clone()
    )

    difference = (
        weight_after
        - weight_before
    ).abs()

    changed_values = int(
        (
            difference > 0
        )
        .sum()
        .item()
    )

    total_values = int(
        difference.numel()
    )

    mean_change = float(
        difference.mean().item()
    )

    max_change = float(
        difference.max().item()
    )

    weights_changed = (
        changed_values > 0
    )

    # =====================================================
    # SAVE
    # =====================================================

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    FINAL_ENCODER.mkdir(
        parents=True,
        exist_ok=True,
    )

    encoder.save_pretrained(
        FINAL_ENCODER
    )

    tokenizer.save_pretrained(
        FINAL_ENCODER
    )

    torch.save(
        {
            "state_dict":
                projection.state_dict(),

            "inputDimension":
                hidden_size,

            "outputDimension":
                PROJECTION_DIM,
        },

        PROJECTION_PATH,
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    summary = {
        "trainingType":
            "SELF_SUPERVISED_CONTEXTUAL_CONTRASTIVE",

        "data":
            "Official NCERT Class 7 Mathematics",

        "manualConceptLabels":
            False,

        "realBlocks":
            len(blocks),

        "automaticPairs":
            len(pairs),

        "trainPairs":
            len(train_pairs),

        "evalPairs":
            len(eval_pairs),

        "trainableLayers":
            UNFREEZE_LAST_N_LAYERS,

        "before":
            before,

        "after":
            after,

        "lossImprovement":
            (
                before["loss"]
                - after["loss"]
            ),

        "retrievalAccuracyImprovement":
            (
                after["retrievalAccuracy"]
                -
                before["retrievalAccuracy"]
            ),

        "positiveCosineImprovement":
            (
                after["positiveCosineSimilarity"]
                -
                before["positiveCosineSimilarity"]
            ),

        "trackedParameter":
            tracked_name,

        "changedValues":
            changed_values,

        "trackedValues":
            total_values,

        "meanWeightChange":
            mean_change,

        "maxWeightChange":
            max_change,

        "weightsChanged":
            weights_changed,

        "trainingSeconds":
            round(
                elapsed,
                2,
            ),

        "encoderPath":
            str(
                FINAL_ENCODER.relative_to(
                    ROOT
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
    # OUTPUT
    # =====================================================

    print()
    print(
        "=" * 72
    )

    print(
        "✅ CONTEXTUAL NCERT "
        "ML TRAINING COMPLETE"
    )

    print(
        "=" * 72
    )

    print(
        f"📚 Real blocks: "
        f"{len(blocks)}"
    )

    print(
        f"🔗 Automatic pairs: "
        f"{len(pairs)}"
    )

    print(
        f"📘 Train pairs: "
        f"{len(train_pairs)}"
    )

    print(
        f"📗 Eval pairs: "
        f"{len(eval_pairs)}"
    )

    print()

    print(
        "BEFORE"
    )

    print(
        f"Loss: "
        f"{before['loss']:.6f}"
    )

    print(
        f"Retrieval accuracy: "
        f"{before['retrievalAccuracy'] * 100:.2f}%"
    )

    print(
        f"Positive cosine: "
        f"{before['positiveCosineSimilarity']:.4f}"
    )

    print()

    print(
        "AFTER"
    )

    print(
        f"Loss: "
        f"{after['loss']:.6f}"
    )

    print(
        f"Retrieval accuracy: "
        f"{after['retrievalAccuracy'] * 100:.2f}%"
    )

    print(
        f"Positive cosine: "
        f"{after['positiveCosineSimilarity']:.4f}"
    )

    print()

    print(
        "🧬 WEIGHT UPDATE"
    )

    print(
        f"Changed values: "
        f"{changed_values}/"
        f"{total_values}"
    )

    print(
        f"Mean change: "
        f"{mean_change:.12f}"
    )

    print(
        f"Max change: "
        f"{max_change:.12f}"
    )

    print(
        f"Weights changed: "
        f"{weights_changed}"
    )

    print()

    print(
        f"⏱ Training time: "
        f"{elapsed / 60:.2f} minutes"
    )

    print()

    print(
        "💾 NEW CONTEXTUAL ENCODER:"
    )

    print(
        FINAL_ENCODER
    )

    print(
        "=" * 72
    )

    if not weights_changed:

        raise RuntimeError(
            "Encoder weights did not change."
        )


if __name__ == "__main__":
    main()