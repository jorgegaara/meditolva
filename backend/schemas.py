"""Esquemas Pydantic v2 (validación de entrada y salida)."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

Estado = Literal["ok", "warn", "danger"]
Componente = Literal[
    "Lateral izquierdo", "Lateral derecho", "Fondo", "Boca de descarga", "Estructura superior"
]
Tipo = Literal["Espesor", "Grieta largo", "Grieta profundidad", "Desgaste visual"]

# Unidad que corresponde a cada tipo de medición
UNIDAD_POR_TIPO = {
    "Espesor": "mm",
    "Grieta largo": "mm",
    "Grieta profundidad": "mm",
    "Desgaste visual": "/5",
}


# ---------- Equipos ----------
class EquipoCreate(BaseModel):
    codigo: str = Field(min_length=1, max_length=50)
    modelo: str = Field(min_length=1, max_length=100)
    ubicacion: str = Field(min_length=1, max_length=100)
    tolva: str = Field(min_length=1, max_length=50)
    estado: Estado = "ok"


class EquipoOut(EquipoCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Mediciones ----------
class MedicionCreate(BaseModel):
    equipo_id: int
    componente: Componente
    tipo: Tipo
    valor: float
    unidad: Literal["mm", "/5"] | None = None  # si no viene, se deduce del tipo
    inspector: str = Field(min_length=1, max_length=100)
    instrumento: str = Field(min_length=1, max_length=100)
    observaciones: str | None = None

    @model_validator(mode="after")
    def validar(self):
        esperada = UNIDAD_POR_TIPO[self.tipo]
        if self.unidad is None:
            self.unidad = esperada
        elif self.unidad != esperada:
            raise ValueError(f"La unidad para '{self.tipo}' debe ser '{esperada}'")
        if self.tipo == "Desgaste visual":
            if not (1 <= self.valor <= 5):
                raise ValueError("El desgaste visual debe estar entre 1 y 5")
        elif self.valor < 0:
            raise ValueError("El valor no puede ser negativo")
        return self


class MedicionOut(BaseModel):
    id: int
    equipo_id: int
    equipo_codigo: str
    componente: str
    tipo: str
    valor: float
    unidad: str
    inspector: str
    instrumento: str
    observaciones: str | None
    fecha: datetime


# ---------- Dashboard ----------
class TendenciaPunto(BaseModel):
    dia: str
    promedio: float


class PorTipo(BaseModel):
    tipo: str
    cantidad: int


class Actividad(BaseModel):
    equipo: str
    componente: str
    tipo: str
    valor: float
    fecha: datetime


class DashboardStats(BaseModel):
    total_equipos: int
    total_mediciones: int
    criticos: int
    ultimas_semana: int
    tendencia: list[TendenciaPunto]
    por_tipo: list[PorTipo]
    actividad_reciente: list[Actividad]
