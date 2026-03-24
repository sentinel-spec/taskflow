export function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 flex w-full grow flex-col items-center justify-center py-6">
      <div className="relative flex w-full max-w-90 flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
