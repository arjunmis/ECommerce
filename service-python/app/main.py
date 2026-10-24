import os
import re

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .db import orders, products
from .schemas import ProductOut, SalesSummary, SearchResult

app = FastAPI(
    title="ShopNest Search & Reports Service",
    description="Product search, recommendations and sales reports for the ShopNest store.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_URL", "http://localhost:5173")],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def to_product(doc: dict) -> ProductOut:
    return ProductOut(
        id=str(doc["_id"]),
        name=doc["name"],
        category=doc["category"],
        price=doc["price"],
        stock=doc.get("stock", 0),
        description=doc.get("description", ""),
        image=doc.get("image", ""),
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/search", response_model=SearchResult)
def search_products(
    q: str = Query("", description="Text to match in name, description or category"),
    category: str | None = None,
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    in_stock: bool = False,
    sort: str = Query("relevance", pattern="^(relevance|price_asc|price_desc|newest)$"),
    limit: int = Query(20, ge=1, le=100),
):
    filters: dict = {}
    if q:
        pattern = re.compile(re.escape(q), re.IGNORECASE)
        filters["$or"] = [{"name": pattern}, {"description": pattern}, {"category": pattern}]
    if category:
        filters["category"] = category
    if min_price is not None or max_price is not None:
        filters["price"] = {}
        if min_price is not None:
            filters["price"]["$gte"] = min_price
        if max_price is not None:
            filters["price"]["$lte"] = max_price
    if in_stock:
        filters["stock"] = {"$gt": 0}

    sort_map = {
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "newest": [("createdAt", -1)],
    }
    docs = list(products.find(filters).limit(limit * 5))

    if sort in sort_map:
        field, direction = sort_map[sort][0]
        docs.sort(key=lambda d: d.get(field) or 0, reverse=direction == -1)
    elif q:
        # Simple relevance: name matches rank above description/category matches.
        needle = q.lower()
        docs.sort(key=lambda d: (needle not in d["name"].lower(), d["name"]))

    items = [to_product(d) for d in docs[:limit]]
    return SearchResult(query=q, total=len(docs), items=items)


@app.get("/products/{product_id}/recommendations", response_model=list[ProductOut])
def recommendations(product_id: str, limit: int = Query(4, ge=1, le=20)):
    """Products from the same category, closest in price first."""
    try:
        oid = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product id")

    product = products.find_one({"_id": oid})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    similar = list(products.find({"category": product["category"], "_id": {"$ne": oid}}))
    similar.sort(key=lambda d: abs(d["price"] - product["price"]))
    return [to_product(d) for d in similar[:limit]]


@app.get("/reports/sales", response_model=SalesSummary)
def sales_summary(top: int = Query(5, ge=1, le=20)):
    """Revenue, order count and best sellers, excluding cancelled orders."""
    match = {"$match": {"status": {"$ne": "cancelled"}}}

    totals = list(
        orders.aggregate([match, {"$group": {"_id": None, "orders": {"$sum": 1}, "revenue": {"$sum": "$total"}}}])
    )
    order_count = totals[0]["orders"] if totals else 0
    revenue = float(totals[0]["revenue"]) if totals else 0.0

    line_items = [
        match,
        {"$unwind": "$items"},
        {"$lookup": {"from": "products", "localField": "items.product", "foreignField": "_id", "as": "p"}},
        {
            "$project": {
                "name": "$items.name",
                "units": "$items.quantity",
                "revenue": {"$multiply": ["$items.price", "$items.quantity"]},
                "category": {"$ifNull": [{"$first": "$p.category"}, "Unknown"]},
            }
        },
    ]

    by_category = orders.aggregate(
        line_items
        + [
            {"$group": {"_id": "$category", "units": {"$sum": "$units"}, "revenue": {"$sum": "$revenue"}}},
            {"$sort": {"revenue": -1}},
        ]
    )
    top_products = orders.aggregate(
        line_items
        + [
            {"$group": {"_id": "$name", "units": {"$sum": "$units"}, "revenue": {"$sum": "$revenue"}}},
            {"$sort": {"units": -1}},
            {"$limit": top},
        ]
    )

    return SalesSummary(
        orders=order_count,
        revenue=revenue,
        average_order_value=round(revenue / order_count, 2) if order_count else 0.0,
        by_category=[{"category": c["_id"], "units": c["units"], "revenue": c["revenue"]} for c in by_category],
        top_products=[{"name": p["_id"], "units": p["units"], "revenue": p["revenue"]} for p in top_products],
    )
