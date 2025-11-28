// src/components/auth/SignupCredentialsStep.jsx
import { motion } from "framer-motion";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdCancel,
  MdLocationCity,
  MdHome,
  MdPerson,
  MdBadge,
  MdPhoneIphone,
  MdTransgender,
  MdDiversity3,
} from "react-icons/md";
import Input from "../Input";
import PasswordInput from "../PasswordInput";

const variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: { opacity: 0, x: 12, transition: { duration: 0.22, ease: "easeIn" } },
};

function Rule({ ok, label }) {
  return (
    <li
      className={`flex items-center gap-2 ${
        ok ? "text-white/85" : "text-white/55"
      }`}
    >
      {ok ? (
        <MdCheckCircle size={18} className="text-emerald-400" />
      ) : (
        <MdCancel size={18} className="text-red-300/80" />
      )}
      <span>{label}</span>
    </li>
  );
}

export default function SignupCredentialsStep({
  emailFixed, // ya no se usa
  values,
  setValues,
  errors,
  rules,
  onBack,
  onSubmit,
  onToLogin,
}) {
  return (
    <motion.form
      key="signup-step2"
      onSubmit={onSubmit}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* DATOS PERSONALES / CONTACTO */}
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

        {/* Rango de edad */}
        <div>
          <label className="block text-sm text-white/80 mb-1">
            Rango de edad
          </label>
          <div className="relative">
            <select
              value={values.ageRange || ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, ageRange: e.target.value }))
              }
              className={`w-full h-12 rounded-full bg-white/10 px-4 pr-10 text-sm outline-none border appearance-none
                ${errors.ageRange ? "border-red-400" : "border-white/15"}
                focus:border-[#6C4CFF] text-white/90
                [&>option]:bg-white [&>option]:text-slate-900
              `}
            >
              <option value="">Selecciona una opción</option>
              <option value="adolescente">Adolescente (13–17)</option>
              <option value="adulto">Adulto (18–59)</option>
              <option value="adulto_mayor">Adulto mayor (60 o más)</option>
            </select>
          </div>
          {errors.ageRange && (
            <p className="mt-1 text-xs text-red-300">{errors.ageRange}</p>
          )}
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm text-white/80 mb-1">Género</label>
          <div className="relative">
            <select
              value={values.genero || ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, genero: e.target.value }))
              }
              className={`w-full h-12 rounded-full bg-white/10 px-4 pr-10 text-sm outline-none border appearance-none
                ${errors.genero ? "border-red-400" : "border-white/15"}
                focus:border-[#6C4CFF] text-white/90
                [&>option]:bg-white [&>option]:text-slate-900
              `}
            >
              <option value="">Selecciona una opción</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="no_binaria">Persona no binaria</option>
              <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
            </select>
            <MdTransgender
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none"
            />
          </div>
          {errors.genero && (
            <p className="mt-1 text-xs text-red-300">{errors.genero}</p>
          )}
        </div>

        {/* Enfoque diferencial */}
        <div>
          <label className="block text-sm text-white/80 mb-1">
            Enfoque diferencial
          </label>
          <div className="relative">
            <select
              value={values.enfoque || ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, enfoque: e.target.value }))
              }
              className={`w-full h-12 rounded-full bg-white/10 px-4 pr-10 text-sm outline-none border appearance-none
                ${errors.enfoque ? "border-red-400" : "border-white/15"}
                focus:border-[#6C4CFF] text-white/90
                [&>option]:bg-white [&>option]:text-slate-900
              `}
            >
              <option value="">Selecciona una opción</option>
              <option value="lgbtiq">Población LGBTIQ+</option>
              <option value="etnica">
                Población étnica (afro, indígena, raizal, Rrom)
              </option>
              <option value="victima_conflicto">
                Víctima del conflicto armado
              </option>
              <option value="discapacidad">Persona con discapacidad</option>
              <option value="mujer_cabeza_hogar">Mujer cabeza de hogar</option>
              <option value="persona_mayor">Persona mayor</option>
              <option value="joven">Joven</option>
              <option value="ninguno">Ninguno</option>
              <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
            </select>
            <MdDiversity3
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none"
            />
          </div>
          {errors.enfoque && (
            <p className="mt-1 text-xs text-red-300">{errors.enfoque}</p>
          )}
        </div>
      </div>

      {/* CONTRASEÑA */}
      <div className="space-y-5 mt-6">
        <PasswordInput
          placeholder="Contraseña"
          value={values.pass}
          onChange={(e) => setValues((v) => ({ ...v, pass: e.target.value }))}
          size="lg"
          iconLeft={<MdLock size={18} />}
          iconShow={<MdVisibility size={18} />}
          iconHide={<MdVisibilityOff size={18} />}
          error={errors.pass}
        />
        <PasswordInput
          placeholder="Confirmar contraseña"
          value={values.confirm}
          onChange={(e) =>
            setValues((v) => ({ ...v, confirm: e.target.value }))
          }
          size="lg"
          iconLeft={<MdLock size={18} />}
          iconShow={<MdVisibility size={18} />}
          iconHide={<MdVisibilityOff size={18} />}
          error={errors.confirm}
        />
      </div>

      <ul className="mt-3 mb-4 space-y-1.5 text-sm">
        <Rule ok={rules.len} label="8 caracteres mínimo" />
        <Rule ok={rules.upper} label="1 letra mayúscula" />
        <Rule ok={rules.special} label="1 carácter especial" />
      </ul>

      {/* Aceptación de términos */}
      <div className="mb-2">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={values.accept}
            onChange={(e) =>
              setValues((v) => ({ ...v, accept: e.target.checked }))
            }
            className="mt-1 accent-[#6C4CFF]"
          />
          <span className={errors.accept ? "text-red-300" : "text-white/80"}>
            Acepto{" "}
            <a
              href="/legal/terms-privacy#privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Aviso de Privacidad
            </a>
            ,{" "}
            <a
              href="/legal/terms-privacy#terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Condiciones de Uso
            </a>{" "}
            y{" "}
            <a
              href="/legal/data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Política de Protección de Datos
            </a>
            .
          </span>
        </label>
        {errors.accept && (
          <p className="mt-1 text-xs text-red-300">{errors.accept}</p>
        )}
      </div>

      <div className="flex gap-3 mt-4 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="h-12 w-1/3 rounded-full bg-white/10 hover:bg-white/15 transition"
        >
          Volver
        </button>
        <button
          type="submit"
          className="h-12 flex-1 rounded-full bg-[#6C4CFF] font-medium shadow-[0_6px_18px_rgba(108,76,255,0.35)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Crear cuenta
        </button>
      </div>

      <div className="text-center text-sm text-white/80">
        <div>¿Ya tienes cuenta?</div>
        <button
          type="button"
          onClick={onToLogin}
          className="underline underline-offset-4"
        >
          Inicia sesión.
        </button>
      </div>
    </motion.form>
  );
}
