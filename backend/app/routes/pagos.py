from fastapi import APIRouter, HTTPException, Request
import os
import uuid
import mercadopago
import logging
import logging
from app.schemas.pagos import MercadoPagoPayment

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("MercadoPago")

router = APIRouter()

@router.post("/mercadopago")
async def create_mercadopago_preference(payment: MercadoPagoPayment):
    access_token = os.environ.get("MERCADOPAGO_ACCESS_TOKEN")
    if not access_token:
        raise HTTPException(status_code=500, detail="MercadoPago access token no configurado")
    
    sdk = mercadopago.SDK(access_token)

    notification_url = os.environ.get(
        "MERCADOPAGO_NOTIFICATION_URL", 
        # "http://localhost:8000/api/pagos/notification" 
        "https://miuvuu.railway.app/api/pagos/notification" 
    )

    logger.debug(f"Datos recibidos para la preferencia: {payment.dict()}")

    preference_data = {
        "items": [
            {
                "title": payment.title,
                "quantity": payment.quantity,
                "currency_id": "CLP",
                "unit_price": int(payment.unit_price),
                "description": "Compra en Mi Tienda"
            }
        ],
        "back_urls": {
            # "success": str(payment.success_url),
            # "failure": str(payment.failure_url),
            # "pending": str(payment.pending_url)
            "success": "https://estebana1.github.io/portafolioEsteban/",
            "failure": "https://estebana1.github.io/portafolioEsteban/",
            "pending": "https://estebana1.github.io/portafolioEsteban/"
        },
        "notification_url": notification_url,
        "auto_return": "approved",
        "binary_mode": True,
        "statement_descriptor": "MI TIENDA",
        "external_reference": "ORDEN_" + str(uuid.uuid4())
    }

    logger.debug(f"Datos de preferencia enviados a MercadoPago: {preference_data}")

    try:
        preference_response = sdk.preference().create(preference_data)
        logger.debug(f"Respuesta completa de MercadoPago: {preference_response}")

        if not preference_response or "response" not in preference_response:
            raise HTTPException(
                status_code=500, 
                detail="Error al crear preferencia de MercadoPago: Respuesta inválida"
            )
        
        preference = preference_response["response"]
        # logger.info(f"Preferencia creada: {preference}")

        return {
            "preference": preference,
            "init_point": preference.get("init_point"),
            "sandbox_init_point": preference.get("sandbox_init_point")
        }
    except mercadopago.sdk.MPApiError as e:
        logger.error(f"Error de MercadoPago API: {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail=f"Error de MercadoPago: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error inesperado: {str(e)}"
        )

@router.post("/notification")
async def receive_notification(request: Request):
    try:
        payload = await request.json()
        logger.debug(f"Notificación recibida: {payload}")
        
        if "type" in payload:
            if payload["type"] == "payment":
                logger.info("Notificación de pago recibida")
            elif payload["type"] == "test":
                logger.info("Notificación de prueba recibida")
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error procesando notificación: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
