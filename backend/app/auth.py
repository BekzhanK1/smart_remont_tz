from datetime import datetime, timedelta, timezone
import bcrypt
from jose import JWTError, jwt
from app.config import settings

# bcrypt limit is 72 bytes
_MAX_BCRYPT_BYTES = 72


def _truncate_password(password: str) -> bytes:
    pwd_bytes = password.encode("utf-8")
    return pwd_bytes[:_MAX_BCRYPT_BYTES] if len(pwd_bytes) > _MAX_BCRYPT_BYTES else pwd_bytes


def hash_password(password: str) -> str:
    pwd = _truncate_password(password)
    return bcrypt.hashpw(pwd, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    pwd = _truncate_password(plain)
    return bcrypt.checkpw(pwd, hashed.encode("utf-8"))


def create_access_token(subject: str | int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = {"sub": str(subject), "exp": expire}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        sub = payload.get("sub")
        return str(sub) if sub is not None else None
    except JWTError:
        return None
