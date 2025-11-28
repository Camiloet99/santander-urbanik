// src/components/auth/SignupPersonalStep.jsx
import { motion } from "framer-motion";
import {
  MdEmail,
  MdLocationCity,
  MdHome,
  MdPerson,
  MdBadge,
  MdPhoneIphone,
} from "react-icons/md";
import Input from "../Input";

const variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: { opacity: 0, x: 12, transition: { duration: 0.22, ease: "easeIn" } },
};

export default function SignupPersonalStep({
  values,
  setValues,
  errors,
  onNext,
  onToLogin,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    onNext(); // validación se hace en AuthGateway
  }

  return (
    <motion.form
      key="signup-step1"
      onSubmit={handleSubmit}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="space-y-4">
        <Input
          autoFocus
          placeholder="Municipio de residencia"
          value={values.municipio || ""}
          onChange={(e) =>
            setValues((v) => ({ ...v, municipio: e.target.value }))
          }
          size="lg"
          iconLeft={<MdLocationCity size={18} />}
          aria-invalid={!!errors.municipio}
        />
        {errors.municipio && (
          <p className="mt-1 text-xs text-red-300">{errors.municipio}</p>
        )}

        <Input
          placeholder="Barrio, vereda o sector"
          value={values.barrio || ""}
          onChange={(e) => setValues((v) => ({ ...v, barrio: e.target.value }))}
          size="lg"
          iconLeft={<MdHome size={18} />}
          aria-invalid={!!errors.barrio}
        />
        {errors.barrio && (
          <p className="mt-1 text-xs text-red-300">{errors.barrio}</p>
        )}

        <Input
          placeholder="Nombres y apellidos"
          value={values.nombresApellidos || ""}
          onChange={(e) =>
            setValues((v) => ({ ...v, nombresApellidos: e.target.value }))
          }
          size="lg"
          iconLeft={<MdPerson size={18} />}
          aria-invalid={!!errors.nombresApellidos}
        />
        {errors.nombresApellidos && (
          <p className="mt-1 text-xs text-red-300">{errors.nombresApellidos}</p>
        )}

        <Input
          placeholder="Número de documento (cédula)"
          value={values.cedula || ""}
          onChange={(e) => setValues((v) => ({ ...v, cedula: e.target.value }))}
          size="lg"
          iconLeft={<MdBadge size={18} />}
          aria-invalid={!!errors.cedula}
        />
        {errors.cedula && (
          <p className="mt-1 text-xs text-red-300">{errors.cedula}</p>
        )}

        <Input
          placeholder="Correo electrónico"
          type="email"
          value={values.email || ""}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          size="lg"
          iconLeft={<MdEmail size={18} />}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-300">{errors.email}</p>
        )}

        {/* Celular con prefijo +57 */}
        <div>
          <div className="flex gap-3">
            <div className="h-12 px-4 rounded-full bg-white/10 border border-white/15 text-sm flex items-center text-white/80">
              +57
            </div>
            <div className="flex-1">
              <Input
                placeholder="Número de celular"
                type="tel"
                value={values.celular || ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, celular: e.target.value }))
                }
                size="lg"
                iconLeft={<MdPhoneIphone size={18} />}
                aria-invalid={!!errors.celular}
              />
            </div>
          </div>
          {errors.celular && (
            <p className="mt-1 text-xs text-red-300">{errors.celular}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6 mb-2">
        <button
          type="button"
          onClick={onToLogin}
          className="h-12 w-1/3 rounded-full bg-white/10 hover:bg-white/15 transition"
        >
          Iniciar Sesion
        </button>
        <button
          type="submit"
          className="h-12 flex-1 rounded-full bg-[#6C4CFF] font-medium shadow-[0_6px_18px_rgba(108,76,255,0.35)] transition hover:opacity-90"
        >
          Continuar
        </button>
      </div>
    </motion.form>
  );
}
