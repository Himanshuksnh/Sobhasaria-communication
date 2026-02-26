'use client';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Communication Lab Attendance System
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All rights reserved
            </p>
          </div>

          {/* Right: Developer Info */}
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              Developed by{' '}
              <span className="font-semibold text-foreground">
                Himanshu Kumawat
              </span>
            </p>
            <div className="flex items-center justify-center md:justify-end gap-3 mt-2">
              <a
                href="mailto:himanshunokhval@gmail.com"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                📧 Email
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="https://github.com/Himasnhukumawat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                💻 GitHub
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="https://linkedin.com/in/himanshu-kumawat-b066ba381"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                🔗 LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Bottom: Tech Stack (Optional) */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <p className="text-xs text-center text-muted-foreground">
            Built with Next.js, React, TypeScript, Firebase & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
