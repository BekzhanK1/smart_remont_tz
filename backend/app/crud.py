from decimal import Decimal
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models import Product, Cart, CartItem
from app.schemas import CartItemResponse


async def get_products(
    db: AsyncSession,
    *,
    limit: int = 20,
    offset: int = 0,
    category: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    search: str | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
) -> tuple[list[Product], int]:
    query = select(Product)
    count_query = select(func.count()).select_from(Product)

    if category:
        query = query.where(Product.category == category)
        count_query = count_query.where(Product.category == category)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
        count_query = count_query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
        count_query = count_query.where(Product.price <= max_price)
    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
            )
        )
        count_query = count_query.where(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
            )
        )

    total = await db.scalar(count_query)

    order_col = getattr(Product, sort_by, Product.id)
    if sort_order.lower() == "desc":
        order_col = order_col.desc()
    else:
        order_col = order_col.asc()
    query = query.order_by(order_col).limit(limit).offset(offset)

    result = await db.execute(query)
    products = result.scalars().all()
    return list(products), total


async def get_product_by_id(db: AsyncSession, product_id: int) -> Product | None:
    result = await db.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()


async def get_or_create_cart(db: AsyncSession, session_id: str) -> Cart:
    result = await db.execute(select(Cart).where(Cart.session_id == session_id))
    cart = result.scalar_one_or_none()
    if cart is None:
        cart = Cart(session_id=session_id)
        db.add(cart)
        await db.flush()
    return cart


async def get_cart_by_session(db: AsyncSession, session_id: str) -> Cart | None:
    result = await db.execute(select(Cart).where(Cart.session_id == session_id))
    return result.scalar_one_or_none()


async def get_cart_with_items(db: AsyncSession, cart_id: int) -> Cart | None:
    """Load cart with items and product for each item (avoids lazy load in async)."""
    result = await db.execute(
        select(Cart)
        .where(Cart.id == cart_id)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
    )
    return result.scalar_one_or_none()


async def add_cart_item(db: AsyncSession, cart_id: int, product_id: int, quantity: int) -> CartItem | None:
    product = await get_product_by_id(db, product_id)
    if not product:
        return None
    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
    )
    item = result.scalar_one_or_none()
    if item:
        item.quantity += quantity
    else:
        item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
        db.add(item)
    await db.flush()
    return item


async def get_cart_item(db: AsyncSession, item_id: int, cart_id: int) -> CartItem | None:
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart_id)
    )
    return result.scalar_one_or_none()


async def update_cart_item_quantity(db: AsyncSession, item: CartItem, quantity: int) -> CartItem:
    item.quantity = quantity
    await db.flush()
    return item


async def delete_cart_item(db: AsyncSession, item: CartItem) -> None:
    await db.delete(item)
    await db.flush()


def cart_to_response(cart: Cart) -> dict:
    items = []
    total = Decimal("0")
    for item in cart.items:
        subtotal = item.product.price * item.quantity
        total += subtotal
        items.append(
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                product_price=item.product.price,
                product_image=item.product.image,
                quantity=item.quantity,
                subtotal=subtotal,
            )
        )
    return {"id": cart.id, "items": items, "total": total}
