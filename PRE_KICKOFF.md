# Propuesta de Ambientes para el Proyecto RestoFlow

Este documento detalla la configuración y el propósito de los ambientes de Prueba (TEST) y Producción para el lanzamiento exitoso de RestoFlow. La arquitectura basada en Vercel y Firebase nos permite tener un flujo de trabajo moderno y eficiente.

---

## Ambiente de Pruebas (TEST)

El objetivo de este ambiente es probar exhaustivamente cada nueva funcionalidad o cambio en un entorno aislado y seguro, sin impactar nunca la operación real del restaurante.

*   **Plataforma y Despliegue:**
    *   **Despliegues de "Preview" en Vercel:** Por cada cambio que se suba al código, Vercel crea automáticamente una URL de previsualización única (ej: `restoflow-abc123.vercel.app`). Este es nuestro entorno de pruebas por defecto: una réplica exacta de la aplicación que podemos probar de forma aislada.

*   **Base de Datos:**
    *   **Proyecto de Firebase para Pruebas:** Se utilizará un proyecto de Firebase completamente separado (ej: `restoflow-test-db`). Esta base de datos contendrá datos ficticios: mesas de prueba, un menú de ejemplo, empleados ficticios, etc. Esto garantiza que las pruebas no generen "basura" en los datos reales del restaurante.

*   **Validaciones a Realizar (Checklist de Pruebas):**
    *   **Flujo de Autenticación:** Verificar que todos los roles (Camarero, Cajero, Cocina, Admin) pueden iniciar sesión con su PIN.
    *   **Flujo de Pedido Completo:**
        1.  Camarero toma un pedido y lo envía a cocina.
        2.  Verificar que el pedido aparece instantáneamente en la pantalla de Cocina.
        3.  Cocina marca el pedido como "Listo".
        4.  Verificar que el Camarero recibe la notificación visual de que el pedido está listo para servir.
    *   **Flujo de Pago:** El Cajero procesa el pago de una mesa ocupada, genera el recibo y verifica que la mesa se libera automáticamente.
    *   **Gestión de Administrador:** Crear, editar y eliminar empleados, artículos del menú y mesas.
    *   **Reportes:** Validar que el cierre de caja y los reportes de ventas se generan correctamente con las transacciones de prueba.
    *   **Sincronización:** Confirmar que los cambios de estado (ej: de "ocupada" a "listo") se reflejan en tiempo real en todos los dispositivos conectados.

---

## Ambiente de Producción (PRODUCCIÓN)

Este es el ambiente final que el personal del restaurante utilizará en su día a día. Solo se despliega código que ha sido previamente validado y aprobado en el ambiente de TEST.

*   **Plataforma y Despliegue:**
    *   **Despliegue Principal en Vercel:** Es la URL principal y pública de la aplicación (ej: `app.restoflow.com`). Este entorno se actualiza únicamente cuando los cambios se integran en la rama principal del repositorio, asegurando máxima estabilidad.

*   **Base de Datos:**
    *   **Proyecto de Firebase para Producción:** Se conectará a un segundo proyecto de Firebase, dedicado exclusivamente a la operación real (ej: `restoflow-produccion`). Esta base de datos contendrá la información real y crítica del negocio. Estará completamente aislada de los datos de prueba.

*   **Puesta en Marcha (Go-Live):**
    *   **Configuración Inicial (Setup):**
        1.  Carga masiva del menú real del restaurante en la base de datos de producción.
        2.  Creación de todas las cuentas de empleados reales con sus roles y PINs de acceso.
        3.  Configuración del número inicial de mesas.
    *   **Capacitación (Training):** Realizar la capacitación final al personal del restaurante utilizando el sistema de producción real.
    *   **Lanzamiento:** Inicio de la operación del restaurante utilizando RestoFlow en los dispositivos designados (tablets para camareros, PC para caja, pantalla para cocina).

*   **Operación y Monitorización:**
    *   Supervisión continua del rendimiento de la aplicación y la base de datos durante las horas de servicio para garantizar una operación fluida.
    *   Aplicación de respaldos automáticos de la base de datos de producción, una función nativa de Firebase.
