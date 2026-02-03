from decimal import Decimal
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app import crud
from app.schemas import CartItemAdd, CartItemUpdate, CartResponse

router = APIRouter(prefix="/api/cart", tags=["cart"])

SESSION_HEADER = "X-Session-ID"


def get_session_id(x_session_id: str | None = Header(None, alias=SESSION_HEADER)) -> str:
    if not x_session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header is required")
    return x_session_id


@router.post("/")
async def add_to_cart(
    body: CartItemAdd,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    cart = await crud.get_or_create_cart(db, session_id)
    item = await crud.add_cart_item(db, cart.id, body.product_id, body.quantity)
    if item is None:
        raise HTTPException(status_code=404, detail="Product not found")
    cart = await crud.get_cart_with_items(db, cart.id)
    return crud.cart_to_response(cart)


@router.get("/", response_model=CartResponse)
async def get_cart(
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    cart = await crud.get_cart_by_session(db, session_id)
    if not cart:
        return CartResponse(id=0, items=[], total=Decimal("0"))
    cart = await crud.get_cart_with_items(db, cart.id)
    return CartResponse(**crud.cart_to_response(cart))


@router.put("/{item_id}/")
async def update_cart_item(
    item_id: int,
    body: CartItemUpdate,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    cart = await crud.get_cart_by_session(db, session_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    item = await crud.get_cart_item(db, item_id, cart.id)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    await crud.update_cart_item_quantity(db, item, body.quantity)
    cart = await crud.get_cart_with_items(db, cart.id)
    return crud.cart_to_response(cart)


@router.delete("/{item_id}/")
async def delete_cart_item(
    item_id: int,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    cart = await crud.get_cart_by_session(db, session_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    item = await crud.get_cart_item(db, item_id, cart.id)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    await crud.delete_cart_item(db, item)
    cart = await crud.get_cart_with_items(db, cart.id)
    return crud.cart_to_response(cart)
