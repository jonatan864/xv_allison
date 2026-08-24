# XV Allison - Control de Acceso

PWA React + API Express para registrar invitados, generar QR unicos y validar accesos contra MongoDB.

## Backend

```bash
cd server
npm install
npm run dev
```

Variables disponibles en `.env.example`.

## Frontend

```bash
cd client
npm install
npm run dev
```

Variables disponibles en `client/.env.example`.

## API inicial

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/invitados`
- `GET /api/invitados`
- `GET /api/invitados/:id`
- `PUT /api/invitados/:id`
- `DELETE /api/invitados/:id`
- `POST /api/invitados/validar-qr`

La validacion de QR usa una actualizacion atomica en MongoDB para evitar doble entrada simultanea.
