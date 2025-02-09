from urllib.parse import urlparse
from pathlib import Path

def extract_folder_from_url(url: str) -> str:
    """
    Dada una URL (que puede ser absoluta o relativa) de imagen,
    extrae el nombre de la carpeta, que se asume es el primer
    directorio después de '/uploads/CarpetasDeProductos/'.
    """
    # Si la URL es absoluta, obtenemos la parte de la ruta
    if url.startswith("http://") or url.startswith("https://"):
        parsed = urlparse(url)
        url = parsed.path  # quedarnos solo con la ruta
    prefix = "/uploads/CarpetasDeProductos/"
    if url.startswith(prefix):
        # Extraemos el nombre de la carpeta: lo que esté inmediatamente después del prefix
        return url[len(prefix):].split("/")[0]
    return ""

def extract_file_path_from_url(url: str) -> Path:
    """
    Convierte una URL (absoluta o relativa) en un objeto Path relativo al servidor.
    Por ejemplo, '/uploads/CarpetasDeProductos/mi_carpeta/imagen.webp'
    se convertirá en Path("uploads/CarpetasDeProductos/mi_carpeta/imagen.webp")
    """
    if url.startswith("http://") or url.startswith("https://"):
        parsed = urlparse(url)
        url = parsed.path
    return Path(url.lstrip("/"))


def normalize_url(url: str) -> str:
    """Devuelve la ruta de la URL, de modo que http://127.0.0.1:8000/uploads/...
    se convierta en /uploads/..."""
    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc:
        return parsed.path  # extrae solo la parte de la ruta
    return url

