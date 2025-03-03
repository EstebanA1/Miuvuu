from fastapi import APIRouter, HTTPException, Request
import uuid
import mercadopago
import logging
from app.schemas.pagos import MercadoPagoPayment
from app.config import API_URL, MERCADOPAGO_ACCESS_TOKEN
import os

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("MercadoPago")

router = APIRouter()
access_token = os.environ.get("MERCADOPAGO_ACCESS_TOKEN")

@router.post("/mercadopago")
async def create_mercadopago_preference(payment: MercadoPagoPayment):
    if not access_token:
        raise HTTPException(status_code=500, detail="MercadoPago access token no configurado")

    sdk = mercadopago.SDK(access_token)

    notification_url = os.environ.get(
        "MERCADOPAGO_NOTIFICATION_URL",
        f"{os.environ.get('API_URL', 'http://localhost:8000')}/api/pagos/notification"
)

    preference_data = {
        "items": [{
            "title": payment.title,
            "quantity": payment.quantity,
            "currency_id": "CLP",
            "unit_price": int(payment.unit_price),
            "description": "Compra en Mi Tienda"
        }],
        "back_urls": {
            "success": "https://estebana1.github.io/portafolioEsteban/",
            "failure": "https://estebana1.github.io/portafolioEsteban/",
            "pending": "https://estebana1.github.io/portafolioEsteban/"
        },
        "notification_url": notification_url,
        "auto_return": "approved",
        "binary_mode": True,
        "statement_descriptor": "MI TIENDA",
        "external_reference": f"ORDEN_{uuid.uuid4()}"
    }

    try:
        response = sdk.preference().create(preference_data)
        preference = response.get("response", {})
        return {
    "preference": preference,
    "init_point": preference.get("init_point"),
    "sandbox_init_point": preference.get("sandbox_init_point")
}

    except Exception as e:
        logger.error(f"Error en MercadoPago: {e}")
        raise HTTPException(status_code=500, detail="Error en MercadoPago")

@router.post("/notification")
async def receive_notification(request: Request):
    try:
        payload = await request.json()
        logger.debug(f"Notificación recibida: {payload}")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error procesando notificación: {e}")
        raise HTTPException(status_code=500, detail=str(e))
