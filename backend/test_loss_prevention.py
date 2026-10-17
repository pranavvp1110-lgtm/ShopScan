"""
ScanGuard AI - Unit Tests for Loss Prevention Engine
Tests all 7 key test cases:
1. Clean cart (100% matched)
2. Extra observed item / Missed scan
3. Quantity mismatch (cart 2 vs sensor 3)
4. Unknown barcode
5. Empty cart
6. Missing verification data (VERIFICATION_INCOMPLETE)
7. Product-record mismatch
"""
import pytest
from engine import LossPreventionEngine, CartItemInput, VerificationRecordInput


SAMPLE_CATALOGUE = {
    "8901030383120": {"id": 1, "name": "Organic Basmati Royal Rice (1kg)", "price": 6.49},
    "8901030383212": {"id": 6, "name": "Farm Fresh Whole Milk (1L)", "price": 3.19},
    "8901030383427": {"id": 16, "name": "Shea Butter Handcrafted Soap Bar", "price": 4.19},
    "8901030383335": {"id": 13, "name": "Artisan Butter Shortbread Biscuits", "price": 3.49},
}


@pytest.fixture
def engine():
    return LossPreventionEngine(catalogue_by_barcode=SAMPLE_CATALOGUE)


def test_clean_cart(engine):
    """Scenario 5 / Clean Cart: Digital cart and verification records match perfectly."""
    cart = [
        CartItemInput(product_id=1, barcode="8901030383120", name="Rice", quantity=1, unit_price=6.49),
        CartItemInput(product_id=6, barcode="8901030383212", name="Milk", quantity=2, unit_price=3.19),
        CartItemInput(product_id=16, barcode="8901030383427", name="Soap", quantity=1, unit_price=4.19),
    ]
    events = [
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383120", observed_quantity=1),
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383212", observed_quantity=2),
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383427", observed_quantity=1),
    ]

    result = engine.evaluate("SES-TEST-01", cart, events)
    assert result.verification_status == "LOW_RISK"
    assert result.is_clean is True
    assert result.risk_score == 0
    assert len(result.discrepancies) == 0
    assert "Approved" in result.recommended_action


def test_missed_scan_detected(engine):
    """Scenario 1 / Missed Scan: Verification sensor reports biscuits not in cart."""
    cart = [
        CartItemInput(product_id=1, barcode="8901030383120", name="Rice", quantity=1, unit_price=6.49),
        CartItemInput(product_id=6, barcode="8901030383212", name="Milk", quantity=2, unit_price=3.19),
        CartItemInput(product_id=16, barcode="8901030383427", name="Soap", quantity=1, unit_price=4.19),
    ]
    events = [
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383120", observed_quantity=1),
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383212", observed_quantity=2),
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383427", observed_quantity=1),
        # Extra item detected in basket!
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383335", observed_quantity=1),
    ]

    result = engine.evaluate("SES-TEST-02", cart, events)
    assert result.verification_status == "REVIEW_REQUIRED"
    assert result.is_clean is False
    assert result.risk_score > 0
    assert any(d.discrepancy_type == "MISSED_SCAN" for d in result.discrepancies)
    missed = next(d for d in result.discrepancies if d.discrepancy_type == "MISSED_SCAN")
    assert "Shortbread Biscuits" in missed.description
    assert missed.risk_level == "HIGH"


def test_quantity_mismatch(engine):
    """Scenario 2 / Quantity Mismatch: Cart has 1 Milk, sensor sees 2 Milk."""
    cart = [
        CartItemInput(product_id=6, barcode="8901030383212", name="Milk", quantity=1, unit_price=3.19),
    ]
    events = [
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383212", observed_quantity=2),
    ]

    result = engine.evaluate("SES-TEST-03", cart, events)
    assert result.verification_status == "REVIEW_REQUIRED"
    assert any(d.discrepancy_type == "QUANTITY_MISMATCH" for d in result.discrepancies)
    disc = result.discrepancies[0]
    assert disc.expected_quantity == 1
    assert disc.observed_quantity == 2


def test_unknown_barcode(engine):
    """Scenario 4 / Unknown Barcode: Cart contains barcode not in store catalogue."""
    cart = [
        CartItemInput(product_id=999, barcode="9999999999999", name="Counterfeit Item", quantity=1, unit_price=10.0),
    ]
    events = [
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="9999999999999", observed_quantity=1),
    ]

    result = engine.evaluate("SES-TEST-04", cart, events)
    assert result.verification_status == "REVIEW_REQUIRED"
    assert any(d.discrepancy_type == "UNKNOWN_BARCODE" for d in result.discrepancies)


def test_product_record_mismatch(engine):
    """Scenario / Product ID Mismatch: Selected product ID differs from barcode lookup."""
    # Barcode is Rice (ID 1), but item has product_id 6 (Milk)
    cart = [
        CartItemInput(product_id=6, barcode="8901030383120", name="Milk Swapped Barcode", quantity=1, unit_price=3.19),
    ]
    events = [
        VerificationRecordInput(event_type="OVERHEAD_VISION", barcode="8901030383120", observed_quantity=1),
    ]

    result = engine.evaluate("SES-TEST-05", cart, events)
    assert result.verification_status == "REVIEW_REQUIRED"
    assert any(d.discrepancy_type == "PRODUCT_MISMATCH" for d in result.discrepancies)


def test_empty_cart(engine):
    """Cart is empty: returns VERIFICATION_INCOMPLETE without false alerts."""
    result = engine.evaluate("SES-TEST-06", cart_items=[], verification_events=[])
    assert result.verification_status == "VERIFICATION_INCOMPLETE"
    assert result.risk_score == 0
    assert result.is_clean is False


def test_missing_verification_data(engine):
    """Customer has items, but verification sensors have not transmitted data yet."""
    cart = [
        CartItemInput(product_id=1, barcode="8901030383120", name="Rice", quantity=1, unit_price=6.49),
    ]
    result = engine.evaluate("SES-TEST-07", cart_items=cart, verification_events=[])
    assert result.verification_status == "VERIFICATION_INCOMPLETE"
    assert result.is_clean is False
    assert any(d.discrepancy_type == "INSUFFICIENT_DATA" for d in result.discrepancies)
