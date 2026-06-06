export function Footer() {
  return (
    <footer className="border-t border-foreground/10 py-6">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CareerPrep AI. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          All systems operational
        </div>
      </div>
    </footer>
  );
}
