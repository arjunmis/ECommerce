from pydantic import BaseModel


class ProductOut(BaseModel):
    id: str
    name: str
    category: str
    price: float
    stock: int
    description: str = ""
    image: str = ""


class SearchResult(BaseModel):
    query: str
    total: int
    items: list[ProductOut]


class CategorySales(BaseModel):
    category: str
    units: int
    revenue: float


class TopProduct(BaseModel):
    name: str
    units: int
    revenue: float


class SalesSummary(BaseModel):
    orders: int
    revenue: float
    average_order_value: float
    by_category: list[CategorySales]
    top_products: list[TopProduct]
