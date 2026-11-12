# Puesto de Chance API

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![Jest](https://img.shields.io/badge/tests-Jest-C21325?logo=jest&logoColor=white)

API REST para administrar un puesto de chance: autenticación por roles, sorteos de Chance y Baloto, venta y consulta de tiquetes, liquidación y pago de premios, y cierre diario de caja.

> **Almacenamiento:** los datos se guardan en memoria y se inicializan con usuarios y sorteos de demostración al iniciar el proceso. Se pierden al reiniciar el servidor; esta versión no está preparada para producción.

## Requisitos previos

- Node.js 18 o superior.
- npm (incluido con Node.js).
- Git, para clonar el repositorio.

## Instalación y ejecución local

Desde una terminal:

```bash
git clone https://github.com/crgonzalez3212/documentacionApi.git
cd documentacionApi
npm install
```

1. Crea el archivo de entorno a partir de la plantilla:

   ```bash
   cp .env.example .env
   ```

   En Windows PowerShell, usa `Copy-Item .env.example .env`. Antes de desplegar, reemplaza `JWT_SECRET` por un secreto aleatorio y privado. No publiques el archivo `.env`.

2. Inicia el servidor:

   ```bash
   npm run dev
   ```

   La API queda disponible en `http://localhost:3000`. Para ejecutar sin `nodemon`, usa `npm start`.

3. Comprueba el estado y abre la documentación:

   - Estado: `GET http://localhost:3000/health`
   - Swagger UI interactivo: `http://localhost:3000/api-docs`
   - Especificación OpenAPI JSON: `http://localhost:3000/api-docs.json`

4. Ejecuta las pruebas:

   ```bash
   npm test
   ```

## Variables de entorno

La aplicación carga estas variables desde `.env`. Si se omiten, usa los valores predeterminados indicados por el código.

| Variable | Predeterminado | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP del servidor. |
| `JWT_SECRET` | `cambiar-este-secreto` | Secreto para firmar tokens JWT. Debe reemplazarse con un valor privado y aleatorio. |
| `JWT_EXPIRES_IN` | `8h` | Vigencia del token JWT (formato aceptado por `jsonwebtoken`). |
| `ZONA_HORARIA` | `America/Bogota` | Zona horaria usada para fechas locales de caja. |
| `MINUTOS_ANULACION` | `10` | Ventana, en minutos desde la venta, para que un vendedor anule un tiquete. |
| `MINUTOS_CIERRE_VENTAS` | `15` | Minutos antes del sorteo en que se bloquean las ventas. |
| `APUESTA_MIN_CHANCE` | `500` | Valor mínimo por apuesta de Chance. |
| `APUESTA_MAX_CHANCE` | `50000` | Valor máximo por apuesta de Chance. |
| `VALOR_BALOTO` | `5700` | Precio por jugada de Baloto. |
| `DIAS_CADUCIDAD_PREMIO` | `365` | Vigencia del premio a partir de la fecha en que se juega el sorteo. |

## Usuarios de demostración

El almacén en memoria crea estas cuentas para desarrollo y pruebas:

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Vendedor | `vendedor1` | `vende123` |
| Vendedor | `vendedor2` | `vende456` |

No uses estas credenciales en un entorno real. La interfaz interactiva de Swagger permite autenticar solicitudes protegidas con el botón **Authorize** y un token obtenido en `/auth/login`.

## Módulos principales

- **Autenticación:** inicio de sesión y consulta del perfil con JWT.
- **Sorteos:** consulta y creación por administradores, registro de resultados y liquidación de tiquetes.
- **Tiquetes:** venta de Chance/Baloto, consulta, anulación y pago de premios.
- **Caja:** resumen diario y cierre por vendedor.

La matriz de trazabilidad y la documentación de rutas están en [docs/RTM.md](docs/RTM.md) y [Swagger UI](http://localhost:3000/api-docs), respectivamente.
