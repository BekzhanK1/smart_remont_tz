from decimal import Decimal
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app import crud
from app.schemas import ProductListResponse, ProductDetailResponse, ProductsPaginatedResponse

router = APIRouter(prefix="/api/products", tags=["products"])


def _paginated_url(request: Request, offset: int, **extra) -> str | None:
    params = dict(request.query_params)
    params["offset"] = offset
    params.update(extra)
    return str(request.url.replace(query=urlencode(params)))


@router.get("/", response_model=ProductsPaginatedResponse)
async def list_products(
    request: Request,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: str | None = Query(None),
    min_price: Decimal | None = Query(None, ge=0),
    max_price: Decimal | None = Query(None, ge=0),
    search: str | None = Query(None),
    sort_by: str = Query("id", description="Sort field: id, name, price"),
    sort_order: str = Query("asc", description="Sort order: asc, desc"),
):
    if sort_by not in ("id", "name", "price"):
        sort_by = "id"
    products, total = await crud.get_products(
        db,
        limit=limit,
        offset=offset,
        category=category,
        min_price=min_price,
        max_price=max_price,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    next_url = _paginated_url(request, offset + limit) if offset + limit < total else None
    previous_url = _paginated_url(request, max(0, offset - limit)) if offset > 0 else None
    return ProductsPaginatedResponse(
        count=total,
        next=next_url,
        previous=previous_url,
        results=[ProductListResponse.model_validate(p) for p in products],
    )


@router.get("/{product_id}/", response_model=ProductDetailResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    product = await crud.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductDetailResponse.model_validate(product)
