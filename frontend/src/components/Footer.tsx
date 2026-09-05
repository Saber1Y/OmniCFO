"use client";

const team = [
  { name: "Saber", url: "https://github.com/winsznx" },
  { name: "Enoch", url: "https://github.com/ENOCH208" },
  { name: "Daniel", url: "https://github.com/danielAsaboro" },
  { name: "Huda", url: "https://github.com/PugarHuda" },
  { name: "Parth", url: "https://www.github.com/mittal-parth" },
];

export function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-8">
          {/* Team */}
          <div>
            <div className="text-[12px] text-ink-muted">Team</div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {team.map((member) => (
                <a
                  key={member.name}
                  href={member.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-ink-muted"
                >
                  {member.name}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="text-[12px] text-ink-muted">Resources</div>
            <div className="mt-2 flex gap-x-4">
              <a
                href="https://github.com/Saber1Y/OmniCFO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-ink-muted"
              >
                GitHub
              </a>
              <a
                href="#architecture"
                className="text-[14px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-ink-muted"
              >
                Architecture
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          <span className="text-[12px] text-ink-muted">
            Open source, MIT license
          </span>
          <span className="font-mono text-[11px] text-ink-muted">
            Syndicate Hackathon 2026, track 2
          </span>
        </div>
      </div>
    </footer>
  );
}
