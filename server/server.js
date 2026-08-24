import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import http from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { connectDb } from './config/db.js';
import { assertProductionEnv, env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import { invitadosRoutes } from './routes/invitadosRoutes.js';
import { seedInitialUsers } from './services/seedService.js';
import { initSocket } from './services/socketService.js';

assertProductionEnv();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

initSocket(io);

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'xv-allison-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/invitados', invitadosRoutes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDb();
  await seedInitialUsers();

  server.listen(env.port, () => {
    console.log(`API XV Allison escuchando en puerto ${env.port}`);
  });
}

start().catch((error) => {
  console.error('No se pudo iniciar el servidor', error);
  process.exit(1);
});
