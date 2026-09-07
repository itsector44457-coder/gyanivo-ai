from __future__ import annotations

import json
import math
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.cluster import MiniBatchKMeans
from sklearn.decomposition import PCA
from sklearn.metrics import (
    calinski_harabasz_score,
    davies_bouldin_score,
    silhouette_score,
)


# =========================================================
# CONFIG
# =========================================================

RANDOM_STATE = 42

K_VALUES = list(
    range(
        8,
        42,
        2,
    )
)

PCA_COMPONENTS = 50

SILHOUETTE_SAMPLE_SIZE = 2000

REPRESENTATIVE_BLOCKS_PER_CLUSTER = 5


# =========================================================
# PATHS
# =========================================================

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

EMBEDDING_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "semantic_embeddings"
)

ENCODER_EMBEDDINGS_PATH = (
    EMBEDDING_ROOT
    / "block_embeddings_768.npy"
)

PROJECTED_EMBEDDINGS_PATH = (
    EMBEDDING_ROOT
    / "block_embeddings_128.npy"
)

METADATA_PATH = (
    EMBEDDING_ROOT
    / "block_metadata.json"
)

OUTPUT_ROOT = (
    ML_SERVICE_ROOT
    / "models"
    / "ncert_concept_discovery_class7"
)

MODEL_PATH = (
    OUTPUT_ROOT
    / "concept_cluster_model.joblib"
)

PCA_PATH = (
    OUTPUT_ROOT
    / "concept_pca.joblib"
)

ASSIGNMENTS_PATH = (
    OUTPUT_ROOT
    / "concept_assignments.jsonl"
)

CLUSTERS_PATH = (
    OUTPUT_ROOT
    / "discovered_clusters.json"
)

EXPERIMENTS_PATH = (
    OUTPUT_ROOT
    / "model_selection.json"
)

SUMMARY_PATH = (
    OUTPUT_ROOT
    / "training_summary.json"
)


# =========================================================
# LOAD DATA
# =========================================================

def load_embeddings(
    path: Path,
    name: str,
) -> np.ndarray:

    if not path.exists():
        raise FileNotFoundError(
            f"{name} embeddings not found:\n{path}"
        )

    matrix = np.load(
        path
    )

    if matrix.ndim != 2:
        raise RuntimeError(
            (
                f"{name} embeddings must be 2D. "
                f"Found: {matrix.shape}"
            )
        )

    if not np.isfinite(
        matrix
    ).all():
        raise RuntimeError(
            f"{name} contains NaN/Inf."
        )

    return matrix.astype(
        np.float32
    )


def load_metadata() -> list[dict]:

    if not METADATA_PATH.exists():
        raise FileNotFoundError(
            f"Metadata not found:\n{METADATA_PATH}"
        )

    with METADATA_PATH.open(
        "r",
        encoding="utf-8",
    ) as file:

        metadata = json.load(
            file
        )

    return metadata


# =========================================================
# PCA
# =========================================================

def fit_pca(
    matrix: np.ndarray,
    representation_name: str,
) -> tuple[
    PCA,
    np.ndarray,
]:

    components = min(
        PCA_COMPONENTS,
        matrix.shape[1],
        matrix.shape[0] - 1,
    )

    print()
    print(
        f"📐 PCA: {representation_name}"
    )

    print(
        f"Original dimensions: "
        f"{matrix.shape[1]}"
    )

    print(
        f"Target dimensions: "
        f"{components}"
    )

    pca = PCA(
        n_components=
            components,

        random_state=
            RANDOM_STATE,
    )

    reduced = (
        pca.fit_transform(
            matrix
        )
        .astype(
            np.float32
        )
    )

    variance = float(
        pca
        .explained_variance_ratio_
        .sum()
    )

    print(
        f"Explained variance: "
        f"{variance * 100:.2f}%"
    )

    return (
        pca,
        reduced,
    )


# =========================================================
# TRAIN ONE CLUSTER MODEL
# =========================================================

def train_cluster_model(
    matrix: np.ndarray,
    k: int,
) -> tuple[
    MiniBatchKMeans,
    np.ndarray,
    dict,
]:

    model = MiniBatchKMeans(
        n_clusters=
            k,

        random_state=
            RANDOM_STATE,

        batch_size=
            256,

        n_init=
            10,

        max_iter=
            300,

        reassignment_ratio=
            0.01,
    )

    labels = model.fit_predict(
        matrix
    )

    unique_clusters = np.unique(
        labels
    )

    if len(
        unique_clusters
    ) < 2:

        raise RuntimeError(
            (
                f"K={k} produced fewer "
                "than two clusters."
            )
        )

    silhouette = float(
        silhouette_score(
            matrix,
            labels,

            sample_size=min(
                SILHOUETTE_SAMPLE_SIZE,
                len(matrix),
            ),

            random_state=
                RANDOM_STATE,
        )
    )

    davies = float(
        davies_bouldin_score(
            matrix,
            labels,
        )
    )

    calinski = float(
        calinski_harabasz_score(
            matrix,
            labels,
        )
    )

    cluster_sizes = [
        int(
            np.sum(
                labels == cluster_id
            )
        )
        for cluster_id
        in range(
            k
        )
    ]

    minimum_cluster_size = min(
        cluster_sizes
    )

    maximum_cluster_size = max(
        cluster_sizes
    )

    mean_cluster_size = float(
        np.mean(
            cluster_sizes
        )
    )

    metrics = {
        "k":
            k,

        "silhouette":
            silhouette,

        "daviesBouldin":
            davies,

        "calinskiHarabasz":
            calinski,

        "minimumClusterSize":
            minimum_cluster_size,

        "maximumClusterSize":
            maximum_cluster_size,

        "meanClusterSize":
            mean_cluster_size,

        "inertia":
            float(
                model.inertia_
            ),
    }

    return (
        model,
        labels,
        metrics,
    )


# =========================================================
# MODEL SELECTION
# =========================================================

def evaluate_representation(
    representation_name: str,
    matrix: np.ndarray,
) -> dict:

    print()
    print(
        "=" * 70
    )

    print(
        f"🧠 TRAINING CLUSTER MODELS: "
        f"{representation_name}"
    )

    print(
        "=" * 70
    )

    experiments = []

    best_result = None

    for k in K_VALUES:

        start = time.time()

        (
            model,
            labels,
            metrics,
        ) = train_cluster_model(
            matrix=
                matrix,

            k=
                k,
        )

        elapsed = (
            time.time()
            - start
        )

        metrics[
            "elapsedSeconds"
        ] = round(
            elapsed,
            2,
        )

        experiments.append(
            metrics
        )

        print(
            f"K={k:02d} "
            f"| silhouette="
            f"{metrics['silhouette']:.4f} "
            f"| DB="
            f"{metrics['daviesBouldin']:.4f} "
            f"| CH="
            f"{metrics['calinskiHarabasz']:.1f} "
            f"| min="
            f"{metrics['minimumClusterSize']} "
            f"| max="
            f"{metrics['maximumClusterSize']}"
        )

        # ---------------------------------------------
        # Primary selection:
        #
        # Higher silhouette is better.
        #
        # Tie-break:
        # lower Davies-Bouldin is better.
        # ---------------------------------------------

        candidate = {
            "model":
                model,

            "labels":
                labels,

            "metrics":
                metrics,
        }

        if best_result is None:

            best_result = (
                candidate
            )

        else:

            current = (
                best_result[
                    "metrics"
                ]
            )

            better_silhouette = (
                metrics[
                    "silhouette"
                ]
                >
                current[
                    "silhouette"
                ]
            )

            same_silhouette = math.isclose(
                metrics[
                    "silhouette"
                ],

                current[
                    "silhouette"
                ],

                rel_tol=1e-6,

                abs_tol=1e-6,
            )

            better_db = (
                metrics[
                    "daviesBouldin"
                ]
                <
                current[
                    "daviesBouldin"
                ]
            )

            if (
                better_silhouette
                or (
                    same_silhouette
                    and better_db
                )
            ):

                best_result = (
                    candidate
                )

    if best_result is None:

        raise RuntimeError(
            (
                "No valid clustering model "
                "was trained."
            )
        )

    return {
        "representation":
            representation_name,

        "experiments":
            experiments,

        "bestModel":
            best_result[
                "model"
            ],

        "bestLabels":
            best_result[
                "labels"
            ],

        "bestMetrics":
            best_result[
                "metrics"
            ],
    }


# =========================================================
# CHOOSE BETWEEN 768 AND 128
# =========================================================

def choose_best_representation(
    results: list[dict],
) -> dict:

    if not results:

        raise RuntimeError(
            "No representation results."
        )

    best = results[0]

    for candidate in results[
        1:
    ]:

        candidate_metrics = (
            candidate[
                "bestMetrics"
            ]
        )

        best_metrics = (
            best[
                "bestMetrics"
            ]
        )

        if (
            candidate_metrics[
                "silhouette"
            ]
            >
            best_metrics[
                "silhouette"
            ]
        ):

            best = candidate

        elif math.isclose(
            candidate_metrics[
                "silhouette"
            ],

            best_metrics[
                "silhouette"
            ],

            rel_tol=1e-6,

            abs_tol=1e-6,
        ):

            if (
                candidate_metrics[
                    "daviesBouldin"
                ]
                <
                best_metrics[
                    "daviesBouldin"
                ]
            ):

                best = candidate

    return best


# =========================================================
# REPRESENTATIVE BLOCKS
# =========================================================

def find_representative_blocks(
    matrix: np.ndarray,
    labels: np.ndarray,
    model: MiniBatchKMeans,
    metadata: list[dict],
) -> list[dict]:

    clusters = []

    for cluster_id in range(
        model.n_clusters
    ):

        indices = np.where(
            labels == cluster_id
        )[0]

        if len(indices) == 0:
            continue

        centroid = (
            model.cluster_centers_[
                cluster_id
            ]
        )

        vectors = matrix[
            indices
        ]

        distances = np.linalg.norm(
            vectors
            - centroid,
            axis=1,
        )

        order = np.argsort(
            distances
        )

        representative_indices = (
            indices[
                order[
                    :REPRESENTATIVE_BLOCKS_PER_CLUSTER
                ]
            ]
        )

        representatives = []

        for index in (
            representative_indices
        ):

            item = metadata[
                int(index)
            ]

            representatives.append(
                {
                    "embeddingIndex":
                        int(
                            index
                        ),

                    "distanceToCentroid":
                        float(
                            np.linalg.norm(
                                matrix[
                                    int(index)
                                ]
                                - centroid
                            )
                        ),

                    "pdf":
                        item.get(
                            "pdf"
                        ),

                    "pageNumber":
                        item.get(
                            "pageNumber"
                        ),

                    "blockNumber":
                        item.get(
                            "blockNumber"
                        ),

                    "text":
                        item.get(
                            "text",
                            ""
                        ),
                }
            )

        clusters.append(
            {
                "clusterId":
                    int(
                        cluster_id
                    ),

                "size":
                    int(
                        len(
                            indices
                        )
                    ),

                # IMPORTANT:
                #
                # No human concept name yet.
                #
                # Later another model will
                # interpret/name this cluster.
                "automaticLabel":
                    None,

                "representativeBlocks":
                    representatives,
            }
        )

    clusters.sort(
        key=lambda item:
            item[
                "size"
            ],

        reverse=True,
    )

    return clusters


# =========================================================
# SAVE ASSIGNMENTS
# =========================================================

def save_assignments(
    labels: np.ndarray,
    metadata: list[dict],
):

    with ASSIGNMENTS_PATH.open(
        "w",
        encoding="utf-8",
    ) as file:

        for index, label in enumerate(
            labels
        ):

            metadata_item = metadata[
                index
            ]

            item = {
                "embeddingIndex":
                    index,

                "clusterId":
                    int(
                        label
                    ),

                "blockId":
                    metadata_item.get(
                        "blockId"
                    ),

                "pdf":
                    metadata_item.get(
                        "pdf"
                    ),

                "pageNumber":
                    metadata_item.get(
                        "pageNumber"
                    ),

                "blockNumber":
                    metadata_item.get(
                        "blockNumber"
                    ),

                "text":
                    metadata_item.get(
                        "text"
                    ),
            }

            file.write(
                json.dumps(
                    item,
                    ensure_ascii=False,
                )
            )

            file.write(
                "\n"
            )


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🧠 Gyanivo Unsupervised "
        "Concept Discovery Training"
    )

    print(
        "NO manual concept labels"
    )

    print()

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    # =====================================================
    # LOAD
    # =====================================================

    encoder_embeddings = (
        load_embeddings(
            ENCODER_EMBEDDINGS_PATH,
            "768-D encoder",
        )
    )

    projected_embeddings = (
        load_embeddings(
            PROJECTED_EMBEDDINGS_PATH,
            "128-D contrastive",
        )
    )

    metadata = (
        load_metadata()
    )

    expected_rows = len(
        metadata
    )

    if (
        encoder_embeddings.shape[0]
        != expected_rows
        or
        projected_embeddings.shape[0]
        != expected_rows
    ):

        raise RuntimeError(
            "Embedding/metadata count mismatch."
        )

    print(
        f"📚 Real NCERT blocks: "
        f"{expected_rows}"
    )

    print(
        f"🧬 Encoder matrix: "
        f"{encoder_embeddings.shape}"
    )

    print(
        f"🎯 Contrastive matrix: "
        f"{projected_embeddings.shape}"
    )

    # =====================================================
    # PCA BOTH REPRESENTATIONS
    # =====================================================

    (
        encoder_pca,
        encoder_reduced,
    ) = fit_pca(
        matrix=
            encoder_embeddings,

        representation_name=
            "768-D encoder",
    )

    (
        projected_pca,
        projected_reduced,
    ) = fit_pca(
        matrix=
            projected_embeddings,

        representation_name=
            "128-D contrastive",
    )

    # =====================================================
    # REAL UNSUPERVISED ML FITTING
    # =====================================================

    encoder_result = (
        evaluate_representation(
            representation_name=
                "encoder_768",

            matrix=
                encoder_reduced,
        )
    )

    projected_result = (
        evaluate_representation(
            representation_name=
                "contrastive_128",

            matrix=
                projected_reduced,
        )
    )

    # =====================================================
    # AUTOMATIC REPRESENTATION SELECTION
    # =====================================================

    best = (
        choose_best_representation(
            [
                encoder_result,
                projected_result,
            ]
        )
    )

    best_representation = (
        best[
            "representation"
        ]
    )

    best_metrics = (
        best[
            "bestMetrics"
        ]
    )

    best_model = (
        best[
            "bestModel"
        ]
    )

    best_labels = (
        best[
            "bestLabels"
        ]
    )

    if (
        best_representation
        == "encoder_768"
    ):

        best_matrix = (
            encoder_reduced
        )

        best_pca = (
            encoder_pca
        )

    else:

        best_matrix = (
            projected_reduced
        )

        best_pca = (
            projected_pca
        )

    # =====================================================
    # REPRESENTATIVE BLOCKS
    # =====================================================

    clusters = (
        find_representative_blocks(
            matrix=
                best_matrix,

            labels=
                best_labels,

            model=
                best_model,

            metadata=
                metadata,
        )
    )

    # =====================================================
    # SAVE TRAINED ML OBJECTS
    # =====================================================

    joblib.dump(
        best_model,
        MODEL_PATH,
    )

    joblib.dump(
        best_pca,
        PCA_PATH,
    )

    save_assignments(
        labels=
            best_labels,

        metadata=
            metadata,
    )

    CLUSTERS_PATH.write_text(
        json.dumps(
            {
                "representation":
                    best_representation,

                "clusterCount":
                    int(
                        best_model.n_clusters
                    ),

                "clusters":
                    clusters,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # MODEL SELECTION REPORT
    # =====================================================

    selection_report = {
        "selectionMethod":
            (
                "Max silhouette score; "
                "Davies-Bouldin tie-break"
            ),

        "kValuesTested":
            K_VALUES,

        "encoder768":
            {
                "best":
                    encoder_result[
                        "bestMetrics"
                    ],

                "experiments":
                    encoder_result[
                        "experiments"
                    ],
            },

        "contrastive128":
            {
                "best":
                    projected_result[
                        "bestMetrics"
                    ],

                "experiments":
                    projected_result[
                        "experiments"
                    ],
            },

        "selectedRepresentation":
            best_representation,

        "selectedModel":
            best_metrics,
    }

    EXPERIMENTS_PATH.write_text(
        json.dumps(
            selection_report,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    summary = {
        "trainingType":
            "UNSUPERVISED_CONCEPT_DISCOVERY",

        "algorithm":
            "PCA + MiniBatchKMeans",

        "manualConceptLabels":
            False,

        "dataSource":
            (
                "Official NCERT Class 7 "
                "Mathematics semantic blocks"
            ),

        "blockCount":
            expected_rows,

        "representationsCompared": [
            "encoder_768",
            "contrastive_128",
        ],

        "kValuesTested":
            K_VALUES,

        "selectedRepresentation":
            best_representation,

        "selectedClusterCount":
            int(
                best_model.n_clusters
            ),

        "silhouette":
            best_metrics[
                "silhouette"
            ],

        "daviesBouldin":
            best_metrics[
                "daviesBouldin"
            ],

        "calinskiHarabasz":
            best_metrics[
                "calinskiHarabasz"
            ],

        "modelPath":
            str(
                MODEL_PATH.relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "pcaPath":
            str(
                PCA_PATH.relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "clustersPath":
            str(
                CLUSTERS_PATH.relative_to(
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
    # OUTPUT
    # =====================================================

    print()
    print(
        "=" * 72
    )

    print(
        "✅ UNSUPERVISED CONCEPT "
        "DISCOVERY TRAINING COMPLETE"
    )

    print(
        "=" * 72
    )

    print(
        f"📚 Blocks trained on: "
        f"{expected_rows}"
    )

    print()

    print(
        "BEST 768-D MODEL"
    )

    print(
        f"K: "
        f"{encoder_result['bestMetrics']['k']}"
    )

    print(
        f"Silhouette: "
        f"{encoder_result['bestMetrics']['silhouette']:.4f}"
    )

    print()

    print(
        "BEST 128-D MODEL"
    )

    print(
        f"K: "
        f"{projected_result['bestMetrics']['k']}"
    )

    print(
        f"Silhouette: "
        f"{projected_result['bestMetrics']['silhouette']:.4f}"
    )

    print()

    print(
        "🏆 AUTOMATIC WINNER"
    )

    print(
        f"Representation: "
        f"{best_representation}"
    )

    print(
        f"Discovered groups: "
        f"{best_model.n_clusters}"
    )

    print(
        f"Silhouette: "
        f"{best_metrics['silhouette']:.4f}"
    )

    print(
        f"Davies-Bouldin: "
        f"{best_metrics['daviesBouldin']:.4f}"
    )

    print(
        f"Calinski-Harabasz: "
        f"{best_metrics['calinskiHarabasz']:.2f}"
    )

    print()

    print(
        "🔬 LARGEST DISCOVERED GROUPS"
    )

    for cluster in clusters[
        :5
    ]:

        print()
        print(
            "-" * 60
        )

        print(
            f"Cluster "
            f"{cluster['clusterId']} "
            f"| size "
            f"{cluster['size']}"
        )

        print(
            "Representative blocks:"
        )

        for representative in (
            cluster[
                "representativeBlocks"
            ][
                :3
            ]
        ):

            text = (
                representative[
                    "text"
                ]
                .replace(
                    "\n",
                    " "
                )
            )

            print(
                f"• {text[:220]}"
            )

    print()
    print(
        "=" * 72
    )

    print(
        f"💾 Trained cluster model:\n"
        f"{MODEL_PATH}"
    )

    print()

    print(
        f"💾 Discovered clusters:\n"
        f"{CLUSTERS_PATH}"
    )

    print(
        "=" * 72
    )


if __name__ == "__main__":
    main()