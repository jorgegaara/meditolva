"""Modelos SQLAlchemy: equipos y mediciones."""
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Equipo(Base):
    __tablename__ = "equipos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(String(50), unique=True, index=True)  # ej: CAEX-001
    modelo: Mapped[str] = mapped_column(String(100))                          # ej: Komatsu 930E
    ubicacion: Mapped[str] = mapped_column(String(100))                       # ej: Rajo Norte
    tolva: Mapped[str] = mapped_column(String(50))                            # ej: TOL-001
    estado: Mapped[str] = mapped_column(String(10), default="ok")             # ok | warn | danger

    mediciones: Mapped[list["Medicion"]] = relationship(back_populates="equipo")


class Medicion(Base):
    __tablename__ = "mediciones"
    __table_args__ = (Index("ix_mediciones_equipo_fecha", "equipo_id", "fecha"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    equipo_id: Mapped[int] = mapped_column(ForeignKey("equipos.id"), index=True)
    componente: Mapped[str] = mapped_column(String(50))
    tipo: Mapped[str] = mapped_column(String(30))
    valor: Mapped[float] = mapped_column(Float)
    unidad: Mapped[str] = mapped_column(String(5))
    inspector: Mapped[str] = mapped_column(String(100))        # trazabilidad: quién
    instrumento: Mapped[str] = mapped_column(String(100))      # trazabilidad: con qué (N° serie)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora, index=True)  # trazabilidad: cuándo

    equipo: Mapped[Equipo] = relationship(back_populates="mediciones")
