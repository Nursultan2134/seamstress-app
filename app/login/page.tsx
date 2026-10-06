import { PinPad } from "@/components/pin-pad/PinPad";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Швейный цех</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Введите свой PIN для входа</p>
      </div>
      <PinPad />
    </main>
  );
}
