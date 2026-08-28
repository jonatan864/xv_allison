import mongoose from 'mongoose';

const invitadoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },

    telefono: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ''
    },

    pases: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },

    // Número de accesos que ya han sido utilizados.
    accesosUsados: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    qrToken: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true
    },

    estado: {
      type: String,
      enum: ['VIGENTE', 'CADUCADO', 'CANCELADO'],
      default: 'VIGENTE',
      index: true
    },

    fechaRegistro: {
      type: Date,
      default: Date.now
    },

    // Conservamos este campo para registrar la última entrada.
    fechaEntrada: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Invitado = mongoose.model('Invitado', invitadoSchema);