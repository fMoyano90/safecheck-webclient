import React, { useState, useEffect } from 'react';
import { Supervisor, SupervisorFormData } from '@/lib/api/supervisors';

interface SupervisorFormProps {
  supervisor: Supervisor | null;
  isEditing: boolean;
  onSubmit: (data: SupervisorFormData) => void;
  onCancel: () => void;
}

export default function SupervisorForm({
  supervisor,
  isEditing,
  onSubmit,
  onCancel,
}: SupervisorFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    emergencyContactPhone: '',
    position: '',
    rut: '',
    companyId: 1, // Valor por defecto, ajustar según la aplicación
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && supervisor) {
      setFormData({
        firstName: supervisor.firstName || '',
        lastName: supervisor.lastName || '',
        email: supervisor.email || '',
        password: '',
        confirmPassword: '',
        phone: supervisor.phone || '',
        emergencyContactPhone: supervisor.emergencyContactPhone || '',
        position: supervisor.position || '',
        rut: supervisor.rut || '',
        companyId: supervisor.companyId || 1,
      });
    }
  }, [isEditing, supervisor]);

  const formatRut = (rut: string): string => {
    // Eliminar puntos y guiones
    let valor = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Eliminar caracteres no numéricos ni k/K
    valor = valor.replace(/[^0-9kK]/g, '');
    
    // Si no hay suficientes caracteres, devolver el valor tal cual
    if (valor.length < 2) return valor;
    
    // Obtener el dígito verificador (último carácter)
    const dv = valor.slice(-1);
    // Obtener el cuerpo del RUT (todos los dígitos excepto el verificador)
    const rutBody = valor.slice(0, -1);
    
    // Formatear el cuerpo del RUT con puntos
    let rutFormateado = '';
    let i = rutBody.length;
    
    while (i > 0) {
      const inicio = Math.max(i - 3, 0);
      rutFormateado = rutBody.substring(inicio, i) + (rutFormateado ? '.' + rutFormateado : '');
      i = inicio;
    }
    
    // Agregar el guión y el dígito verificador
    return rutFormateado + '-' + dv;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicar formato especial para el RUT
    if (name === 'rut') {
      const rutFormateado = formatRut(value);
      setFormData((prev) => ({
        ...prev,
        [name]: rutFormateado,
      }));
      
      // Validación en tiempo real del RUT
      if (rutFormateado.length > 3) { // Solo validar cuando tenga suficientes caracteres
        if (!validarRut(rutFormateado) && rutFormateado.includes('-')) {
          setErrors((prev) => ({
            ...prev,
            rut: 'RUT inválido. Verifica el dígito verificador',
          }));
        } else {
          // Limpiar error si el RUT es válido
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.rut;
            return newErrors;
          });
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Limpiar error al cambiar el valor
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Validar RUT chileno
  const validarRut = (rut: string): boolean => {
    if (!rut) return true; // Si está vacío, no validamos (no es campo obligatorio)
    
    // Eliminar puntos y guiones
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Verificar formato básico
    if (!/^[0-9]{7,8}[0-9kK]$/.test(rutLimpio)) {
      return false;
    }
    
    // Obtener dígito verificador
    const dv = rutLimpio.slice(-1).toUpperCase();
    // Obtener cuerpo del RUT
    const rutCuerpo = parseInt(rutLimpio.slice(0, -1), 10);
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    // Convertir a string para procesar dígito por dígito
    const rutComoTexto = rutCuerpo.toString();
    
    // Recorrer cada dígito de derecha a izquierda
    for (let i = rutComoTexto.length - 1; i >= 0; i--) {
      suma += parseInt(rutComoTexto.charAt(i), 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    let dvCalculado;
    
    if (dvEsperado === 11) {
      dvCalculado = '0';
    } else if (dvEsperado === 10) {
      dvCalculado = 'K';
    } else {
      dvCalculado = dvEsperado.toString();
    }
    
    // Comparar dígito verificador calculado con el proporcionado
    return dv === dvCalculado;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
        newErrors.password =
          'La contraseña debe contener al menos 1 letra mayúscula, 1 minúscula y 1 número';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
        newErrors.password =
          'La contraseña debe contener al menos 1 letra mayúscula, 1 minúscula y 1 número';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    // Validar RUT chileno si se ha ingresado
    if (formData.rut && !validarRut(formData.rut)) {
      newErrors.rut = 'El RUT ingresado no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Eliminar campos que no se envían a la API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...dataToSubmit } = formData;
      
      // Si estamos editando y no se cambió la contraseña, no la enviamos
      const finalData: SupervisorFormData = { ...dataToSubmit };
      if (isEditing && !finalData.password) {
        // Crear una copia sin la propiedad password
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...dataWithoutPassword } = finalData;
        onSubmit(dataWithoutPassword);
      } else {
        onSubmit(finalData);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Editar Supervisor' : 'Añadir Nuevo Supervisor'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-800">
              Nombre
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ingresa el nombre"
              className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 px-3 h-10 leading-10 ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-800">
              Apellido
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ingresa el apellido"
              className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 px-3 h-10 leading-10 ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600 font-medium">{errors.lastName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 px-3 h-10 leading-10 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-800">
              Teléfono
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+56 9 1234 5678"
              className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 px-3 h-10 leading-10 ${errors.position ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-800">
              Cargo
            </label>
            <input
              type="text"
              name="position"
              id="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Supervisor de área"
              className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 px-3 h-10 leading-10 ${errors.position ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
            />
          </div>

          <div>
            <label htmlFor="rut" className="block text-sm font-medium text-gray-800">
              RUT
            </label>
            <div className="relative">
              <input
                type="text"
                name="rut"
                id="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12345678-9"
                className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 px-3 h-10 leading-10 pr-10 ${errors.rut ? 'border-red-500 focus:border-red-500' : formData.rut && formData.rut.includes('-') && validarRut(formData.rut) ? 'border-green-500 focus:border-green-500' : 'border-gray-300 focus:border-primary'}`}
              />
              {formData.rut && formData.rut.includes('-') && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {validarRut(formData.rut) ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {errors.rut && <p className="mt-1 text-sm text-red-600 font-medium">{errors.rut}</p>}
            {!errors.rut && formData.rut && formData.rut.includes('-') && validarRut(formData.rut) && (
              <p className="mt-1 text-sm text-green-600 font-medium">RUT válido</p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-800">
              Teléfono de Emergencia
            </label>
            <input
              type="text"
              name="emergencyContactPhone"
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              placeholder="+56 9 8765 4321"
              className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 px-3 h-10 leading-10 ${errors.position ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
            />
          </div>

          <div className="sm:col-span-2">
            <div className="border-t border-gray-200 pt-4 mt-2"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Credenciales</h3>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800">
              {isEditing ? 'Nueva Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 pr-10 px-3 h-10 leading-10 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600 font-medium">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800">
              Confirmar Contraseña
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                className={`w-full rounded-md shadow-sm focus:ring-primary text-base text-gray-900 pr-10 px-3 h-10 leading-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
