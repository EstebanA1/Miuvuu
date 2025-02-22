import { API_URL } from "../config/config";

export async function sendWelcomeEmail(email) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`${API_URL}/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email }),
            signal: controller.signal
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Error al enviar el correo");
        }

        return response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}