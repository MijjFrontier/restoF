# Diccionario de Datos del Proyecto RestoFlow

Este documento sirve como un diccionario de datos centralizado para el sistema RestoFlow. Describe en detalle cada una de las entidades de datos, sus atributos, tipos y el propósito que cumplen dentro de la aplicación.

La base de datos del proyecto está implementada en **Firebase Firestore**, una base de datos NoSQL. Las entidades de datos que se describen a continuación se corresponden directamente con las "colecciones" de documentos en Firestore.

---

## 1. Entidad: `employees` (Empleados)

Esta colección almacena la información de todos los empleados del restaurante que pueden acceder al sistema.

| Campo (Field) | Tipo de Dato | Descripción                                                               | Ejemplo                                      |
| :------------ | :----------- | :------------------------------------------------------------------------ | :------------------------------------------- |
| `id`          | `string`     | Identificador único del documento, generado automáticamente por Firestore. | ` "2x5tF...gH9s"`                            |
| `name`        | `string`     | Nombre completo del empleado.                                             | `"Juan Pérez"`                               |
| `role`        | `string`     | Rol del empleado en el sistema. Define a qué interfaz tiene acceso.        | `"waiter"`, `"cashier"`, `"kitchen"`         |
| `pin`         | `string`     | PIN numérico de 4 a 8 dígitos para el inicio de sesión.                   | `"1234"`                                     |

---

## 2. Entidad: `menu` (Artículos del Menú)

Esta colección contiene todos los productos (platos y bebidas) que el restaurante ofrece.

| Campo (Field) | Tipo de Dato | Descripción                                                               | Ejemplo                                      |
| :------------ | :----------- | :------------------------------------------------------------------------ | :------------------------------------------- |
| `id`          | `string`     | Identificador único del documento, generado automáticamente por Firestore. | ` "a9B...kLpM"`                              |
| `name`        | `string`     | Nombre del plato o bebida.                                                | `"Lomo Saltado"`                             |
| `price`       | `number`     | Precio de venta del artículo en la moneda local (Soles).                  | `35.50`                                      |
| `category`    | `string`     | Categoría a la que pertenece el artículo para organizar el menú.          | `"Platos Principales"`, `"Bebidas"`, etc.    |

---

## 3. Entidad: `tables` (Mesas)

Esta es la colección principal que gestiona el estado operativo del restaurante. Cada documento representa una mesa.

| Campo (Field)       | Tipo de Dato        | Descripción                                                                                                | Ejemplo                                                               |
| :------------------ | :------------------ | :--------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `id`                | `string`            | Identificador único del documento, generado automáticamente por Firestore.                                    | `"m3sA...t7yU"`                                                       |
| `name`              | `string`            | Nombre o número identificador de la mesa.                                                                  | `"Mesa 5"`                                                            |
| `status`            | `string`            | Estado actual de la mesa: `free` (libre), `occupied` (ocupada).                                            | `"occupied"`                                                          |
| `order`             | `array` (de `OrderItem`) | Un arreglo de objetos que representa el pedido actual de la mesa. Si está vacío, la mesa no tiene un pedido activo. | `[{ id: "a9B...", name: "Lomo Saltado", price: 35.50, quantity: 2, notes: "Sin cebolla" }]` |
| `waiterName`        | `string` (opcional) | Nombre del camarero que está atendiendo la mesa.                                                           | `"Ana Gómez"`                                                         |
| `orderStatus`       | `string` (opcional) | Estado del pedido en la cocina: `cooking` (cocinándose) o `ready` (listo para servir).                      | `"ready"`                                                             |
| `orderTimestamp`    | `Timestamp` (Fecha) | Marca de tiempo que indica cuándo se envió el pedido a la cocina. Usado para ordenar en la vista de cocina. | `2024-05-21T14:30:00Z`                                                |

#### Sub-entidad: `OrderItem` (dentro de `tables.order`)

| Campo (Field) | Tipo de Dato | Descripción                                                                       | Ejemplo             |
| :------------ | :----------- | :-------------------------------------------------------------------------------- | :------------------ |
| `id`          | `string`     | El ID del artículo, copiado de la colección `menu`.                               | `"a9B...kLpM"`      |
| `name`        | `string`     | Nombre del artículo.                                                              | `"Lomo Saltado"`    |
| `price`       | `number`     | Precio unitario del artículo.                                                     | `35.50`             |
| `category`    | `string`     | Categoría del artículo.                                                           | `"Platos Principales"` |
| `quantity`    | `number`     | Cantidad de este artículo que se ha pedido.                                       | `2`                 |
| `notes`       | `string` (opcional) | Notas o instrucciones especiales para la cocina sobre este artículo específico. | `"Sin cebolla"`     |

---

## 4. Entidad: `transactions` (Transacciones)

Esta colección guarda un registro histórico de todos los pagos que se han procesado. Es la fuente de datos para los reportes de ventas y cierres de caja.

| Campo (Field)   | Tipo de Dato        | Descripción                                                               | Ejemplo                                                              |
| :-------------- | :------------------ | :------------------------------------------------------------------------ | :------------------------------------------------------------------- |
| `id`            | `string`            | Identificador único del documento, generado automáticamente por Firestore. | `"T5r...W8qP"`                                                       |
| `tableId`       | `string`            | El ID de la mesa donde se realizó la transacción.                         | `"m3sA...t7yU"`                                                      |
| `tableName`     | `string`            | El nombre de la mesa en ese momento.                                      | `"Mesa 5"`                                                           |
| `order`         | `array` (de `OrderItem`) | Una copia del pedido que fue pagado.                                      | `[{ id: "a9B...", name: "Lomo Saltado", price: 35.50, quantity: 2 }]` |
| `total`         | `number`            | El monto total que se pagó en esta transacción.                           | `71.00`                                                              |
| `paymentMethod` | `string`            | El método de pago utilizado.                                              | `"Tarjeta"`, `"Efectivo"`, `"Yape"`, `"Plin"`                        |
| `timestamp`     | `Timestamp` (Fecha) | La fecha y hora exactas en que se procesó el pago.                        | `2024-05-21T15:10:00Z`                                               |
