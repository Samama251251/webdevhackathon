import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t bg-muted/30 py-8"
    >
      <div className="container px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="text-lg font-semibold">CareerPrep</span>
            <p className="text-sm text-muted-foreground">
              AI-Powered Career Preparation Platform
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </a>
            <a
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CareerPrep. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}

