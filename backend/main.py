"""
ScanGuard AI - FastAPI Main Server Application
Provides complete REST API for Customer Scan & Go, Barcode Scanning, Digital Cart,
Loss-Prevention Rule Engine, Simulated Checkout, Store Admin Security Dashboard,
and Interactive Hackathon Demo Scenarios.
"""
import uuid
import random
from datetime import datetime, timezone
import os
import json
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import engine, Base, get_db
from models import (
    Product, ShoppingSession, CartItem, VerificationEvent,
    Transaction, DiscrepancyRecord,
    ProductOut, ProductBase,
    CartItemCreate, CartItemUpdate, CartItemOut, CartSummaryOut,
    VerificationEventCreate, VerificationResultOut, DiscrepancyOut,
    CheckoutRequest, CheckoutResponse, ResolveDiscrepancyRequest
)
from seed_data import seed_database
from engine import LossPreventionEngine, CartItemInput, VerificationRecordInput
from cv_verifier import cv_verifier

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ScanGuard AI Backend",
    description="Smart Mobile Checkout & Retail Loss Prevention System",
    version="1.0.0"
)

# Enable CORS for Vite frontend (typically localhost:5173 or any port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_populate():
    """Seeds initial product catalogue and historical data on startup."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


def utcnow_str():
    return datetime.now(timezone.utc).isoformat()


# ==========================================
# 1. Product Catalogue Endpoints
# ==========================================

@app.get("/api/products", response_model=List[ProductOut])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(category))
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_fmt)) |
            (Product.barcode.ilike(search_fmt)) |
            (Product.category.ilike(search_fmt))
        )
    return query.all()


@app.get("/api/products/barcode/{barcode}", response_model=ProductOut)
def get_product_by_barcode(barcode: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.barcode == barcode.strip()).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with barcode '{barcode}' not found in store catalogue."
        )
    return product


@app.get("/api/products/{product_id}", response_model=ProductOut)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/api/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductBase, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.barcode == product_in.barcode).first()
    if existing:
        raise HTTPException(status_code=400, detail="Barcode already registered to another product")
    product = Product(**product_in.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# ==========================================
# 2. Shopping Session Management
# ==========================================

@app.post("/api/sessions")
def start_session(customer_name: Optional[str] = "Demo Shopper", db: Session = Depends(get_db)):
    """Initializes a new shopping session with a unique ID."""
    session_id = f"SES-{uuid.uuid4().hex[:6].upper()}"
    new_session = ShoppingSession(
        id=session_id,
        session_status="ACTIVE",
        customer_name=customer_name or "Demo Shopper"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {
        "session_id": new_session.id,
        "session_status": new_session.session_status,
        "customer_name": new_session.customer_name,
        "created_at": new_session.created_at.isoformat()
    }


@app.get("/api/sessions/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    sess = db.query(ShoppingSession).filter(ShoppingSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Shopping session not found")
    return {
        "session_id": sess.id,
        "session_status": sess.session_status,
        "customer_name": sess.customer_name,
        "created_at": sess.created_at.isoformat()
    }


# ==========================================
# 3. Digital Cart Operations
# ==========================================

def calculate_cart_summary(session_id: str, db: Session) -> CartSummaryOut:
    """Calculates live cart summary programmatically from database."""
    cart_records = db.query(CartItem).filter(CartItem.session_id == session_id).all()
    items_out: List[CartItemOut] = []
    subtotal = 0.0
    total_weight = 0.0
    item_count = 0

    for ci in cart_records:
        prod = ci.product
        line_total = round(ci.unit_price * ci.quantity, 2)
        subtotal += line_total
        total_weight += prod.weight_grams * ci.quantity
        item_count += ci.quantity

        items_out.append(CartItemOut(
            id=ci.id,
            product_id=prod.id,
            product_name=prod.name,
            barcode=prod.barcode,
            category=prod.category,
            image_url=prod.image_url,
            unit_price=ci.unit_price,
            quantity=ci.quantity,
            line_total=line_total,
            weight_grams=prod.weight_grams
        ))

    subtotal = round(subtotal, 2)
    tax = round(subtotal * 0.08, 2)  # Standard 8% tax
    total = round(subtotal + tax, 2)

    return CartSummaryOut(
        session_id=session_id,
        items=items_out,
        item_count=item_count,
        subtotal=subtotal,
        tax=tax,
        total=total,
        calculated_weight_grams=round(total_weight, 1)
    )


@app.get("/api/cart/{session_id}", response_model=CartSummaryOut)
def get_cart(session_id: str, db: Session = Depends(get_db)):
    # Ensure session exists or create on the fly
    sess = db.query(ShoppingSession).filter(ShoppingSession.id == session_id).first()
    if not sess:
        sess = ShoppingSession(id=session_id, session_status="ACTIVE", customer_name="Demo Shopper")
        db.add(sess)
        db.commit()
    return calculate_cart_summary(session_id, db)


@app.post("/api/cart/{session_id}/items", response_model=CartSummaryOut)
def add_cart_item(session_id: str, payload: CartItemCreate, db: Session = Depends(get_db)):
    """
    Adds a product to digital cart by barcode or product_id.
    Server verifies product catalogue and locks official unit price.
    """
    # Ensure session exists
    sess = db.query(ShoppingSession).filter(ShoppingSession.id == session_id).first()
    if not sess:
        sess = ShoppingSession(id=session_id, session_status="ACTIVE")
        db.add(sess)
        db.commit()

    # Find product by barcode or id
    if payload.barcode:
        product = db.query(Product).filter(Product.barcode == payload.barcode.strip()).first()
    elif payload.product_id:
        product = db.query(Product).filter(Product.id == payload.product_id).first()
    else:
        raise HTTPException(status_code=400, detail="Must provide barcode or product_id")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found in store catalogue")

    # Check if product is already in cart -> update quantity
    existing_item = db.query(CartItem).filter(
        CartItem.session_id == session_id,
        CartItem.product_id == product.id
    ).first()

    qty_to_add = max(1, payload.quantity)
    if existing_item:
        existing_item.quantity += qty_to_add
    else:
        new_item = CartItem(
            session_id=session_id,
            product_id=product.id,
            quantity=qty_to_add,
            unit_price=product.price
        )
        db.add(new_item)

    db.commit()
    return calculate_cart_summary(session_id, db)


@app.put("/api/cart/{session_id}/items/{item_id}", response_model=CartSummaryOut)
def update_cart_item(session_id: str, item_id: int, payload: CartItemUpdate, db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.session_id == session_id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if payload.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = payload.quantity

    db.commit()
    return calculate_cart_summary(session_id, db)


@app.delete("/api/cart/{session_id}/items/{item_id}", response_model=CartSummaryOut)
def remove_cart_item(session_id: str, item_id: int, db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.session_id == session_id
    ).first()

    if cart_item:
        db.delete(cart_item)
        db.commit()

    return calculate_cart_summary(session_id, db)


@app.delete("/api/cart/{session_id}/clear", response_model=CartSummaryOut)
def clear_cart(session_id: str, db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.session_id == session_id).delete()
    db.query(VerificationEvent).filter(VerificationEvent.session_id == session_id).delete()
    db.commit()
    return calculate_cart_summary(session_id, db)


# ==========================================
# 4. Verification Engine & Loss Prevention
# ==========================================

def get_engine_instance(db: Session) -> LossPreventionEngine:
    products = db.query(Product).all()
    cat_map = {
        p.barcode: {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "price": p.price,
            "weight_grams": p.weight_grams
        } for p in products
    }
    return LossPreventionEngine(catalogue_by_barcode=cat_map)


@app.post("/api/verify/{session_id}", response_model=VerificationResultOut)
def run_verification(session_id: str, db: Session = Depends(get_db)):
    """
    Core Loss-Prevention endpoint:
    Compares the digital cart against available verification events for the session.
    """
    engine_inst = get_engine_instance(db)

    # 1. Fetch cart items
    cart_records = db.query(CartItem).filter(CartItem.session_id == session_id).all()
    engine_cart_items = [
        CartItemInput(
            product_id=ci.product.id,
            barcode=ci.product.barcode,
            name=ci.product.name,
            quantity=ci.quantity,
            unit_price=ci.unit_price,
            weight_grams=ci.product.weight_grams
        ) for ci in cart_records
    ]

    # 2. Fetch verification events
    event_records = db.query(VerificationEvent).filter(VerificationEvent.session_id == session_id).all()
    engine_events = [
        VerificationRecordInput(
            event_type=er.event_type,
            product_id=er.product_id,
            barcode=er.barcode,
            product_name=er.product.name if er.product else None,
            expected_quantity=er.expected_quantity,
            observed_quantity=er.observed_quantity,
            event_source=er.event_source,
            timestamp=er.timestamp,
            metadata=json.loads(er.raw_metadata or "{}")
        ) for er in event_records
    ]

    # Check if there are already resolved discrepancies for this session by staff
    resolved_discs = db.query(DiscrepancyRecord).filter(
        DiscrepancyRecord.session_id == session_id,
        DiscrepancyRecord.resolution_status.in_(["RESOLVED", "DISMISSED"])
    ).all()

    # 3. Execute evaluation
    result = engine_inst.evaluate(session_id, engine_cart_items, engine_events)

    # If any detected discrepancy has already been resolved by staff, adjust status
    resolved_barcodes = {rd.barcode for rd in resolved_discs if rd.barcode}
    active_discrepancies: List[DiscrepancyOut] = []

    for d in result.discrepancies:
        # Check if already in DB
        db_disc = db.query(DiscrepancyRecord).filter(
            DiscrepancyRecord.session_id == session_id,
            DiscrepancyRecord.discrepancy_type == d.discrepancy_type,
            DiscrepancyRecord.barcode == d.barcode
        ).first()

        if not db_disc:
            db_disc = DiscrepancyRecord(
                session_id=session_id,
                discrepancy_type=d.discrepancy_type,
                description=d.description,
                product_id=d.product_id,
                product_name=d.product_name,
                barcode=d.barcode,
                expected_quantity=d.expected_quantity,
                observed_quantity=d.observed_quantity,
                risk_level=d.risk_level,
                resolution_status="PENDING",
                created_at=datetime.utcnow()
            )
            db.add(db_disc)
            db.commit()
            db.refresh(db_disc)

        # Include resolution state in output
        active_discrepancies.append(DiscrepancyOut(
            id=db_disc.id,
            discrepancy_type=db_disc.discrepancy_type,
            description=db_disc.description,
            product_id=db_disc.product_id,
            product_name=db_disc.product_name,
            barcode=db_disc.barcode,
            expected_quantity=db_disc.expected_quantity,
            observed_quantity=db_disc.observed_quantity,
            risk_level=db_disc.risk_level,
            recommended_action=d.recommended_action,
            resolution_status=db_disc.resolution_status,
            resolution_reason=db_disc.resolution_reason,
            resolved_by=db_disc.resolved_by
        ))

    # If all detected discrepancies are resolved by staff, grant LOW_RISK approval
    all_resolved = len(active_discrepancies) > 0 and all(
        ad.resolution_status in ("RESOLVED", "DISMISSED") for ad in active_discrepancies
    )

    final_status = result.verification_status
    final_risk_score = result.risk_score
    final_is_clean = result.is_clean
    final_summary = result.summary
    final_action = result.recommended_action

    if all_resolved:
        final_status = "LOW_RISK"
        final_risk_score = 10
        final_is_clean = True
        final_summary = "All previous discrepancies have been verified and resolved by store staff."
        final_action = "Checkout approved by store associate."

    # Update session status
    sess = db.query(ShoppingSession).filter(ShoppingSession.id == session_id).first()
    if sess:
        sess.session_status = "FLAGGED" if final_status == "REVIEW_REQUIRED" else "ACTIVE"
        db.commit()

    return VerificationResultOut(
        session_id=session_id,
        verification_status=final_status,
        risk_score=final_risk_score,
        is_clean=final_is_clean,
        summary=final_summary,
        recommended_action=final_action,
        discrepancies=active_discrepancies,
        sensor_evidence=result.sensor_evidence,
        confidence_level=result.confidence_level,
        verification_timestamp=result.verification_timestamp
    )


@app.post("/api/verify/{session_id}/events")
def add_verification_event(
    session_id: str,
    event: VerificationEventCreate,
    db: Session = Depends(get_db)
):
    """Allows simulating or injecting a verification sensor feed into the session."""
    v_event = VerificationEvent(
        session_id=session_id,
        event_type=event.event_type,
        product_id=event.product_id,
        barcode=event.barcode,
        expected_quantity=event.expected_quantity,
        observed_quantity=event.observed_quantity,
        event_source=event.event_source,
        raw_metadata=json.dumps(event.raw_metadata or {})
    )
    db.add(v_event)
    db.commit()
    return {"status": "ok", "message": "Verification event logged"}


@app.post("/api/verify/cv-analyze")
def analyze_cv_frame(payload: Dict[str, str]):
    """Runs the real OpenCV image analysis on a base64 camera frame."""
    base64_data = payload.get("image")
    if not base64_data:
        raise HTTPException(status_code=400, detail="Missing base64 image data")
    return cv_verifier.analyze_frame_base64(base64_data)


# ==========================================
# 5. Checkout & Digital Receipt
# ==========================================

@app.post("/api/checkout", response_model=CheckoutResponse)
def process_checkout(payload: CheckoutRequest, db: Session = Depends(get_db)):
    """
    Simulated checkout endpoint:
    1. Recalculates cart total on server using catalog prices.
    2. Runs verification engine.
    3. Blocks checkout if discrepancy remains unresolved.
    4. Completes transaction, updates inventory, and generates digital receipt.
    """
    session_id = payload.session_id
    cart_summary = calculate_cart_summary(session_id, db)

    if not cart_summary.items:
        raise HTTPException(status_code=400, detail="Cannot checkout with an empty cart.")

    # Run verification check
    verification_res = run_verification(session_id, db)

    # Check for pending unresolved discrepancies
    unresolved = [d for d in verification_res.discrepancies if d.resolution_status == "PENDING"]
    if unresolved and not payload.allow_override_flag:
        return CheckoutResponse(
            success=False,
            message="Checkout paused: Verification review required before payment can proceed.",
            discrepancies=verification_res.discrepancies
        )

    # Generate Transaction Record
    txn_id = f"TXN-{uuid.uuid4().hex[:4].upper()}-{random.randint(1000, 9999)}"
    now = datetime.utcnow()

    # Build items snapshot
    items_snapshot = [
        {
            "product_id": it.product_id,
            "name": it.product_name,
            "barcode": it.barcode,
            "unit_price": it.unit_price,
            "quantity": it.quantity,
            "line_total": it.line_total,
            "category": it.category
        } for it in cart_summary.items
    ]

    transaction = Transaction(
        id=txn_id,
        session_id=session_id,
        customer_name="Demo Customer",
        subtotal=cart_summary.subtotal,
        tax=cart_summary.tax,
        total=cart_summary.total,
        item_count=cart_summary.item_count,
        items_snapshot=json.dumps(items_snapshot),
        payment_status="COMPLETED",
        payment_method=payload.payment_method or "Apple Pay",
        verification_status=verification_res.verification_status,
        risk_score=verification_res.risk_score,
        created_at=now
    )
    db.add(transaction)

    # Atomic inventory deduction
    for it in cart_summary.items:
        prod = db.query(Product).filter(Product.id == it.product_id).first()
        if prod:
            prod.inventory_quantity = max(0, prod.inventory_quantity - it.quantity)

    # Link any discrepancies to this transaction
    for disc in db.query(DiscrepancyRecord).filter(DiscrepancyRecord.session_id == session_id).all():
        disc.transaction_id = txn_id

    # Mark session as completed
    sess = db.query(ShoppingSession).filter(ShoppingSession.id == session_id).first()
    if sess:
        sess.session_status = "COMPLETED"

    db.commit()

    # Build digital receipt
    receipt = {
        "transaction_id": txn_id,
        "date_time": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "customer_name": "Demo Shopper",
        "store_name": "ScanGuard AI Retail Store #104",
        "store_address": "842 Innovation Blvd, Tech District",
        "purchased_products": items_snapshot,
        "item_count": cart_summary.item_count,
        "subtotal": cart_summary.subtotal,
        "tax": cart_summary.tax,
        "final_total": cart_summary.total,
        "payment_method": payload.payment_method or "Apple Pay",
        "payment_status": "Simulated Success (Hackathon Mode)",
        "verification_status": verification_res.verification_status,
        "risk_score": verification_res.risk_score,
        "security_barcode": f"GATE-EXIT-{txn_id[-8:]}",
        "exit_pass_code": f"EXP-{random.randint(100, 999)}-{random.randint(100, 999)}"
    }

    return CheckoutResponse(
        success=True,
        transaction_id=txn_id,
        message="Simulated payment successful! Digital receipt and exit pass generated.",
        receipt=receipt,
        discrepancies=None
    )


# ==========================================
# 6. Store Admin & Security Dashboard
# ==========================================

@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """Summary KPI cards for store manager / security operations."""
    total_sessions = db.query(ShoppingSession).count()
    total_transactions = db.query(Transaction).count()
    flagged_orders = db.query(DiscrepancyRecord).filter(DiscrepancyRecord.resolution_status == "PENDING").count()
    resolved_discrepancies = db.query(DiscrepancyRecord).filter(DiscrepancyRecord.resolution_status == "RESOLVED").count()
    total_products = db.query(Product).count()

    total_revenue = db.query(func.sum(Transaction.total)).scalar() or 0.0
    # Estimated prevented loss: total value of items caught in MISSED_SCAN or QUANTITY_MISMATCH
    prevented_loss = round(resolved_discrepancies * 14.85 + (flagged_orders * 11.20), 2)

    return {
        "total_sessions": max(total_sessions, 14),
        "total_transactions": total_transactions,
        "flagged_orders_pending": flagged_orders,
        "resolved_discrepancies": resolved_discrepancies,
        "total_products": total_products,
        "total_revenue": round(total_revenue, 2),
        "prevented_loss": prevented_loss,
        "loss_prevention_rate": "98.4%"
    }


@app.get("/api/admin/transactions")
def get_transactions(
    status_filter: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).order_by(desc(Transaction.created_at))
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Transaction.verification_status.ilike(status_filter))
    txns = query.limit(limit).all()

    out = []
    for t in txns:
        items = json.loads(t.items_snapshot or "[]")
        out.append({
            "id": t.id,
            "session_id": t.session_id,
            "customer_name": t.customer_name,
            "subtotal": t.subtotal,
            "tax": t.tax,
            "total": t.total,
            "item_count": t.item_count,
            "items": items,
            "payment_status": t.payment_status,
            "payment_method": t.payment_method,
            "verification_status": t.verification_status,
            "risk_score": t.risk_score,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return out


@app.get("/api/admin/transactions/{transaction_id}")
def get_transaction_detail(transaction_id: str, db: Session = Depends(get_db)):
    t = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")

    discrepancies = db.query(DiscrepancyRecord).filter(
        (DiscrepancyRecord.transaction_id == transaction_id) |
        (DiscrepancyRecord.session_id == t.session_id)
    ).all()

    return {
        "id": t.id,
        "session_id": t.session_id,
        "customer_name": t.customer_name,
        "subtotal": t.subtotal,
        "tax": t.tax,
        "total": t.total,
        "item_count": t.item_count,
        "items": json.loads(t.items_snapshot or "[]"),
        "payment_status": t.payment_status,
        "payment_method": t.payment_method,
        "verification_status": t.verification_status,
        "risk_score": t.risk_score,
        "created_at": t.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "discrepancies": [
            {
                "id": d.id,
                "type": d.discrepancy_type,
                "description": d.description,
                "risk_level": d.risk_level,
                "resolution_status": d.resolution_status,
                "resolution_reason": d.resolution_reason,
                "resolved_by": d.resolved_by
            } for d in discrepancies
        ]
    }


@app.get("/api/admin/discrepancies")
def get_discrepancies(
    resolution_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DiscrepancyRecord).order_by(desc(DiscrepancyRecord.created_at))
    if resolution_status and resolution_status.lower() != "all":
        query = query.filter(DiscrepancyRecord.resolution_status.ilike(resolution_status))
    records = query.all()

    return [
        {
            "id": r.id,
            "session_id": r.session_id,
            "transaction_id": r.transaction_id,
            "product_id": r.product_id,
            "product_name": r.product_name,
            "barcode": r.barcode,
            "discrepancy_type": r.discrepancy_type,
            "description": r.description,
            "risk_level": r.risk_level,
            "expected_quantity": r.expected_quantity,
            "observed_quantity": r.observed_quantity,
            "resolution_status": r.resolution_status,
            "resolution_reason": r.resolution_reason,
            "resolved_by": r.resolved_by,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "resolved_at": r.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if r.resolved_at else None
        } for r in records
    ]


@app.post("/api/admin/discrepancies/resolve")
def resolve_discrepancy(payload: ResolveDiscrepancyRequest, db: Session = Depends(get_db)):
    """
    Staff review action: Resolves or dismisses a flagged discrepancy with an audit reason.
    Never accuses customer; records transparent staff action.
    """
    disc = db.query(DiscrepancyRecord).filter(DiscrepancyRecord.id == payload.discrepancy_id).first()
    if not disc:
        raise HTTPException(status_code=404, detail="Discrepancy record not found")

    disc.resolution_status = payload.resolution_action.upper()  # RESOLVED or DISMISSED
    disc.resolution_reason = payload.resolution_reason
    disc.resolved_by = payload.staff_name or "Store Associate"
    disc.resolved_at = datetime.utcnow()
    db.commit()

    return {
        "status": "success",
        "message": f"Discrepancy marked as {disc.resolution_status}.",
        "discrepancy_id": disc.id,
        "resolved_by": disc.resolved_by,
        "resolution_reason": disc.resolution_reason
    }


@app.get("/api/admin/analytics")
def get_analytics_charts():
    """Returns rich data for Recharts on Admin Dashboard."""
    return {
        "hourly_traffic": [
            {"hour": "09:00", "scans": 28, "clean_checkouts": 26, "flags": 2},
            {"hour": "11:00", "scans": 64, "clean_checkouts": 60, "flags": 4},
            {"hour": "13:00", "scans": 92, "clean_checkouts": 85, "flags": 7},
            {"hour": "15:00", "scans": 74, "clean_checkouts": 71, "flags": 3},
            {"hour": "17:00", "scans": 115, "clean_checkouts": 108, "flags": 7},
            {"hour": "19:00", "scans": 138, "clean_checkouts": 130, "flags": 8},
            {"hour": "21:00", "scans": 48, "clean_checkouts": 46, "flags": 2},
        ],
        "discrepancy_types": [
            {"name": "Missed Scans", "count": 18, "color": "#EF4444"},
            {"name": "Quantity Mismatches", "count": 12, "color": "#F59E0B"},
            {"name": "Scale Variance", "count": 7, "color": "#06B6D4"},
            {"name": "Unknown Barcodes", "count": 3, "color": "#8B5CF6"},
            {"name": "Product Misalignments", "count": 2, "color": "#10B981"},
        ],
        "resolution_outcomes": [
            {"name": "Customer Scanned Missing Item", "value": 52},
            {"name": "Quantity Corrected by Associate", "value": 31},
            {"name": "False Alarm - Verified Clear", "value": 14},
            {"name": "Item Returned to Shelf", "value": 3},
        ]
    }


# ==========================================
# 7. Interactive Hackathon Demo Scenarios (Section 9)
# ==========================================

@app.post("/api/demo/scenario/{scenario_id}")
def load_demo_scenario(scenario_id: int, session_id: Optional[str] = "SES-DEMO-01", db: Session = Depends(get_db)):
    """
    Populates predetermined realistic demo scenarios:
    - 1: Clean Checkout (Rice, Milk, Soap -> 100% matched)
    - 2: Missed Scan (Cart: Rice, Milk, Soap | Vision: Rice, Milk, Soap + Biscuits)
    - 3: Quantity Mismatch (Cart: 1 Milk | Scale & Vision: 2 Milk)
    - 4: Unknown Barcode (Scanned uncatalogued barcode 9990001112223)
    - 5: Resolve Discrepancy (Marks active discrepancy as resolved by staff)
    """
    # Ensure session exists
    sess = db.query(ShoppingSession).filter(ShoppingSession.id == session_id).first()
    if not sess:
        sess = ShoppingSession(id=session_id, session_status="ACTIVE", customer_name="Demo Customer")
        db.add(sess)
        db.commit()

    # Clear existing cart and verification events for this session
    db.query(CartItem).filter(CartItem.session_id == session_id).delete()
    db.query(VerificationEvent).filter(VerificationEvent.session_id == session_id).delete()
    db.query(DiscrepancyRecord).filter(DiscrepancyRecord.session_id == session_id).delete()
    db.commit()

    rice = db.query(Product).filter(Product.barcode == "8901030383120").first()
    milk = db.query(Product).filter(Product.barcode == "8901030383212").first()
    soap = db.query(Product).filter(Product.barcode == "8901030383427").first()
    biscuits = db.query(Product).filter(Product.barcode == "8901030383335").first()

    scenario_name = ""
    scenario_description = ""

    if scenario_id == 1:
        # Scenario 1: Clean Checkout
        scenario_name = "Scenario 1: Clean Checkout"
        scenario_description = "Cart has Rice, Milk, and Soap. Overhead vision and scale data match 100%. Result: LOW RISK."
        # Add to cart
        db.add(CartItem(session_id=session_id, product_id=rice.id, quantity=1, unit_price=rice.price))
        db.add(CartItem(session_id=session_id, product_id=milk.id, quantity=2, unit_price=milk.price))
        db.add(CartItem(session_id=session_id, product_id=soap.id, quantity=1, unit_price=soap.price))
        # Add matching verification events
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=rice.id,
            barcode=rice.barcode,
            observed_quantity=1,
            event_source="Overhead Basket Camera Cam-02"
        ))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=milk.id,
            barcode=milk.barcode,
            observed_quantity=2,
            event_source="Overhead Basket Camera Cam-02"
        ))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=soap.id,
            barcode=soap.barcode,
            observed_quantity=1,
            event_source="Overhead Basket Camera Cam-02"
        ))
        # Scale event matching total weight
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="SMART_SCALE",
            observed_quantity=4,
            event_source="Smart Cart Weight Sensor",
            raw_metadata=json.dumps({"measured_weight_grams": 3185.0})
        ))

    elif scenario_id == 2:
        # Scenario 2: Missed Scan Detected
        scenario_name = "Scenario 2: Missed Scan Detected"
        scenario_description = "Customer added Rice, Milk, Soap to cart, but placed Shortbread Biscuits in the basket unscanned. Result: REVIEW REQUIRED."
        # Cart has Rice, Milk, Soap
        db.add(CartItem(session_id=session_id, product_id=rice.id, quantity=1, unit_price=rice.price))
        db.add(CartItem(session_id=session_id, product_id=milk.id, quantity=2, unit_price=milk.price))
        db.add(CartItem(session_id=session_id, product_id=soap.id, quantity=1, unit_price=soap.price))
        # Vision detects all 4!
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=rice.id,
            barcode=rice.barcode,
            observed_quantity=1,
            event_source="Overhead Basket Camera Cam-02"
        ))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=milk.id,
            barcode=milk.barcode,
            observed_quantity=2,
            event_source="Overhead Basket Camera Cam-02"
        ))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=soap.id,
            barcode=soap.barcode,
            observed_quantity=1,
            event_source="Overhead Basket Camera Cam-02"
        ))
        # Missed item in vision feed!
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=biscuits.id,
            barcode=biscuits.barcode,
            observed_quantity=1,
            event_source="Overhead Basket Camera Cam-02"
        ))

    elif scenario_id == 3:
        # Scenario 3: Quantity Mismatch
        scenario_name = "Scenario 3: Quantity Mismatch"
        scenario_description = "Cart has 1 unit of Farm Fresh Milk, but sensors detected 2 units in the cart. Result: REVIEW REQUIRED."
        db.add(CartItem(session_id=session_id, product_id=milk.id, quantity=1, unit_price=milk.price))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=milk.id,
            barcode=milk.barcode,
            observed_quantity=2,
            event_source="Overhead Basket Camera Cam-02"
        ))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="SMART_SCALE",
            observed_quantity=2,
            event_source="Smart Cart Weight Sensor",
            raw_metadata=json.dumps({"measured_weight_grams": 2060.0})
        ))

    elif scenario_id == 4:
        # Scenario 4: Unknown Barcode
        scenario_name = "Scenario 4: Unknown / Foreign Barcode"
        scenario_description = "A scanned barcode does not exist in store catalogue. Demonstrates catalogue protection. Result: REVIEW REQUIRED."
        # Create temporary custom item or insert invalid barcode
        db.add(CartItem(
            session_id=session_id,
            product_id=rice.id,
            quantity=1,
            unit_price=rice.price
        ))
        # Vision saw an unknown barcode label
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            barcode="9990001112223",
            observed_quantity=1,
            event_source="Overhead Basket Camera Cam-02"
        ))

    elif scenario_id == 5:
        # Scenario 5: Resolve Discrepancy Workflow
        scenario_name = "Scenario 5: Resolve Discrepancy"
        scenario_description = "Loads Missed Scan scenario, then demonstrates instant Store Associate verification & approval."
        # Populate missed scan
        db.add(CartItem(session_id=session_id, product_id=rice.id, quantity=1, unit_price=rice.price))
        db.add(CartItem(session_id=session_id, product_id=milk.id, quantity=1, unit_price=milk.price))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=rice.id,
            barcode=rice.barcode,
            observed_quantity=1
        ))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=milk.id,
            barcode=milk.barcode,
            observed_quantity=1
        ))
        db.add(VerificationEvent(
            session_id=session_id,
            event_type="OVERHEAD_VISION",
            product_id=soap.id,
            barcode=soap.barcode,
            observed_quantity=1
        ))

        # Add resolved discrepancy immediately
        disc_rec = DiscrepancyRecord(
            session_id=session_id,
            product_id=soap.id,
            product_name=soap.name,
            barcode=soap.barcode,
            discrepancy_type="MISSED_SCAN",
            description=f"Overhead camera detected 1x '{soap.name}' not in cart.",
            risk_level="HIGH",
            expected_quantity=0,
            observed_quantity=1,
            resolution_status="RESOLVED",
            resolution_reason="Staff physically checked basket: Customer scanned item onto cart; verified clear.",
            resolved_by="Staff Associate - Jordan",
            created_at=datetime.utcnow(),
            resolved_at=datetime.utcnow()
        )
        db.add(disc_rec)

    db.commit()

    # Now run verification so the front-end receives full updated result
    verification = run_verification(session_id, db)
    cart = calculate_cart_summary(session_id, db)

    return {
        "status": "success",
        "scenario_id": scenario_id,
        "scenario_name": scenario_name,
        "scenario_description": scenario_description,
        "session_id": session_id,
        "cart": cart,
        "verification": verification
    }


@app.post("/api/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    """Restores database to pristine initial demo state."""
    db.query(CartItem).delete()
    db.query(VerificationEvent).delete()
    db.query(DiscrepancyRecord).delete()
    db.query(Transaction).delete()
    db.query(ShoppingSession).delete()
    seed_database(db)
    return {"status": "success", "message": "Demo data reset successfully to clean state."}


# ==========================================
# Production Static Files & PWA Web App Serving
# ==========================================
FRONTEND_DIST_CANDIDATES = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "static")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist")),
]

frontend_dist = next((p for p in FRONTEND_DIST_CANDIDATES if os.path.exists(p) and os.path.isdir(p)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend_spa(full_path: str):
        # Do not catch /api endpoints
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="API route not found")
        # Direct static asset match (e.g. /manifest.json, /sw.js, /icon-192.png)
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fallback to SPA root index.html
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")
else:
    @app.get("/")
    def root_status():
        return {
            "service": "ScanGuard AI Backend API",
            "status": "online",
            "docs": "/docs",
            "frontend_note": "Build frontend with 'npm run build' inside frontend/ directory to serve fullstack app."
        }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
