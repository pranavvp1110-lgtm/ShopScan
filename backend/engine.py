"""
ScanGuard AI - Deterministic Loss Prevention & Verification Engine

Core loss-prevention engine that validates digital carts against simulated sensor & vision
verification data. Fully deterministic, rule-based, and decoupled for unit testing.

Verification Statuses:
- LOW_RISK: All available verification records match the digital cart.
- REVIEW_REQUIRED: One or more discrepancies detected that require re-scan or staff review.
- VERIFICATION_INCOMPLETE: Insufficient verification data available to assess physical basket contents.
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class CartItemInput:
    product_id: int
    barcode: str
    name: str
    quantity: int
    unit_price: float
    weight_grams: float = 0.0


@dataclass
class VerificationRecordInput:
    event_type: str  # CAMERA_AI_DETECTION, SMART_SCALE, OVERHEAD_VISION, BARCODE_SCAN
    product_id: Optional[int] = None
    barcode: Optional[str] = None
    product_name: Optional[str] = None
    expected_quantity: Optional[int] = None
    observed_quantity: Optional[int] = None
    event_source: str = "Smart Cart Overhead Vision"
    timestamp: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DiscrepancyItem:
    discrepancy_type: str  # MISSED_SCAN, QUANTITY_MISMATCH, UNKNOWN_BARCODE, PRODUCT_MISMATCH, INSUFFICIENT_DATA
    description: str
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    barcode: Optional[str] = None
    expected_quantity: Optional[int] = None
    observed_quantity: Optional[int] = None
    risk_level: str = "MEDIUM"  # LOW, MEDIUM, HIGH
    recommended_action: str = "Verify basket with store associate."


@dataclass
class EngineResult:
    session_id: str
    verification_status: str  # LOW_RISK, REVIEW_REQUIRED, VERIFICATION_INCOMPLETE
    risk_score: int  # 0 to 100
    is_clean: bool
    summary: str
    recommended_action: str
    discrepancies: List[DiscrepancyItem]
    sensor_evidence: List[Dict[str, Any]]
    confidence_level: float
    verification_timestamp: str


class LossPreventionEngine:
    """
    Deterministic verification engine comparing customer digital cart against
    explicit verification streams (e.g. overhead vision sensor, smart scale, gate sensors).
    """

    def __init__(self, catalogue_by_barcode: Optional[Dict[str, Dict[str, Any]]] = None):
        """
        catalogue_by_barcode: Mapping from barcode -> product dict with keys 'id', 'name', 'price', etc.
        """
        self.catalogue = catalogue_by_barcode or {}

    def evaluate(
        self,
        session_id: str,
        cart_items: List[CartItemInput],
        verification_events: List[VerificationRecordInput],
        allow_empty_cart: bool = False
    ) -> EngineResult:
        """
        Evaluates the cart against supplied verification events deterministically.
        """
        discrepancies: List[DiscrepancyItem] = []
        sensor_evidence: List[Dict[str, Any]] = []
        now_iso = datetime.utcnow().isoformat() + "Z"

        # Check 1: Empty Cart Handling
        if not cart_items and not allow_empty_cart:
            return EngineResult(
                session_id=session_id,
                verification_status="VERIFICATION_INCOMPLETE",
                risk_score=0,
                is_clean=False,
                summary="Digital cart is currently empty. Add products before verification.",
                recommended_action="Scan products to populate your digital cart.",
                discrepancies=[],
                sensor_evidence=[],
                confidence_level=0.0,
                verification_timestamp=now_iso
            )

        # Check 2: Missing Verification Data
        if not verification_events:
            return EngineResult(
                session_id=session_id,
                verification_status="VERIFICATION_INCOMPLETE",
                risk_score=15,
                is_clean=False,
                summary="Verification incomplete: No overhead camera or scale data captured for this session yet.",
                recommended_action="Place your items inside the smart basket to capture visual verification.",
                discrepancies=[
                    DiscrepancyItem(
                        discrepancy_type="INSUFFICIENT_DATA",
                        description="Physical verification data not received from smart sensors.",
                        risk_level="LOW",
                        recommended_action="Ensure items are in the detection zone."
                    )
                ],
                sensor_evidence=[],
                confidence_level=0.2,
                verification_timestamp=now_iso
            )

        # Build lookup tables for cart
        cart_by_barcode: Dict[str, CartItemInput] = {item.barcode: item for item in cart_items}
        cart_by_product_id: Dict[int, CartItemInput] = {item.product_id: item for item in cart_items}

        # Check 3: Check Scanned Barcodes Validity against Catalogue
        for item in cart_items:
            if self.catalogue and item.barcode not in self.catalogue:
                discrepancies.append(
                    DiscrepancyItem(
                        discrepancy_type="UNKNOWN_BARCODE",
                        description=f"Scanned barcode '{item.barcode}' does not exist in the store catalogue.",
                        product_name=item.name,
                        barcode=item.barcode,
                        risk_level="HIGH",
                        recommended_action="Please re-scan the official product barcode or ask an associate."
                    )
                )
            elif self.catalogue and item.barcode in self.catalogue:
                cat_prod = self.catalogue[item.barcode]
                if cat_prod.get("id") != item.product_id:
                    discrepancies.append(
                        DiscrepancyItem(
                            discrepancy_type="PRODUCT_MISMATCH",
                            description=f"Product record mismatch: Selected item '{item.name}' (ID: {item.product_id}) does not match catalog record for barcode '{item.barcode}' ({cat_prod.get('name')}).",
                            product_id=item.product_id,
                            product_name=item.name,
                            barcode=item.barcode,
                            risk_level="HIGH",
                            recommended_action="Scan product directly using the app scanner."
                        )
                    )

        # Aggregate verification records by barcode / product
        observed_counts_by_barcode: Dict[str, int] = {}
        observed_counts_by_id: Dict[int, int] = {}
        observed_product_names: Dict[str, str] = {}

        for event in verification_events:
            sensor_evidence.append({
                "source": event.event_source,
                "type": event.event_type,
                "barcode": event.barcode,
                "product_name": event.product_name,
                "observed_quantity": event.observed_quantity,
                "expected_quantity": event.expected_quantity,
                "metadata": event.metadata
            })

            # Tally counts from verification events
            qty = event.observed_quantity if event.observed_quantity is not None else 1
            if event.barcode:
                observed_counts_by_barcode[event.barcode] = observed_counts_by_barcode.get(event.barcode, 0) + qty
                if event.product_name:
                    observed_product_names[event.barcode] = event.product_name
            elif event.product_id:
                observed_counts_by_id[event.product_id] = observed_counts_by_id.get(event.product_id, 0) + qty

        # Check 4: Compare Observed items against Cart
        # (a) Check for Missed Scans (item observed in physical verification but absent in cart)
        for barcode, observed_qty in observed_counts_by_barcode.items():
            if barcode not in cart_by_barcode:
                prod_name = observed_product_names.get(barcode)
                if not prod_name and self.catalogue and barcode in self.catalogue:
                    prod_name = self.catalogue[barcode].get("name")
                prod_name = prod_name or f"Unidentified Item [{barcode}]"

                discrepancies.append(
                    DiscrepancyItem(
                        discrepancy_type="MISSED_SCAN",
                        description=f"Review required: verification data includes {observed_qty}x '{prod_name}', which is not present in the digital cart.",
                        barcode=barcode,
                        expected_quantity=0,
                        observed_quantity=observed_qty,
                        product_name=prod_name,
                        risk_level="HIGH",
                        recommended_action="Ask the customer to scan the missing item or have staff verify the basket."
                    )
                )

        # (b) Check for Quantity Mismatches (item in cart vs verification count)
        for barcode, cart_item in cart_by_barcode.items():
            if barcode in observed_counts_by_barcode:
                observed_qty = observed_counts_by_barcode[barcode]
                if observed_qty != cart_item.quantity:
                    diff = observed_qty - cart_item.quantity
                    direction = "excess" if diff > 0 else "fewer"
                    discrepancies.append(
                        DiscrepancyItem(
                            discrepancy_type="QUANTITY_MISMATCH",
                            description=f"Quantity mismatch for '{cart_item.name}': Cart has {cart_item.quantity} unit(s), while verification sensors detected {observed_qty} unit(s) ({abs(diff)} {direction}).",
                            product_id=cart_item.product_id,
                            product_name=cart_item.name,
                            barcode=barcode,
                            expected_quantity=cart_item.quantity,
                            observed_quantity=observed_qty,
                            risk_level="HIGH" if diff > 0 else "MEDIUM",
                            recommended_action=f"Adjust quantity for '{cart_item.name}' or request associate basket check."
                        )
                    )

        # (c) Check for weight discrepancies if weight sensor metadata is present
        total_cart_weight = sum(item.weight_grams * item.quantity for item in cart_items)
        scale_events = [e for e in verification_events if e.event_type == "SMART_SCALE"]
        for se in scale_events:
            observed_weight = se.metadata.get("measured_weight_grams")
            if observed_weight is not None and total_cart_weight > 0:
                # 15% tolerance margin for packaging / scale calibration
                weight_diff = observed_weight - total_cart_weight
                tolerance = max(80.0, total_cart_weight * 0.15)
                if abs(weight_diff) > tolerance and not any(d.discrepancy_type in ("MISSED_SCAN", "QUANTITY_MISMATCH") for d in discrepancies):
                    discrepancies.append(
                        DiscrepancyItem(
                            discrepancy_type="QUANTITY_MISMATCH",
                            description=f"Basket scale variance detected: Expected ~{int(total_cart_weight)}g, measured {int(observed_weight)}g (Δ {int(weight_diff)}g).",
                            risk_level="MEDIUM",
                            recommended_action="Quick associate item count verification recommended."
                        )
                    )

        # Compute Risk Score & Status
        if not discrepancies:
            verification_status = "LOW_RISK"
            risk_score = 0
            is_clean = True
            summary = "All cart items match overhead camera and smart scale verification records."
            recommended_action = "Approved for seamless digital checkout."
            confidence = 0.98
        else:
            verification_status = "REVIEW_REQUIRED"
            high_count = sum(1 for d in discrepancies if d.risk_level == "HIGH")
            risk_score = min(100, 40 + (high_count * 25) + (len(discrepancies) * 10))
            is_clean = False
            first_disc = discrepancies[0]
            summary = f"Review required: {first_disc.description}"
            recommended_action = first_disc.recommended_action
            confidence = 0.92

        return EngineResult(
            session_id=session_id,
            verification_status=verification_status,
            risk_score=risk_score,
            is_clean=is_clean,
            summary=summary,
            recommended_action=recommended_action,
            discrepancies=discrepancies,
            sensor_evidence=sensor_evidence,
            confidence_level=confidence,
            verification_timestamp=now_iso
        )
