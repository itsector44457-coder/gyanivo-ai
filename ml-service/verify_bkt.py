import sys
sys.path.insert(0, '.')
from app.knowledge_tracing.bkt import update_competency_knowledge, BKT_TEST_VECTORS, update_knowledge, LEGACY_BKT_TEST_VECTORS

failures = []

print("=== Verifying BKT_TEST_VECTORS (update_competency_knowledge) ===")
for v in BKT_TEST_VECTORS:
    result = update_competency_knowledge(**v["inputs"])
    actual = result["updatedMastery"]
    expected = v["expected_updated_mastery"]
    ok = abs(actual - expected) < 0.001
    status = "PASS" if ok else "FAIL"
    print(f"  {status} | {v['label']}")
    if not ok:
        print(f"       expected={expected}, got={actual}")
        failures.append(v["label"])

print()
print("=== Verifying LEGACY_BKT_TEST_VECTORS (update_knowledge) ===")
for v in LEGACY_BKT_TEST_VECTORS:
    result = update_knowledge(**v["inputs"])
    actual = result["mastery"]
    expected = v["expected_mastery"]
    ok = abs(actual - expected) < 0.5
    status = "PASS" if ok else "FAIL"
    print(f"  {status} | {v['label']}")
    print(f"       expected~={expected}, got={actual}")
    if not ok:
        failures.append(v["label"])

print()
if failures:
    print(f"FAILURES: {failures}")
    sys.exit(1)
else:
    print("All test vectors passed.")
