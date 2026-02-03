from decimal import Decimal
from pydantic import BaseModel, Field


class ProductListResponse(BaseModel):
    id: int
    name: str
    price: Decimal
    image: str | None
    category: str

    class Config:
        from_attributes = True


class ProductDetailResponse(ProductListResponse):
    description: str | None


class ProductsPaginatedResponse(BaseModel):
    count: int
    next: str | None
    previous: str | None
    results: list[ProductListResponse]


class CartItemAdd(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0, le=999)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0, le=999)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: Decimal
    product_image: str | None
    quantity: int
    subtotal: Decimal

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    items: list[CartItemResponse]
    total: Decimal
