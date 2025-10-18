import Link from 'next/link';

export function Header() {
  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors">
            LectioToday
          </h1>
        </Link>
        <Link
          href="/archive"
          className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
        >
          Archive
        </Link>
      </div>
    </header>
  );
}

