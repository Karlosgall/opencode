# TVS1 Database — Master Reference

> **FUENTE DE VERDAD OBLIGATORIA.** Consultar SIEMPRE antes de cualquier query a la base de datos TVS1.
> Esta es la referencia maestra del esquema. No improvisar joins, no usar IDs internos de tablas secundarias como referencia principal.

---

## Regla Cardinal

| Concepto | Valor |
|----------|-------|
| Base de datos | `TVS1` (MySQL) |
| Tabla central | `user` |
| Clave maestra universal | `user.id` |

**Toda relación lógica, búsqueda, join, trazabilidad, permisos y consultas deben construirse con `user.id` como punto de partida.**

---

## PROHIBIDO

- Usar `company.id` como referencia principal del usuario
- Usar el `id` interno de **cualquier** tabla secundaria como identidad del usuario
- Hacer `JOIN company c ON c.id = order_software.dealer_id`
- WHERE `company.id = X` para identificar un usuario

## Obligatorio

- `company.user_id = user.id`
- `order_software.dealer_id = user.id`
- Toda referencia a un usuario debe pasar por `user.id`

---

## Tablas y Relaciones

### Usuarios

```sql
user -- tabla maestra
```

Tipos de usuario (`user.type`):
`administrator`, `support`, `calibrator`, `sales`, `distributor`, `dealer`, `subdealers`, `workshops`, `end_user`

---

### Información Empresarial

```sql
company
company.user_id = user.id  -- SIEMPRE así, NUNCA company.id
```

---

### Órdenes de Software

```sql
order_software
  dealer_id       -> user.id
  vin
  status
  urgency
  credit
  vehicle
  calibrator_ids
```

```sql
order_software_history
  user_id         -> user.id
  order_id        -> order_software.id
```

```sql
order_software_traceability
  user_id         -> user.id
  order_id        -> order_software.id
```

```sql
order_custom_software
  user_id         -> user.id
  calibrator_id   -> user.id
```

---

### Créditos

```sql
credit
  user_id         -> user.id
```

```sql
credit_movement
  user_id         -> user.id
  amount
  remaining
  factor
  euro
  model
  model_id
  movement
```

```sql
credit_order
  user_id         -> user.id
  owner_id        -> user.id
```

```sql
credit_order_pay
  user_id         -> user.id
  order_id        -> credit_order.id
```

```sql
credit_transfer
  user_from_id    -> user.id
  user_to_id      -> user.id
```

---

### Tickets de Soporte

```sql
support_ticket
  client_user_id  -> user.id
  staff_user_id   -> user.id
  owner_id        -> user.id
  vin
```

```sql
support_ticket_message
  user_id         -> user.id
```

---

### Facturación

```sql
invoice_numeration
  user_id         -> user.id
```

---

### Garantías

```sql
warranties
  user_id         -> user.id
```

---

### Seguridad y Verificación

```sql
user_token         -- depende de user.id
user_verification  -- depende de user.id
ip_whitelist       -- depende de user.id
conections         -- depende de user.id
```

---

## VIN (Vehículo)

Búsqueda principal sobre:
- `order_software.vin`
- `support_ticket.vin`
- Campos dentro de `extra_data`

Trazabilidad posterior siempre vía `user.id`.

---

## Regla de Interpretación de Negocio

| Entidad | Relación con usuario |
|---------|---------------------|
| Usuario | Núcleo del sistema |
| Compañías | Extensiones del usuario |
| Órdenes | Pertenecen al usuario |
| Créditos | Pertenecen al usuario |
| Tickets | Pertenecen al usuario |
| Garantías | Pertenecen al usuario |
| Trazabilidad | Pertenecen al usuario |

---

## Query Correcta (Ejemplo)

```sql
SELECT
    u.id,
    u.name,
    c.name_company,
    os.order_id,
    os.vin
FROM user u
LEFT JOIN company c
    ON c.user_id = u.id
LEFT JOIN order_software os
    ON os.dealer_id = u.id
WHERE u.id = 17;
```

## Query Incorrecta (Ejemplo)

```sql
-- MAL: company.id no es la identidad del usuario
WHERE company.id = 8

-- MAL: rompe la referencia maestra
JOIN company c ON c.id = order_software.dealer_id
```
