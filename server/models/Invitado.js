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
    qrToken: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true
    },
    estado: {
      type: String,
      enum: ['VIGENTE', 'USADO', 'CANCELADO'],
      default: 'VIGENTE',
      index: true
    },
    fechaRegistro: {
      type: Date,
      default: Date.now
    },
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
