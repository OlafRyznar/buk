import AuthForm from "@/components/AuthForm";
import BrandLogo from "@/components/BrandLogo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <BrandLogo size={48} className="mx-auto mb-4 rounded-xl" />
          <h1 className="text-2xl font-bold text-white">Zaloguj się do BukScan</h1>
          <p className="mt-1 text-sm text-white/52">Wpisz swoje dane, aby wrócić do panelu arbitrażu.</p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
