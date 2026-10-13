export function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f0]" aria-live="polite">
      <div className="flex items-center gap-3 text-sage-800">
        <span className="h-3 w-3 animate-pulse rounded-full bg-sage-700" />
        <span className="font-medium">Getting your Nurturely space ready…</span>
      </div>
    </main>
  );
}
