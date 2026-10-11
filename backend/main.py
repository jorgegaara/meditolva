"""MediTolva - API FastAPI para registro de mediciones de desgaste en tolvas CAEX."""
from datetime import date, datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Date, cast, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db

# Crea las tablas si no existen (suficiente para esta etapa; luego conviene usar Alembic).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediTolva API", version="1.0.0")

# CORS abierto para desarrollo. En producción: reemplazar "*" por la URL de Vercel.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Zona horaria de las faenas: los "días" del gráfico se agrupan en hora de Chile.
TZ_CHILE = "America/Santiago"


def estado_por_espesor(valor: float) -> str:
    """Regla de negocio crítica: estado del equipo según el espesor medido."""
    if valor < 8:
        return "danger"
    if valor < 12:
        return "warn"
    return "ok"


@app.get("/")
def raiz():
    return {"servicio": "MediTolva API", "estado": "ok"}


# ------------------------------------------------------------------ equipos
@app.get("/equipos", response_model=list[schemas.EquipoOut])
def listar_equipos(db: Session = Depends(get_db)):
    return db.scalars(select(models.Equipo).order_by(models.Equipo.codigo)).all()


@app.post("/equipos", response_model=schemas.EquipoOut, status_code=201)
def crear_equipo(datos: schemas.EquipoCreate, db: Session = Depends(get_db)):
    equipo = models.Equipo(**datos.model_dump())
    db.add(equipo)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, f"Ya existe un equipo con código {datos.codigo}")
    db.refresh(equipo)
    return equipo


# --------------------------------------------------------------- mediciones
def _a_salida(m: models.Medicion, codigo: str) -> schemas.MedicionOut:
    return schemas.MedicionOut(
        id=m.id, equipo_id=m.equipo_id, equipo_codigo=codigo, componente=m.componente,
        tipo=m.tipo, valor=m.valor, unidad=m.unidad, inspector=m.inspector,
        instrumento=m.instrumento, observaciones=m.observaciones, fecha=m.fecha,
    )


@app.get("/mediciones", response_model=list[schemas.MedicionOut])
def listar_mediciones(
    equipo_id: int | None = None,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    q = (
        select(models.Medicion, models.Equipo.codigo)
        .join(models.Equipo, models.Equipo.id == models.Medicion.equipo_id)
        .order_by(models.Medicion.fecha.desc())
        .limit(limit)
    )
    if equipo_id is not None:
        q = q.where(models.Medicion.equipo_id == equipo_id)
    return [_a_salida(m, codigo) for m, codigo in db.execute(q).all()]


@app.post("/mediciones", response_model=schemas.MedicionOut, status_code=201)
def crear_medicion(datos: schemas.MedicionCreate, db: Session = Depends(get_db)):
    equipo = db.get(models.Equipo, datos.equipo_id)
    if equipo is None:
        raise HTTPException(404, "El equipo indicado no existe")

    medicion = models.Medicion(**datos.model_dump())
    db.add(medicion)

    # Regla crítica: un espesor actualiza el estado del equipo (misma transacción).
    if datos.tipo == "Espesor":
        equipo.estado = estado_por_espesor(datos.valor)

    db.commit()
    db.refresh(medicion)
    return _a_salida(medicion, equipo.codigo)


# ---------------------------------------------------------------- dashboard
@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    ahora = datetime.now(timezone.utc)
    M, E = models.Medicion, models.Equipo

    total_equipos = db.scalar(select(func.count(E.id))) or 0
    total_mediciones = db.scalar(select(func.count(M.id))) or 0
    criticos = db.scalar(select(func.count(E.id)).where(E.estado == "danger")) or 0
    ultimas_semana = db.scalar(
        select(func.count(M.id)).where(M.fecha >= ahora - timedelta(days=7))
    ) or 0

    # Promedio diario de espesores (últimos 30 días), agrupado por día en hora de Chile.
    dia = cast(func.timezone(TZ_CHILE, M.fecha), Date)
    filas = db.execute(
        select(dia.label("dia"), func.avg(M.valor).label("promedio"))
        .where(M.tipo == "Espesor", M.fecha >= ahora - timedelta(days=30))
        .group_by(dia)
        .order_by(dia)
    ).all()
    tendencia = [
        {"dia": d.isoformat() if isinstance(d, date) else str(d), "promedio": round(float(p), 2)}
        for d, p in filas
    ]

    por_tipo = [
        {"tipo": t, "cantidad": c}
        for t, c in db.execute(
            select(M.tipo, func.count(M.id)).group_by(M.tipo).order_by(func.count(M.id).desc())
        ).all()
    ]

    actividad = [
        {"equipo": cod, "componente": m.componente, "tipo": m.tipo, "valor": m.valor, "fecha": m.fecha}
        for m, cod in db.execute(
            select(M, E.codigo).join(E, E.id == M.equipo_id).order_by(M.fecha.desc()).limit(8)
        ).all()
    ]

    return {
        "total_equipos": total_equipos,
        "total_mediciones": total_mediciones,
        "criticos": criticos,
        "ultimas_semana": ultimas_semana,
        "tendencia": tendencia,
        "por_tipo": por_tipo,
        "actividad_reciente": actividad,
    }
