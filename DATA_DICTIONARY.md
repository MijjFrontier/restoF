# Diccionario de Datos del Proyecto RestoFlow

Este documento sirve como un diccionario de datos centralizado para el sistema RestoFlow. Describe en detalle cada una de las entidades de datos, sus atributos, tipos y el propósito que cumplen dentro de la aplicación.

La base de datos del proyecto está implementada en **Firebase Firestore** (NoSQL). Al ser NoSQL, las relaciones se manejan mediante referencias manuales de ID, no mediante Foreign Keys rígidas.

---

## 1. Entidad: `employees` (Empleados)
Almacena la información del personal autorizado para acceder al sistema.

| Campo (Field) | Tipo de Dato | Requerido | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | Sí | ID único generado por Firestore (Document ID). | `"2x5tF...gH9s"` |
| `name` | `string` | Sí | Nombre completo del empleado. | `"Juan Pérez"` |
| `role` | `enum` | Sí | Rol: `waiter`, `cashier`, `kitchen`. | `"waiter"` |
| `pin` | `number` | Sí | PIN numérico (4-8 dígitos) para login. | `1234` |

---

## 2. Entidad: `menu` (Artículos del Menú)
Catálogo de platos y bebidas ofrecidos por el restaurante.

| Campo (Field) | Tipo de Dato | Requerido | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | Sí | ID único generado por Firestore. | `"a9B...kLpM"` |
| `name` | `string` | Sí | Nombre del plato o bebida. | `"Lomo Saltado"` |
| `price` | `number` | Sí | Precio de venta en Soles (S/). | `35.50` |
| `category` | `enum` | Sí | Categoría: `Entradas`, `Platos Principales`, `Postres`, `Bebidas`. | `"Platos Principales"` |

---

## 3. Entidad: `tables` (Mesas)
Gestión del estado operativo del salón en tiempo real.

| Campo (Field) | Tipo de Dato | Requerido | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | Sí | ID único generado por Firestore. | `"m3sA...t7yU"` |
| `name` | `string` | Sí | Identificador visual de la mesa. | `"Mesa 5"` |
| `status` | `enum` | Sí | Estado: `free`, `occupied`, `reserved`, `ready`. | `"occupied"` |
| `waiterName` | `string` | No | Nombre del camarero que atiende (desnormalizado). | `"Ana Gómez"` |
| `order` | `array` | Sí | Lista de objetos `OrderItem`. | `[...]` |
| `orderStatus`| `enum` | No | Estado cocina: `cooking`, `preparing`, `ready`. | `"preparing"` |
| `orderTimestamp`| `timestamp`| No | Hora en que se envió el pedido original. | `2024-05-21...` |

### Sub-entidad: `OrderItem` (Dentro de `tables.order`)
| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Sí | ID referencial del menú. |
| `name` | `string` | Sí | Nombre del artículo (desnormalizado). |
| `price` | `number` | Sí | Precio unitario al momento del pedido. |
| `quantity` | `number` | Sí | Cantidad total solicitada. |
| `processedQuantity` | `number` | No | Cantidad que ya fue marcada como "Lista" por cocina. |
| `notes` | `string` | No | Instrucciones especiales (ej. "Sin sal"). |

---

## 4. Entidad: `transactions` (Transacciones)
Historial de pagos procesados para reportes y cierre de caja.

| Campo (Field) | Tipo de Dato | Requerido | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | Sí | ID único de la transacción. | `"T5r...W8qP"` |
| `tableId` | `string` | Sí | ID de la mesa de origen (referencia manual). | `"m3sA...t7yU"` |
| `tableName` | `string` | Sí | Nombre de la mesa al pagar (desnormalizado). | `"Mesa 5"` |
| `total` | `number` | Sí | Monto total recaudado. | `71.00` |
| `paymentMethod`| `string` | Sí | Método: `Efectivo`, `Tarjeta`, `Yape`, `Plin`. | `"Yape"` |
| `timestamp` | `timestamp` | Sí | Fecha y hora exacta del pago. | `2024-05-21...` |
| `order` | `array` | Sí | Copia del pedido final pagado (snapshot). | `[...]` |
