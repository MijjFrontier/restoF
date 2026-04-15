# Análisis del Desarrollo de RestoFlow

Este documento detalla cómo el proyecto RestoFlow cumple con los requisitos de desarrollo de Frontend y Backend especificados, utilizando tecnologías modernas y un enfoque serverless.

---

## Desarrollo del Frontend

El frontend de RestoFlow se ha desarrollado siguiendo las mejores prácticas y tecnologías web modernas para asegurar una experiencia de usuario fluida, reactiva y adaptable.

-   **Framework Principal (Next.js 15 + React 18):** La aplicación utiliza **Next.js 15** con el **App Router**. Esto nos permite una arquitectura de componentes robusta, carga optimizada y una navegación instantánea.
-   **Diseño Visual (Tailwind CSS + Shadcn/UI):** Uso de un sistema de diseño consistente y responsivo para tablets y escritorio.
-   **Sincronización en Tiempo Real:** Implementación de listeners de Firestore (`onSnapshot`) en módulos críticos (Cocina, Camarero, Cajero) para evitar recargas manuales.

---

## Desarrollo del Backend (Serverless Architecture)

El backend utiliza el modelo de **Server Actions** de Next.js, lo que simplifica la comunicación cliente-servidor sin necesidad de gestionar endpoints de API REST tradicionales.

### Manejo de Peticiones y Códigos de Estado
En los logs de plataforma (como Vercel), es normal observar que tanto las peticiones `GET` como `POST` devuelven un código **200 OK**:

1.  **GET 200:** Indica que la carga de la página o la obtención inicial de datos fue exitosa.
2.  **POST 200 (Server Actions):** Las mutaciones de datos se realizan mediante peticiones `POST`. Next.js devuelve un código `200` por defecto cuando la acción del servidor se ejecuta correctamente, encapsulando el resultado (éxito o error controlado) dentro del cuerpo de la respuesta.

---

## Base de Datos (Firebase Firestore)

-   **Modelo NoSQL:** Estructura flexible basada en documentos.
-   **Integridad Referencial Manual:** Al ser NoSQL, no existen las "Foreign Keys" nativas. La integridad de los datos se gestiona mediante:
    -   **Referencias de ID:** Uso de IDs de documentos para vincular entidades (ej. `tableId` en transacciones).
    -   **Desnormalización:** Almacenamiento redundante de datos críticos (como el nombre de la mesa en el ticket de pago) para optimizar la velocidad de lectura de reportes.
-   **Seguridad:** Control de acceso mediante PIN numérico (almacenado como `number`) y lógica de validación en Server Actions.
-   **Persistencia:** Gestión de estados de mesa (`free`, `occupied`, `reserved`) y seguimiento de preparación en cocina mediante `processedQuantity`.

---

## Seguridad y Control de Acceso

-   **Protección contra Fuerza Bruta:** Implementación de un bloqueo temporal (30 segundos) tras 3 intentos fallidos de PIN en el login.
-   **Roles de Usuario:** Interfaces diferenciadas para Administradores, Camareros, Cajeros y Cocina.
-   **Acceso Admin:** Protegido por un PIN maestro centralizado.
