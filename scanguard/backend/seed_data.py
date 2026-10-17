"""
ScanGuard AI - Comprehensive Seed Data
Contains 24 realistic supermarket products across 5 categories with EAN-13 barcodes,
crisp Unsplash product images, realistic weights, and initial store transaction history.
"""
from datetime import datetime, timedelta
import random
from models import Product, ShoppingSession, CartItem, Transaction, DiscrepancyRecord, VerificationEvent

INITIAL_PRODUCTS = [
    # --- Groceries ---
    {
        "id": 1,
        "barcode": "8901030383120",
        "name": "Organic Basmati Royal Rice (1kg)",
        "category": "Groceries",
        "price": 6.49,
        "inventory_quantity": 85,
        "weight_grams": 1000.0,
        "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
        "description": "Extra long grain aged fragrant basmati rice, naturally nurtured."
    },
    {
        "id": 2,
        "barcode": "8901030383137",
        "name": "Artisan Sourdough Loaf",
        "category": "Groceries",
        "price": 4.25,
        "inventory_quantity": 42,
        "weight_grams": 450.0,
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
        "description": "Crispy golden crust with soft, airy open crumb fermented for 24 hours."
    },
    {
        "id": 3,
        "barcode": "8901030383144",
        "name": "Extra Virgin Olive Oil (500ml)",
        "category": "Groceries",
        "price": 11.99,
        "inventory_quantity": 30,
        "weight_grams": 650.0,
        "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
        "description": "First cold pressed Mediterranean olive oil with peppery finish."
    },
    {
        "id": 4,
        "barcode": "8901030383151",
        "name": "Barilla Italian Penne Rigate Pasta",
        "category": "Groceries",
        "price": 2.89,
        "inventory_quantity": 110,
        "weight_grams": 500.0,
        "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80",
        "description": "100% durum wheat semolina pasta with ridges that hold sauce perfectly."
    },
    {
        "id": 5,
        "barcode": "8901030383168",
        "name": "Organic Hass Avocados (Pack of 3)",
        "category": "Groceries",
        "price": 4.99,
        "inventory_quantity": 55,
        "weight_grams": 550.0,
        "image_url": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
        "description": "Creamy, ripe, nutrient-rich ready-to-eat Hass avocados."
    },

    # --- Beverages ---
    {
        "id": 6,
        "barcode": "8901030383212",
        "name": "Farm Fresh Whole Milk (1L)",
        "category": "Beverages",
        "price": 3.19,
        "inventory_quantity": 60,
        "weight_grams": 1030.0,
        "image_url": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
        "description": "Pasteurized grade A whole milk with natural vitamin D."
    },
    {
        "id": 7,
        "barcode": "8901030383229",
        "name": "Cold Brew Espresso Concentrate (750ml)",
        "category": "Beverages",
        "price": 7.49,
        "inventory_quantity": 38,
        "weight_grams": 820.0,
        "image_url": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
        "description": "Smooth dark roast steeped for 18 hours with hints of cocoa."
    },
    {
        "id": 8,
        "barcode": "8901030383236",
        "name": "Sparkling Mineral Water Lemon (1.25L)",
        "category": "Beverages",
        "price": 1.99,
        "inventory_quantity": 90,
        "weight_grams": 1300.0,
        "image_url": "https://images.unsplash.com/photo-1559839914-ba2a0f8bfd47?auto=format&fit=crop&w=600&q=80",
        "description": "Naturally carbonated mineral water infused with Sicilian lemon zest."
    },
    {
        "id": 9,
        "barcode": "8901030383243",
        "name": "Organic 100% Valencia Orange Juice",
        "category": "Beverages",
        "price": 4.79,
        "inventory_quantity": 45,
        "weight_grams": 1050.0,
        "image_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
        "description": "Pure pressed fresh orange juice with gentle pulp and no added sugar."
    },
    {
        "id": 10,
        "barcode": "8901030383250",
        "name": "Pure Japanese Matcha Green Tea (100g)",
        "category": "Beverages",
        "price": 14.50,
        "inventory_quantity": 25,
        "weight_grams": 120.0,
        "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
        "description": "Ceremonial grade stone ground Uji matcha powder."
    },

    # --- Snacks & Treats ---
    {
        "id": 11,
        "barcode": "8901030383311",
        "name": "Dark Chocolate Sea Salt Bar (85%)",
        "category": "Snacks",
        "price": 3.75,
        "inventory_quantity": 120,
        "weight_grams": 100.0,
        "image_url": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
        "description": "Single-origin fair trade cocoa finished with hand-harvested sea salt."
    },
    {
        "id": 12,
        "barcode": "8901030383328",
        "name": "Roasted Almonds with Rosemary (200g)",
        "category": "Snacks",
        "price": 5.99,
        "inventory_quantity": 64,
        "weight_grams": 210.0,
        "image_url": "https://images.unsplash.com/photo-1508061252966-f72fbef80e34?auto=format&fit=crop&w=600&q=80",
        "description": "Slow-roasted California almonds with fresh rosemary and cracked pepper."
    },
    {
        "id": 13,
        "barcode": "8901030383335",
        "name": "Artisan Butter Shortbread Biscuits",
        "category": "Snacks",
        "price": 3.49,
        "inventory_quantity": 78,
        "weight_grams": 220.0,
        "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
        "description": "Traditional Scottish-recipe melted butter biscuits with subtle crunch."
    },
    {
        "id": 14,
        "barcode": "8901030383342",
        "name": "Himalayan Pink Salt Kettle Chips",
        "category": "Snacks",
        "price": 2.49,
        "inventory_quantity": 95,
        "weight_grams": 150.0,
        "image_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
        "description": "Batch fried in small kettles for deep potato crunch and natural salt flavor."
    },

    # --- Personal Care ---
    {
        "id": 15,
        "barcode": "8901030383410",
        "name": "Botanical Lavender Body Wash (500ml)",
        "category": "Personal Care",
        "price": 8.99,
        "inventory_quantity": 40,
        "weight_grams": 540.0,
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
        "description": "Sulfate-free hydrating body wash with French lavender essential oil."
    },
    {
        "id": 16,
        "barcode": "8901030383427",
        "name": "Shea Butter Handcrafted Soap Bar",
        "category": "Personal Care",
        "price": 4.19,
        "inventory_quantity": 88,
        "weight_grams": 125.0,
        "image_url": "https://images.unsplash.com/photo-1607006314180-3077759526b7?auto=format&fit=crop&w=600&q=80",
        "description": "Ultra-gentle moisturizing bar with cold-pressed African shea butter."
    },
    {
        "id": 17,
        "barcode": "8901030383434",
        "name": "Natural Charcoal Whitening Toothpaste",
        "category": "Personal Care",
        "price": 5.49,
        "inventory_quantity": 52,
        "weight_grams": 140.0,
        "image_url": "https://images.unsplash.com/photo-1559591937-e1032c5ef2ff?auto=format&fit=crop&w=600&q=80",
        "description": "Fluoride-free whitening toothpaste with activated coconut charcoal and mint."
    },
    {
        "id": 18,
        "barcode": "8901030383441",
        "name": "Mineral Daily Sunscreen SPF 50",
        "category": "Personal Care",
        "price": 13.99,
        "inventory_quantity": 35,
        "weight_grams": 110.0,
        "image_url": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
        "description": "Reef-safe non-nano zinc oxide facial sunscreen with zero white cast."
    },

    # --- Household Essentials ---
    {
        "id": 19,
        "barcode": "8901030383519",
        "name": "Plant-Based Dishwashing Liquid (750ml)",
        "category": "Household",
        "price": 4.89,
        "inventory_quantity": 70,
        "weight_grams": 810.0,
        "image_url": "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
        "description": "Tough on grease, gentle on skin, made with 100% biodegradable ingredients."
    },
    {
        "id": 20,
        "barcode": "8901030383526",
        "name": "Multi-Surface Citrus Cleaning Spray",
        "category": "Household",
        "price": 5.29,
        "inventory_quantity": 48,
        "weight_grams": 600.0,
        "image_url": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80",
        "description": "Disinfects 99.9% of germs with natural grapefruit & lemon essential extracts."
    },
    {
        "id": 21,
        "barcode": "8901030383533",
        "name": "Bamboo Eco-Friendly Paper Towels (3 Rolls)",
        "category": "Household",
        "price": 6.99,
        "inventory_quantity": 62,
        "weight_grams": 480.0,
        "image_url": "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80",
        "description": "Super absorbent, bleach-free sustainable bamboo paper rolls."
    },
    {
        "id": 22,
        "barcode": "8901030383540",
        "name": "Lavender Laundry Detergent Pods (30 Count)",
        "category": "Household",
        "price": 12.49,
        "inventory_quantity": 44,
        "weight_grams": 650.0,
        "image_url": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
        "description": "Concentrated 3-in-1 stain remover, color brightener, and fabric softener."
    },
    {
        "id": 23,
        "barcode": "8901030383557",
        "name": "Scented Soy Wax Amber Candle",
        "category": "Household",
        "price": 9.99,
        "inventory_quantity": 35,
        "weight_grams": 380.0,
        "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
        "description": "Hand-poured 100% natural soy wax with cedarwood and warm amber notes."
    },
    {
        "id": 24,
        "barcode": "8901030383564",
        "name": "Compostable Heavy-Duty Trash Bags (25 Pack)",
        "category": "Household",
        "price": 7.89,
        "inventory_quantity": 50,
        "weight_grams": 400.0,
        "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
        "description": "Cornstarch-based leak-proof compostable bags certified for municipal waste."
    }
]

def seed_database(db):
    """Initializes catalogue and historical transactions if empty."""
    # Seed products
    for p_data in INITIAL_PRODUCTS:
        existing = db.query(Product).filter(Product.barcode == p_data["barcode"]).first()
        if not existing:
            product = Product(**p_data)
            db.add(product)
    db.commit()

    # Seed some sample historical transactions if none exist
    if db.query(Transaction).count() == 0:
        now = datetime.utcnow()
        sample_txns = [
            {
                "id": "TXN-9041-1021",
                "session_id": "SES-HIST-01",
                "customer_name": "Sarah Jenkins",
                "subtotal": 19.42,
                "tax": 1.55,
                "total": 20.97,
                "item_count": 3,
                "items_snapshot": '[{"name": "Organic Basmati Royal Rice (1kg)", "quantity": 1, "price": 6.49}, {"name": "Farm Fresh Whole Milk (1L)", "quantity": 2, "price": 3.19}, {"name": "Artisan Sourdough Loaf", "quantity": 1, "price": 4.25}]',
                "payment_status": "COMPLETED",
                "payment_method": "Apple Pay",
                "verification_status": "LOW_RISK",
                "risk_score": 0,
                "created_at": now - timedelta(hours=3, minutes=12)
            },
            {
                "id": "TXN-9042-1022",
                "session_id": "SES-HIST-02",
                "customer_name": "Marcus Vance",
                "subtotal": 28.96,
                "tax": 2.32,
                "total": 31.28,
                "item_count": 4,
                "items_snapshot": '[{"name": "Extra Virgin Olive Oil (500ml)", "quantity": 1, "price": 11.99}, {"name": "Barilla Italian Penne Rigate Pasta", "quantity": 2, "price": 2.89}, {"name": "Dark Chocolate Sea Salt Bar (85%)", "quantity": 3, "price": 3.75}]',
                "payment_status": "COMPLETED",
                "payment_method": "Visa Credit",
                "verification_status": "LOW_RISK",
                "risk_score": 5,
                "created_at": now - timedelta(hours=2, minutes=45)
            },
            {
                "id": "TXN-9043-1023",
                "session_id": "SES-HIST-03",
                "customer_name": "Elena Rostova",
                "subtotal": 14.87,
                "tax": 1.19,
                "total": 16.06,
                "item_count": 2,
                "items_snapshot": '[{"name": "Botanical Lavender Body Wash (500ml)", "quantity": 1, "price": 8.99}, {"name": "Roasted Almonds with Rosemary (200g)", "quantity": 1, "price": 5.99}]',
                "payment_status": "FLAGGED",
                "payment_method": "Store Card",
                "verification_status": "REVIEW_REQUIRED",
                "risk_score": 75,
                "created_at": now - timedelta(hours=1, minutes=30)
            },
            {
                "id": "TXN-9044-1024",
                "session_id": "SES-HIST-04",
                "customer_name": "David Kim",
                "subtotal": 24.47,
                "tax": 1.96,
                "total": 26.43,
                "item_count": 3,
                "items_snapshot": '[{"name": "Cold Brew Espresso Concentrate (750ml)", "quantity": 1, "price": 7.49}, {"name": "Pure Japanese Matcha Green Tea (100g)", "quantity": 1, "price": 14.50}, {"name": "Sparkling Mineral Water Lemon (1.25L)", "quantity": 1, "price": 1.99}]',
                "payment_status": "COMPLETED",
                "payment_method": "Google Pay",
                "verification_status": "LOW_RISK",
                "risk_score": 0,
                "created_at": now - timedelta(minutes=42)
            }
        ]

        for st in sample_txns:
            db.add(Transaction(**st))

        # Add sample discrepancy record for SES-HIST-03
        sample_disc = DiscrepancyRecord(
            session_id="SES-HIST-03",
            transaction_id="TXN-9043-1023",
            product_id=13,
            product_name="Artisan Butter Shortbread Biscuits",
            barcode="8901030383335",
            discrepancy_type="MISSED_SCAN",
            description="Smart cart overhead camera detected 1 unit of Shortbread Biscuits in basket, but item is missing from digital cart.",
            risk_level="HIGH",
            expected_quantity=0,
            observed_quantity=1,
            resolution_status="PENDING",
            created_at=now - timedelta(hours=1, minutes=30)
        )
        db.add(sample_disc)

        # Add resolved discrepancy for historical transparency
        sample_resolved = DiscrepancyRecord(
            session_id="SES-HIST-01",
            transaction_id="TXN-9041-1021",
            product_id=6,
            product_name="Farm Fresh Whole Milk (1L)",
            barcode="8901030383212",
            discrepancy_type="QUANTITY_MISMATCH",
            description="Cart weight scale detected 2.06kg (+1 unit excess), initial cart had 1 unit.",
            risk_level="MEDIUM",
            expected_quantity=1,
            observed_quantity=2,
            resolution_status="RESOLVED",
            resolution_reason="Customer affirmed taking 2 cartons; scanned additional unit in app with staff guidance.",
            resolved_by="Associate Maya",
            created_at=now - timedelta(hours=3, minutes=15),
            resolved_at=now - timedelta(hours=3, minutes=13)
        )
        db.add(sample_resolved)

        db.commit()
