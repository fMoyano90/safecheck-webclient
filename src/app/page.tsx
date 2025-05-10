import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="flex flex-col items-center justify-center w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-primary rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">SC</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SafeCheck</h1>
          <p className="mt-2 text-sm text-gray-600">Panel de Administración</p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SafeCheck. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
