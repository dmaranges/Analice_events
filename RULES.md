# Especificación Técnica: App de Gestión y Análisis de Eventos Económicos

Esta especificación detalla la estructura de datos, las métricas financieras, el esfuerzo operativo y las fórmulas matemáticas para una aplicación diseñada para gestionar y analizar el rendimiento de eventos económicos (ideales para proyectos de financiamiento grupal o scout).

---

## 1. Datos Primarios por Evento (Inputs Actualizados)

### A. Datos Identificatorios y Contexto

- `ID_Evento`: Identificador único (ej: `evt_2026_01`).
- `Nombre_Evento`: Nombre descriptivo (ej: _"Venta de Locro 25 de Mayo"_).
- `Tipo_Evento`: Categoría (ej: _Comida, Rifa, Bono_).
- `Fecha_Evento`: Fecha en la que se ejecuta la venta o entrega.
- `Modalidad_Venta`: Clasificación operativa del evento:
  - `Pre-venta`: El producto se encarga por anticipado y se produce o adquiere estrictamente en función de los pedidos confirmados (reduce stock sobrante).
  - `Venta Directa`: El producto se elabora o compra previamente y se comercializa en el momento al contado (stock disponible el mismo día).

### B. Datos Financieros Directos

- `Ingresos_Totales` ($I$): Suma de todo el dinero recaudado.
- `Inversión_Total` ($C$): Suma de costos de materia prima, insumos, logística y gastos operativos.

### C. Datos de Participación y Equipo

- `Integrantes_Totales` ($N_{total}$): Cantidad total de miembros habilitados en el grupo.
- `Integrantes_Vendedores` ($N_{vendedores}$): Cantidad de integrantes que concretaron ventas.

### D. Métricas de Tiempo y Esfuerzo Operativo

- `Dias_Preparacion`: Cantidad de días previos dedicados a la planificación, compras y organización logística.
- `Dias_Venta`: Duración del evento de venta (por defecto `1` si la venta se realiza íntegramente el mismo día).
- `Dias_Trabajo_Persona` (o _Personas-Días_): Esfuerzo humano total invertido en la producción, armado o búsqueda de insumos. Se calcula sumando las jornadas o días equivalentes trabajados por cada colaborador (ej: 4 personas trabajando 2 días en la cocina = 8 días-persona).

---

## 2. Fórmulas Matemáticas y Métricas Calculadas (KPIs)

### A. Indicadores Financieros

- **Ganancia Neta ($G$):**
  $$G = I - C$$
- **Rentabilidad Financiera (% ROI):**
  $$\%ROI = \left( \frac{G}{C} \right) \times 100$$
- **Margen de Ganancia (%):**
  $$\%Margen = \left( \frac{G}{I} \right) \times 100$$

### B. Indicadores de Productividad y Equipo

- **Tasa de Participación (%):**
  $$\%Participación = \left( \frac{N_{vendedores}}{N_{total}} \right) \times 100$$
- **Promedio de Venta por Vendedor:**
  $$\text{Venta Promedio} = \frac{I}{N_{vendedores}}$$
- **Eficiencia Operativa / Retorno por Esfuerzo (Ganancia por Día-Persona):**
  Mide cuánto dinero neto se genera por cada día de trabajo invertido por el equipo.
  $$\text{Ganancia por Día-Persona} = \frac{G}{\text{Dias\_Trabajo\_Persona}}$$

---

## 3. Comparación Histórica

- **Promedio de Ganancia por Categoría:**
  $$\text{Promedio} = \frac{\sum_{i=1}^{k} G_i}{k}$$
- **Variación Porcentual (vs Evento Anterior del mismo tipo):**
  $$\%Variación = \left( \frac{G_{actual} - G_{anterior}}{G_{anterior}} \right) \times 100$$

---

## 4. Estructura de Datos (JSON Schema de Ejemplo)

```json
{
  "id": "evt_2026_01",
  "title": "Venta de Empanadas Octubre",
  "type": "Comida",
  "modalidad": "Pre-venta",
  "date": "2026-10-15",
  "inputs": {
    "totalRevenue": 150000,
    "totalInvestment": 80000,
    "totalGroupMembers": 20,
    "activeSellersCount": 16,
    "diasPreparacion": 3,
    "diasVenta": 1,
    "diasTrabajoPersona": 12
  },
  "computed": {
    "netProfit": 70000,
    "roi": 87.5,
    "profitMargin": 46.6,
    "participationRate": 80.0,
    "avgSalesPerSeller": 9375,
    "profitPerPersonDay": 5833.33
  }
}
```
