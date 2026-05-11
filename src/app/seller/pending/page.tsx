import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';

export default function SellerPendingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen px-4 md:px-8 flex items-center justify-center text-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-serif mb-6 text-[var(--color-warning)] italic">Account Pending Review.</h1>
          <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">
            Your merchant application is currently under review by the Buy&Sell administrators. 
            We curate our sellers carefully to ensure the highest quality marketplace. You will be able to access your dashboard once approved.
          </p>
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="ghost">Sign Out</Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
