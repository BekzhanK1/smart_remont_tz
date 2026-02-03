from decimal import Decimal
from pydantic import BaseModel, Field, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


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
