from pydantic import BaseModel, HttpUrl

class MercadoPagoPayment(BaseModel):
    title: str
    quantity: int
    unit_price: float
    success_url: HttpUrl
    failure_url: HttpUrl
    pending_url: HttpUrl 
