import sys
sys.path.insert(0, '.')
from app.course_mapping.schemas import CompetencyItem, CourseMappingItem
from app.course_mapping.semantic_mapper import mapper_instance

competencies = [
    CompetencyItem(
        id=101,
        code="TECH_PYTHON",
        name="Python Data Science & Microdata Processing",
        domain="Technical",
        description="Pandas, NumPy, vectorization, NSS microdata cleaning, survey data transformation and analysis.",
    ),
    CompetencyItem(
        id=102,
        code="TECH_GIS",
        name="GIS & Spatial Analysis",
        domain="Technical",
        description="Geographic Information Systems, spatial boundaries, PostGIS, QGIS, GPS coordinate reference systems EPSG 4326, point in polygon.",
    ),
    CompetencyItem(
        id=103,
        code="STAT_SAMPLING",
        name="Statistical Sampling Theory & Survey Design",
        domain="Statistical",
        description="Complex survey sampling, stratification, PPS sampling, design effect, multiplier calculation, PLFS survey methodology.",
    ),
    CompetencyItem(
        id=104,
        code="TECH_SQL",
        name="Enterprise SQL & Analytical Querying",
        domain="Technical",
        description="Relational databases, PostgreSQL queries, window functions, CTEs, indexing, grouping sets for official statistical reporting.",
    ),
]

test_cases = [
    {
        "course": CourseMappingItem(
            title="Python for Data Analysis and Official Statistics",
            description="Hands-on training in pandas DataFrames, data cleaning, and microdata processing for survey researchers.",
            learningOutcomes=["Load large survey datasets", "Compute group statistics", "Impute missing values"],
            tags=["python", "pandas", "data-science"],
        ),
        "expected_top_competency": "TECH_PYTHON",
    },
    {
        "course": CourseMappingItem(
            title="Spatial Data Mapping and QGIS for Administrative Units",
            description="Introduction to GIS vector mapping, thematic choropleth maps, coordinate systems, and enumeration block spatial queries.",
            learningOutcomes=["Work with shapefiles and GeoPackages", "Execute spatial overlays", "Perform point in polygon analysis"],
            tags=["gis", "spatial", "qgis", "maps"],
        ),
        "expected_top_competency": "TECH_GIS",
    },
    {
        "course": CourseMappingItem(
            title="Design and Analysis of Large-Scale Sample Surveys",
            description="Comprehensive study of multi-stage stratified sampling, Probability Proportional to Size (PPS), and variance estimation in national surveys.",
            learningOutcomes=["Design stratified sampling schemes", "Calculate design effects (Deff)", "Compute sampling weights"],
            tags=["sampling", "survey-design", "statistics", "plfs"],
        ),
        "expected_top_competency": "STAT_SAMPLING",
    },
    {
        "course": CourseMappingItem(
            title="Advanced SQL for Statistical Databases and Reporting",
            description="Mastering window functions, common table expressions (CTEs), rollup aggregations, and query optimization in PostgreSQL.",
            learningOutcomes=["Write complex analytical window queries", "Optimize indexing strategies", "Build hierarchical reporting queries"],
            tags=["sql", "postgresql", "databases", "analytics"],
        ),
        "expected_top_competency": "TECH_SQL",
    },
]

print("=== SIH26101 Semantic Competency Mapping Benchmark Evaluation ===")
all_passed = True

for tc in test_cases:
    res = mapper_instance.map_course(tc["course"], competencies, min_threshold=0.30, top_k=3)
    if not res.topMatches:
        print(f"FAIL: No matches returned for '{tc['course'].title}'")
        all_passed = False
        continue

    top_match = res.topMatches[0]
    is_correct = top_match.competencyCode == tc["expected_top_competency"]
    status_str = "PASS" if is_correct else "FAIL"
    if not is_correct:
        all_passed = False

    print(f"  {status_str} | Course: '{tc['course'].title}'")
    print(f"         -> Top Match: {top_match.competencyCode} ({top_match.competencyName})")
    print(f"         -> Similarity: {top_match.semanticSimilarity:.4f} | Reliability: {top_match.mappingReliability:.4f} | Status: {top_match.mappingStatus}")
    print(f"         -> Evidence: {top_match.evidence}")
    print()

if all_passed:
    print("All 4 semantic mapping benchmarks successfully matched expected competencies with high confidence.")
else:
    print("One or more semantic mapping test cases failed.")
    sys.exit(1)
