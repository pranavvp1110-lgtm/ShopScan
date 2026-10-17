"""
ScanGuard AI - ORM Models & Pydantic Schemas
Defines full retail catalog, shopping sessions, cart items, simulated verification feeds,
transactions, and discrepancy audit history.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from database import Base

# ==========================================
# SQLAlchemy ORM Models
# ==========================================

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    price = Column(Float, nullable=False)
    inventory_quantity = Column(Integer, default=50)
    image_url = Column(String(512), nullable=False)
    weight_grams = Column(Float, default=250.0)
    description = Column(Text, default="")

    cart_items = relationship("CartItem", back_populates="product")


class ShoppingSession(Base):
    __tablename__ = "shopping_sessions"

    id = Column(String(64), primary_key=True, index=True)  # e.g., "SES-4892"
    session_status = Column(String(32), default="ACTIVE")  # ACTIVE, VERIFYING, COMPLETED, FLAGGED
    customer_name = Column(String(64), default="Demo Customer")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)  # Captured at addition for integrity
    added_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="cart_items")


class VerificationEvent(Base):
    __tablename__ = "verification_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)  # CAMERA_AI_DETECTION, SMART_SCALE, OVERHEAD_CAM, MANUAL_SCAN
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    barcode = Column(String(64), nullable=True)
    expected_quantity = Column(Integer, nullable=True)
    observed_quantity = Column(Integer, nullable=True)
    event_source = Column(String(128), default="Smart Cart Overhead Vision")
    timestamp = Column(DateTime, default=datetime.utcnow)
    raw_metadata = Column(Text, default="{}")

    product = relationship("Product")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, index=True)  # e.g., "TXN-7391-8820"
    session_id = Column(String(64), nullable=False, index=True)
    customer_name = Column(String(64), default="Demo Customer")
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    item_count = Column(Integer, default=0)
    items_snapshot = Column(Text, default="[]")  # JSON snapshot of purchased items
    payment_status = Column(String(32), default="SIMULATED_SUCCESS")
    payment_method = Column(String(32), default="Apple Pay")
    verification_status = Column(String(32), default="LOW_RISK")  # LOW_RISK, REVIEW_REQUIRED, VERIFICATION_INCOMPLETE
    risk_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class DiscrepancyRecord(Base):
    __tablename__ = "discrepancy_records"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    transaction_id = Column(String(64), nullable=True, index=True)
    product_id = Column(Integer, nullable=True)
    product_name = Column(String(128), nullable=True)
    barcode = Column(String(64), nullable=True)
    discrepancy_type = Column(String(64), nullable=False)  # MISSED_SCAN, QUANTITY_MISMATCH, UNKNOWN_BARCODE, PRODUCT_MISMATCH
    description = Column(Text, nullable=False)
    risk_level = Column(String(32), default="MEDIUM")  # LOW, MEDIUM, HIGH
    expected_quantity = Column(Integer, nullable=True)
    observed_quantity = Column(Integer, nullable=True)
    resolution_status = Column(String(32), default="PENDING")  # PENDING, RESOLVED, DISMISSED
    resolution_reason = Column(Text, nullable=True)
    resolved_by = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


# ==========================================
# Pydantic Schemas for API Requests & Responses
# ==========================================

class ProductBase(BaseModel):
    barcode: str
    name: str
    category: str
    price: float
    inventory_quantity: int = 50
    image_url: str
    weight_grams: float = 250.0
    description: Optional[str] = ""

class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True

class CartItemCreate(BaseModel):
    product_id: Optional[int] = None
    barcode: Optional[str] = None
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    barcode: str
    category: str
    image_url: str
    unit_price: float
    quantity: int
    line_total: float
    weight_grams: float

class CartSummaryOut(BaseModel):
    session_id: str
    items: List[CartItemOut]
    item_count: int
    subtotal: float
    tax: float
    total: float
    calculated_weight_grams: float

class VerificationEventCreate(BaseModel):
    event_type: str
    product_id: Optional[int] = None
    barcode: Optional[str] = None
    expected_quantity: Optional[int] = None
    observed_quantity: Optional[int] = None
    event_source: str = "Smart Cart Overhead Vision"
    raw_metadata: Optional[Dict[str, Any]] = None

class DiscrepancyOut(BaseModel):
    id: Optional[int] = None
    discrepancy_type: str
    description: str
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    barcode: Optional[str] = None
    expected_quantity: Optional[int] = None
    observed_quantity: Optional[int] = None
    risk_level: str
    recommended_action: str
    resolution_status: str = "PENDING"
    resolution_reason: Optional[str] = None
    resolved_by: Optional[str] = None

class VerificationResultOut(BaseModel):
    session_id: str
    verification_status: str  # LOW_RISK, REVIEW_REQUIRED, VERIFICATION_INCOMPLETE
    risk_score: int  # 0 to 100
    is_clean: bool
    summary: str
    recommended_action: str
    discrepancies: List[DiscrepancyOut]
    sensor_evidence: List[Dict[str, Any]]
    confidence_level: float
    verification_timestamp: str

class CheckoutRequest(BaseModel):
    session_id: str
    payment_method: str = "Apple Pay"
    allow_override_flag: bool = False  # Only allowed if resolved by staff

class CheckoutResponse(BaseModel):
    success: bool
    transaction_id: Optional[str] = None
    message: str
    receipt: Optional[Dict[str, Any]] = None
    discrepancies: Optional[List[DiscrepancyOut]] = None

class ResolveDiscrepancyRequest(BaseModel):
    discrepancy_id: int
    resolution_action: str  # RESOLVE or DISMISS
    resolution_reason: str
    staff_name: str = "Store Associate - Alex"
