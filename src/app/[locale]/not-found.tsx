import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto">
          <span className="text-2xl font-bold text-primary-foreground">404</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-lg gradient-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
