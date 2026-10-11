"""Datos de ejemplo: 4 equipos CAEX y 6 mediciones. Uso: python seed.py"""
from datetime import datetime, timedelta, timezone

import models
from database import Base, SessionLocal, engine
from main import estado_por_espesor

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(models.Equipo).count() > 0:
    print("La base ya tiene datos; no se inserta nada.")
    raise SystemExit

equipos = [
    models.Equipo(codigo="CAEX-001", modelo="Komatsu 930E", ubicacion="Rajo Norte", tolva="TOL-001"),
    models.Equipo(codigo="CAEX-002", modelo="Komatsu 930E", ubicacion="Rajo Norte", tolva="TOL-002"),
    models.Equipo(codigo="CAEX-003", modelo="Caterpillar 797F", ubicacion="Rajo Sur", tolva="TOL-003"),
    models.Equipo(codigo="CAEX-004", modelo="Caterpillar 797F", ubicacion="Rajo Sur", tolva="TOL-004"),
]
db.add_all(equipos)
db.flush()

hoy = datetime.now(timezone.utc)
# (equipo, componente, tipo, valor, unidad, inspector, instrumento, días atrás, observación)
datos = [
    (0, "Fondo", "Espesor", 18.5, "mm", "Carlos Rojas", "UT-2041", 20, "Sin novedades"),
    (0, "Fondo", "Espesor", 15.2, "mm", "Carlos Rojas", "UT-2041", 8, None),
    (1, "Lateral izquierdo", "Espesor", 10.4, "mm", "María Soto", "UT-2041", 5, "Desgaste en zona de carga"),
    (2, "Boca de descarga", "Espesor", 7.1, "mm", "Pedro Fuentes", "UT-3377", 2, "Requiere reemplazo de liner"),
    (3, "Estructura superior", "Grieta largo", 42.0, "mm", "María Soto", "UT-2041", 1, "Grieta en soldadura"),
    (3, "Lateral derecho", "Desgaste visual", 3, "/5", "Carlos Rojas", "UT-2041", 0, None),
]
for e, comp, tipo, valor, unidad, insp, instr, dias, obs in datos:
    eq = equipos[e]
    db.add(models.Medicion(
        equipo_id=eq.id, componente=comp, tipo=tipo, valor=valor, unidad=unidad,
        inspector=insp, instrumento=instr, observaciones=obs, fecha=hoy - timedelta(days=dias),
    ))
    if tipo == "Espesor":  # aplica la misma regla de negocio que la API (en orden cronológico)
        eq.estado = estado_por_espesor(valor)

db.commit()
print("Listo: 4 equipos y 6 mediciones insertados.")
