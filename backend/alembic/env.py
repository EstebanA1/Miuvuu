from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Importa la Base y todos los modelos para que Alembic los detecte
from app.database import Base
from app.models.categorias import Categoria
from app.models.productos import Producto
from app.models.usuarios import Usuario

# Cargar configuración de Alembic
config = context.config

# Configurar logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata de los modelos
target_metadata = Base.metadata

# Obtener la URL de la base de datos desde la configuración
from app.database import DATABASE_URL

DATABASE_URL_SYNC = DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
config.set_main_option("sqlalchemy.url", DATABASE_URL_SYNC)


def run_migrations_offline() -> None:
    """Ejecutar migraciones en modo offline."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecutar migraciones en modo online (conectado a la BD)"""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
