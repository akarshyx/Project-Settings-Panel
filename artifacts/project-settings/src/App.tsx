import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Code2,
  Copy,
  ExternalLink,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  History,
  LayoutDashboard,
  Lock,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  Trash2,
  Upload,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type View = 'overview' | 'files' | 'git' | 'settings';
type FileItem = {
  id: string;
  name: string;
  kind: 'folder' | 'code' | 'json' | 'text';
  path: string;
  size?: string;
  updated: string;
  description?: string;
  children?: FileItem[];
};

const files: FileItem[] = [
  { id: 'src', name: 'src', kind: 'folder', path: 'src', updated: '2h ago', children: [
    { id: 'app', name: 'App.tsx', kind: 'code', path: 'src/App.tsx', size: '8.6 KB', updated: '2h ago', description: 'Application shell and workspace routes.' },
    { id: 'main', name: 'main.tsx', kind: 'code', path: 'src/main.tsx', size: '1.2 KB', updated: 'yesterday', description: 'Client entry point and provider setup.' },
    { id: 'styles', name: 'index.css', kind: 'text', path: 'src/index.css', size: '14.4 KB', updated: '2h ago', description: 'Global tokens, typography and component styles.' },
  ] },
  { id: 'public', name: 'public', kind: 'folder', path: 'public', updated: '5d ago', children: [
    { id: 'favicon', name: 'favicon.svg', kind: 'code', path: 'public/favicon.svg', size: '2.4 KB', updated: '5d ago', description: 'Project mark used by the browser tab.' },
  ] },
  { id: 'readme', name: 'README.md', kind: 'text', path: 'README.md', size: '4.8 KB', updated: '3d ago', description: 'Setup notes and working agreements.' },
  { id: 'package', name: 'package.json', kind: 'json', path: 'package.json', size: '3.1 KB', updated: '2h ago', description: 'Scripts and dependency manifest.' },
  { id: 'env', name: '.env.example', kind: 'text', path: '.env.example', size: '0.8 KB', updated: '6d ago', description: 'Documented local environment variables.' },
];

const commits = [
  { hash: 'a91f0c2', title: 'Refine project settings navigation', author: 'Maya Chen', time: 'Today, 10:42', branch: 'main', color: 'lime' },
  { hash: '4d32e81', title: 'Add repository health panel', author: 'Maya Chen', time: 'Yesterday, 16:08', branch: 'main', color: 'coral' },
  { hash: 'b82a112', title: 'Update dependency lockfile', author: 'Noah Williams', time: 'Yesterday, 09:24', branch: 'main', color: 'blue' },
  { hash: '8f71c04', title: 'Create staging environment config', author: 'Maya Chen', time: 'Mon, 14:51', branch: 'release/next', color: 'orange' },
];

function IconBox({ icon: Icon, tone = 'default' }: { icon: LucideIcon; tone?: 'default' | 'lime' | 'coral' | 'blue' }) {
  return <span className={`icon-box icon-${tone}`}><Icon size={16} strokeWidth={1.8} /></span>;
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))] shadow-[0_0_0_4px_hsl(var(--accent)/.10)]" data-testid="logo-project">
        <Box size={19} strokeWidth={2.3} />
      </div>
      <div className="brand-copy min-w-0">
        <div className="text-[13px] font-extrabold tracking-[-.03em]">fieldnote</div>
        <div className="mono mt-0.5 text-[9px] uppercase tracking-[.14em] text-[hsl(var(--sidebar-foreground)/.48)]">project workspace</div>
      </div>
    </div>
  );
}

function Sidebar({ view, setView }: { view: View; setView: (view: View) => void }) {
  const items: { id: View; label: string; icon: LucideIcon; key: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, key: '01' },
    { id: 'files', label: 'Files', icon: FolderOpen, key: '02' },
    { id: 'git', label: 'Git activity', icon: GitBranch, key: '03' },
    { id: 'settings', label: 'Settings', icon: Settings2, key: '04' },
  ];
  return (
    <aside className="sidebar">
      <Brand />
      <div className="nav-section-label mono mb-2 mt-11 px-3 text-[9px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.35)]">Workspace</div>
      <nav aria-label="Project sections">
        {items.map(({ id, label, icon: Icon, key }) => (
          <button
            key={id}
            type="button"
            className={`nav-item focus-ring ${view === id ? 'active' : ''}`}
            onClick={() => setView(id)}
            aria-current={view === id ? 'page' : undefined}
            data-testid={`button-nav-${id}`}
          >
            <Icon size={16} strokeWidth={view === id ? 2.2 : 1.8} />
            <span className="text-[12px] font-semibold">{label}</span>
            <span className="nav-key mono">{key}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-foot mt-auto">
        <div className="mb-3 border-t border-[hsl(var(--sidebar-border))] pt-5">
          <div className="section-label mb-3 px-2 text-[hsl(var(--sidebar-foreground)/.35)]">Project</div>
          <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--sidebar-accent))] px-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary)/.18)] text-[hsl(var(--sidebar-primary))]"><TerminalSquare size={15} /></div>
            <div className="min-w-0"><div className="truncate text-[11px] font-bold">lumen-console</div><div className="mono mt-1 text-[9px] text-[hsl(var(--sidebar-foreground)/.4)]">private · v2.4.0</div></div>
          </div>
        </div>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-[hsl(var(--accent))] text-center text-[10px] font-extrabold leading-6 text-[hsl(var(--primary))]">MC</div><span className="text-[10px] font-semibold text-[hsl(var(--sidebar-foreground)/.65)]">Maya Chen</span></div>
          <button type="button" className="focus-ring rounded p-1 text-[hsl(var(--sidebar-foreground)/.45)] hover:text-[hsl(var(--sidebar-foreground))]" aria-label="Open account menu" data-testid="button-account-menu"><MoreHorizontal size={16} /></button>
        </div>
      </div>
    </aside>
  );
}

function Header({ view, setView }: { view: View; setView: (view: View) => void }) {
  const labels: Record<View, string> = { overview: 'Overview', files: 'Files', git: 'Git activity', settings: 'Settings' };
  return (
    <header className="topbar">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="menu-button focus-ring rounded-lg border border-[hsl(var(--border))] p-2" aria-label="Open workspace menu" data-testid="button-mobile-menu"><Menu size={17} /></button>
        <div className="mono hidden text-[10px] text-[hsl(var(--muted-foreground))] sm:block">workspace <span className="mx-1 text-[hsl(var(--border))]">/</span></div>
        <div className="truncate text-[12px] font-bold">lumen-console <span className="mx-1 text-[hsl(var(--muted-foreground))]">/</span> {labels[view]}</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <label className="topbar-search relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input className="field h-9 w-[190px] pl-9 text-[11px]" placeholder="Search workspace" aria-label="Search workspace" data-testid="input-workspace-search" />
        </label>
        <button type="button" className="mono focus-ring hidden items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[10px] font-bold md:flex" onClick={() => setView('git')} data-testid="button-current-branch"><GitBranch size={14} className="text-[hsl(var(--muted-foreground))]" /> main <ChevronDown size={13} className="text-[hsl(var(--muted-foreground))]" /></button>
        <button type="button" className={`focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-extrabold transition ${view === 'settings' ? 'bg-[hsl(var(--accent))] text-[hsl(var(--primary))]' : 'button-primary'}`} onClick={() => setView('settings')} data-testid="button-header-settings"><Settings2 size={15} /> <span className="hidden sm:inline">Settings</span></button>
      </div>
    </header>
  );
}

function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="content-header mb-9 flex items-end justify-between gap-6">
      <div>
        <div className="section-label mb-3">{eyebrow}</div>
        <h1 className="text-balance text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.04] tracking-[-.065em]">{title}</h1>
        <p className="mt-3 max-w-[550px] text-[13px] leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      {actions && <div className="header-actions flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function Overview({ setView, showToast }: { setView: (view: View) => void; showToast: (message: string) => void }) {
  return (
    <div className="content workspace-grid">
      <PageHeading eyebrow="Project / pulse" title="Good morning, Maya." description="A clear read on lumen-console, from repository health to the work that moved it forward." actions={<><button type="button" className="button-secondary focus-ring flex items-center gap-2" onClick={() => showToast('Project snapshot copied')} data-testid="button-copy-snapshot"><Copy size={14} /> Copy snapshot</button><button type="button" className="button-primary focus-ring flex items-center gap-2" onClick={() => setView('settings')} data-testid="button-overview-settings"><Settings2 size={14} /> Project settings</button></>} />
      <section className="panel soft-shadow mb-5 overflow-hidden p-5 sm:p-7" data-testid="card-project-status">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4"><IconBox icon={ShieldCheck} tone="lime" /><div><div className="section-label">System status</div><h2 className="mt-2 text-[21px] font-extrabold tracking-[-.04em]">Everything is in order</h2><p className="mt-1 text-[12px] text-[hsl(var(--muted-foreground))]">Last checked 4 minutes ago across 3 environments.</p></div></div>
          <div className="flex items-center gap-2 rounded-full bg-[hsl(var(--accent)/.18)] px-3 py-2 text-[10px] font-extrabold text-[hsl(77 47% 29%)]"><span className="h-2 w-2 rounded-full bg-[hsl(76 78% 42%)]" /> All systems operational</div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[['Production', 'Healthy', 'hsl(76 78% 42%)'], ['Staging', 'Healthy', 'hsl(76 78% 42%)'], ['Preview', '2 builds queued', 'hsl(22 85% 59%)']].map(([name, status, color]) => <div key={name} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background)/.55)] px-4 py-3"><span className="text-[11px] font-bold">{name}</span><span className="mono flex items-center gap-2 text-[9px] text-[hsl(var(--muted-foreground))]"><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{status}</span></div>)}
        </div>
      </section>
      <div className="stats-grid mb-5 grid grid-cols-4 gap-3">
        {[['Files tracked', '148', '↑ 12 this week', FileCode2, 'lime'], ['Open branches', '04', '1 needs review', GitBranch, 'coral'], ['Latest build', '2m 18s', 'passed on main', Zap, 'blue'], ['Contributors', '07', 'active this month', Users, 'default']].map(([label, value, note, Icon, tone]) => <div className="panel p-5" key={label as string}><div className="mb-7 flex items-start justify-between"><span className="section-label">{label as string}</span><IconBox icon={Icon as LucideIcon} tone={tone as 'default' | 'lime' | 'coral' | 'blue'} /></div><div className="stat-number">{value as string}</div><div className="mono mt-2 text-[9px] text-[hsl(var(--muted-foreground))]">{note as string}</div></div>)}
      </div>
      <div className="overview-grid grid grid-cols-[1.25fr_.75fr] gap-5">
        <section className="panel p-5 sm:p-7" data-testid="panel-recent-activity">
          <div className="mb-6 flex items-center justify-between"><div><div className="section-label">Recent activity</div><h2 className="mt-2 text-[17px] font-extrabold tracking-[-.035em]">The project, in motion</h2></div><button type="button" className="focus-ring rounded p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]" onClick={() => setView('git')} aria-label="View all Git activity" data-testid="button-view-git"><ArrowUpRight size={17} /></button></div>
          <div className="space-y-0">{commits.slice(0, 3).map((commit, index) => <div className="relative flex gap-4 pb-6 last:pb-0" key={commit.hash}><div className="relative flex flex-col items-center"><div className={`timeline-dot dot-${commit.color}`}><GitCommitHorizontal size={12} /></div>{index < 2 && <div className="absolute top-7 h-full w-px bg-[hsl(var(--border))]" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-[12px] font-bold">{commit.title}</div><span className="mono text-[9px] text-[hsl(var(--muted-foreground))]">{commit.hash}</span></div><div className="mt-1.5 flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]"><span>{commit.author}</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--border))]" /><span>{commit.time}</span></div></div></div>)}</div>
        </section>
        <section className="panel p-5 sm:p-7"><div className="section-label">Worth a look</div><h2 className="mt-2 text-[17px] font-extrabold tracking-[-.035em]">A little housekeeping</h2><p className="mt-3 text-[12px] leading-5 text-[hsl(var(--muted-foreground))]">Your repository has one small thing waiting for a decision.</p><div className="mt-6 rounded-xl border border-[hsl(var(--destructive)/.22)] bg-[hsl(var(--destructive)/.06)] p-4"><div className="flex gap-3"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-[hsl(var(--destructive))]" /><div><div className="text-[11px] font-extrabold">Stale branch detected</div><p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]"><span className="mono">chore/cleanup</span> has not moved in 18 days.</p><button type="button" className="mt-4 text-[10px] font-extrabold text-[hsl(var(--destructive))] underline decoration-[hsl(var(--destructive)/.3)] underline-offset-4" onClick={() => setView('git')} data-testid="button-review-branch">Review branch <ArrowUpRight size={12} className="ml-1 inline" /></button></div></div></div><div className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-5"><CircleDot size={16} className="text-[hsl(var(--muted-foreground))]" /><div><div className="text-[11px] font-bold">Next deploy window</div><div className="mono mt-1 text-[9px] text-[hsl(var(--muted-foreground))]">Today · 18:00 UTC</div></div></div></section>
      </div>
    </div>
  );
}

function FileIcon({ item }: { item: FileItem }) {
  if (item.kind === 'folder') return <Folder size={16} className="text-[hsl(34 70% 47%)]" />;
  if (item.kind === 'json') return <FileJson size={16} className="text-[hsl(22 78% 57%)]" />;
  if (item.kind === 'code') return <FileCode2 size={16} className="text-[hsl(205 62% 50%)]" />;
  return <FileText size={16} className="text-[hsl(var(--muted-foreground))]" />;
}

function FileTree({ items, selected, setSelected, depth = 0, filtered = false }: { items: FileItem[]; selected: string; setSelected: (id: string) => void; depth?: number; filtered?: boolean }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ src: true, public: true });
  return <div className={depth ? 'tree-indent' : ''}>{items.map(item => <div key={item.id}><button type="button" className={`file-row focus-ring ${selected === item.id ? 'selected' : ''}`} onClick={() => item.kind === 'folder' ? setOpen(prev => ({ ...prev, [item.id]: !prev[item.id] })) : setSelected(item.id)} data-testid={`button-file-${item.id}`}><span className="flex w-4 shrink-0 justify-center">{item.kind === 'folder' ? (open[item.id] && !filtered ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : null}</span><FileIcon item={item} /><span className="truncate text-[11px] font-semibold">{item.name}</span>{item.kind === 'folder' && <span className="mono ml-auto text-[9px] text-[hsl(var(--muted-foreground))]">{item.children?.length}</span>}</button>{item.children && open[item.id] && !filtered && <FileTree items={item.children} selected={selected} setSelected={setSelected} depth={depth + 1} />}</div>)}</div>;
}

function FilesView({ showToast }: { showToast: (message: string) => void }) {
  const [selected, setSelected] = useState('app');
  const [query, setQuery] = useState('');
  const selectedItem = useMemo(() => files.flatMap(f => f.children ? [f, ...f.children] : [f]).find(item => item.id === selected) || files[0], [selected]);
  const filtered = query.trim().length > 0;
  const results = files.flatMap(f => f.children ? [f, ...f.children] : [f]).filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.path.toLowerCase().includes(query.toLowerCase()));
  return <div className="content"><PageHeading eyebrow="Project / source" title="Files" description="Browse the repository as it is right now. Select any file to inspect its location, size, and recent change." actions={<><button type="button" className="button-secondary focus-ring flex items-center gap-2" onClick={() => showToast('File list refreshed')} data-testid="button-refresh-files"><RefreshCw size={14} /> Refresh</button><button type="button" className="button-primary focus-ring flex items-center gap-2" onClick={() => showToast('Upload flow is ready for your repository connection')} data-testid="button-upload-file"><Upload size={14} /> Add file</button></>} />
    <div className="files-layout grid grid-cols-[minmax(300px,.9fr)_minmax(340px,1.1fr)] gap-5">
      <section className="panel min-h-[510px] p-4" data-testid="panel-file-tree"><div className="mb-4 flex items-center justify-between px-2"><div><div className="section-label">Repository tree</div><div className="mono mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">main · 148 tracked files</div></div><button type="button" className="focus-ring rounded p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]" aria-label="File tree options" onClick={() => showToast('Tree options opened')} data-testid="button-file-options"><MoreHorizontal size={16} /></button></div><div className="relative mb-3"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input value={query} onChange={event => setQuery(event.target.value)} className="field h-9 pl-9 pr-8 text-[11px]" placeholder="Filter files..." aria-label="Filter files" data-testid="input-file-search" />{query && <button type="button" className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[hsl(var(--muted-foreground))]" onClick={() => setQuery('')} aria-label="Clear file filter" data-testid="button-clear-file-search"><X size={13} /></button>}</div>{filtered ? results.length ? <FileTree items={results} selected={selected} setSelected={setSelected} filtered /> : <div className="flex flex-col items-center justify-center px-5 py-20 text-center"><Search size={22} className="mb-3 text-[hsl(var(--muted-foreground))]" /><div className="text-[12px] font-bold">No matching files</div><div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">Try a path, extension, or folder name.</div></div> : <FileTree items={files} selected={selected} setSelected={setSelected} />}</section>
      <section className="file-detail panel p-5 sm:p-7" data-testid="panel-file-detail"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-[hsl(var(--secondary))] p-3"><FileIcon item={selectedItem} /></div><div><div className="section-label">{selectedItem.kind === 'folder' ? 'Directory' : 'File metadata'}</div><h2 className="mt-1 text-[18px] font-extrabold tracking-[-.04em]">{selectedItem.name}</h2></div></div><button type="button" className="focus-ring rounded-lg border border-[hsl(var(--border))] p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]" aria-label="Copy file path" onClick={() => showToast(`${selectedItem.path} copied`)} data-testid="button-copy-file-path"><Copy size={15} /></button></div><div className="mono mt-7 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-[10px] text-[hsl(var(--primary-foreground)/.72)]"><span className="text-[hsl(var(--accent))]">~/</span>{selectedItem.path}</div><div className="mt-7 grid grid-cols-2 gap-3">{[['Type', selectedItem.kind === 'folder' ? 'Directory' : selectedItem.kind.toUpperCase()], ['Size', selectedItem.size || '—'], ['Updated', selectedItem.updated], ['Branch', 'main']].map(([label, value]) => <div className="rounded-lg border border-[hsl(var(--border))] p-3" key={label}><div className="section-label text-[9px]">{label}</div><div className="mono mt-2 text-[10px] font-bold">{value}</div></div>)}</div><div className="mt-7 border-t border-[hsl(var(--border))] pt-6"><div className="section-label">About this {selectedItem.kind === 'folder' ? 'directory' : 'file'}</div><p className="mt-3 text-[12px] leading-6 text-[hsl(var(--muted-foreground))]">{selectedItem.description || 'A directory containing project files and configuration.'}</p></div><div className="mt-7 flex flex-wrap gap-2"><button type="button" className="button-primary focus-ring flex items-center gap-2" onClick={() => showToast(`Opening ${selectedItem.name}`)} data-testid="button-open-file"><ExternalLink size={14} /> Open file</button><button type="button" className="button-secondary focus-ring flex items-center gap-2" onClick={() => showToast('File history loaded')} data-testid="button-file-history"><History size={14} /> History</button></div></section>
    </div>
  </div>;
}

function GitView({ showToast }: { showToast: (message: string) => void }) {
  const [branch, setBranch] = useState('main');
  const [showAll, setShowAll] = useState(false);
  const visibleCommits = showAll ? commits : commits.slice(0, 3);
  return <div className="content"><PageHeading eyebrow="Project / version control" title="Git activity" description="A compact trail of what changed, where it landed, and which branch deserves your attention." actions={<button type="button" className="button-primary focus-ring flex items-center gap-2" onClick={() => showToast('New branch dialog opened')} data-testid="button-new-branch"><Plus size={14} /> New branch</button>} />
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="panel flex items-center gap-4 p-4"><IconBox icon={GitBranch} tone="lime" /><div><div className="section-label">Current branch</div><div className="mono mt-1 text-[12px] font-bold">main</div></div></div><div className="panel flex items-center gap-4 p-4"><IconBox icon={GitCommitHorizontal} tone="blue" /><div><div className="section-label">Commits this week</div><div className="mono mt-1 text-[12px] font-bold">18 commits</div></div></div><div className="panel flex items-center gap-4 p-4"><IconBox icon={GitMerge} tone="coral" /><div><div className="section-label">Needs review</div><div className="mono mt-1 text-[12px] font-bold">1 pull request</div></div></div></div>
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="panel p-5 sm:p-7"><div className="mb-7 flex flex-wrap items-center justify-between gap-3"><div><div className="section-label">Commit timeline</div><h2 className="mt-2 text-[17px] font-extrabold tracking-[-.035em]">Recent changes</h2></div><label className="relative"><GitBranch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><select className="field mono h-9 w-[150px] appearance-none pl-8 pr-8 text-[10px] font-bold" value={branch} onChange={event => setBranch(event.target.value)} aria-label="Select branch" data-testid="select-branch"><option value="main">main</option><option value="release/next">release/next</option><option value="chore/cleanup">chore/cleanup</option></select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /></label></div><div className="space-y-0">{visibleCommits.map((commit, index) => <div className="relative flex gap-4 pb-7 last:pb-0" key={commit.hash}><div className="relative flex flex-col items-center"><div className={`timeline-dot dot-${commit.color}`}><GitCommitHorizontal size={12} /></div>{index < visibleCommits.length - 1 && <div className="absolute top-7 h-full w-px bg-[hsl(var(--border))]" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-3"><div className="text-[12px] font-bold">{commit.title}</div><span className="mono rounded bg-[hsl(var(--secondary))] px-2 py-1 text-[9px] font-bold text-[hsl(var(--muted-foreground))]">{commit.hash}</span></div><div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]"><span>{commit.author}</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--border))]" /><span>{commit.time}</span><span className="mono rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[9px]">{commit.branch}</span></div></div></div>)}</div><button type="button" className="button-secondary focus-ring mt-7 w-full" onClick={() => setShowAll(!showAll)} data-testid="button-toggle-commits">{showAll ? 'Show recent only' : 'Show all activity'}</button></section>
      <aside className="space-y-5"><section className="panel p-5"><div className="mb-5 flex items-center justify-between"><div><div className="section-label">Branches</div><h2 className="mt-2 text-[16px] font-extrabold tracking-[-.03em]">The lay of the land</h2></div><GitBranch size={17} className="text-[hsl(var(--muted-foreground))]" /></div>{[['main', 'ahead by 0', 'lime'], ['release/next', 'ahead by 6', 'blue'], ['chore/cleanup', '18d idle', 'coral']].map(([name, note, tone]) => <button type="button" className={`focus-ring mb-2 flex w-full items-center justify-between rounded-lg border p-3 text-left transition last:mb-0 ${branch === name ? 'border-[hsl(var(--accent)/.6)] bg-[hsl(var(--accent)/.12)]' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]'}`} key={name} onClick={() => setBranch(name)} data-testid={`button-branch-${name.replace('/', '-')}`}><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: tone === 'lime' ? 'hsl(76 78% 42%)' : tone === 'blue' ? 'hsl(205 62% 50%)' : 'hsl(var(--destructive))' }} /><span className="mono text-[10px] font-bold">{name}</span></span><span className="mono text-[8px] text-[hsl(var(--muted-foreground))]">{note}</span></button>)}</section><section className="panel overflow-hidden p-5"><div className="section-label">Contribution rhythm</div><h2 className="mt-2 text-[16px] font-extrabold tracking-[-.03em]">This week</h2><div className="mt-5 flex h-20 items-end gap-1.5">{[32, 47, 28, 68, 54, 81, 41, 62, 46, 72, 56, 88, 36, 52, 76, 44, 61, 33, 69, 48].map((height, i) => <div className={`flex-1 rounded-t-sm ${i > 16 ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--secondary))]'}`} style={{ height: `${height}%` }} key={i} />)}</div><div className="mono mt-3 flex justify-between text-[8px] text-[hsl(var(--muted-foreground))]"><span>MON</span><span>WED</span><span>FRI</span><span>SUN</span></div></section></aside></div>
  </div>;
}

function SettingsView({ showToast }: { showToast: (message: string) => void }) {
  const [name, setName] = useState('lumen-console');
  const [description, setDescription] = useState('A quiet control room for the things that make the product work.');
  const [visibility, setVisibility] = useState('Private');
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); showToast('Project settings saved'); window.setTimeout(() => setSaved(false), 2400); };
  return <div className="content"><PageHeading eyebrow="Project / configuration" title="Settings" description="The useful bits, in one calm place. Shape how this project is named, shared, and connected to its repository." actions={<button type="button" className="button-primary focus-ring flex items-center gap-2" onClick={save} data-testid="button-save-settings"><Check size={14} /> {saved ? 'Saved' : 'Save changes'}</button>} />
    <div className="settings-grid grid grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] gap-5"><div className="space-y-5"><section className="panel p-5 sm:p-7"><div className="mb-7 flex items-start gap-4"><IconBox icon={SlidersHorizontal} tone="lime" /><div><div className="section-label">Project details</div><h2 className="mt-2 text-[17px] font-extrabold tracking-[-.035em]">How this project appears</h2><p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">This information is visible to everyone with project access.</p></div></div><div className="space-y-5"><label className="block"><span className="mb-2 block text-[11px] font-bold">Project name</span><input className="field focus-ring" value={name} onChange={event => setName(event.target.value)} data-testid="input-project-name" /></label><label className="block"><span className="mb-2 block text-[11px] font-bold">Description <span className="font-normal text-[hsl(var(--muted-foreground))]">· optional</span></span><textarea className="field focus-ring min-h-[92px] resize-y leading-5" value={description} onChange={event => setDescription(event.target.value)} data-testid="textarea-project-description" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-[11px] font-bold">Visibility</span><select className="field focus-ring" value={visibility} onChange={event => setVisibility(event.target.value)} data-testid="select-visibility"><option>Private</option><option>Internal</option><option>Public</option></select><span className="mt-2 flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]"><Lock size={11} /> Only invited members can access</span></label><div><span className="mb-2 block text-[11px] font-bold">Project ID</span><div className="mono flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.5)] px-3 py-[11px] text-[10px] text-[hsl(var(--muted-foreground))]">prj_8F2K1N <button type="button" className="focus-ring rounded p-1 hover:bg-[hsl(var(--border))]" onClick={() => showToast('Project ID copied')} aria-label="Copy project ID" data-testid="button-copy-project-id"><Copy size={13} /></button></div></div></div></div></section>
      <section className="panel p-5 sm:p-7"><div className="mb-6 flex items-start gap-4"><IconBox icon={GitBranch} tone="blue" /><div><div className="section-label">Repository controls</div><h2 className="mt-2 text-[17px] font-extrabold tracking-[-.035em]">Keep deploys predictable</h2></div></div><div className="divide-y divide-[hsl(var(--border))]"><div className="flex items-center justify-between gap-5 py-4 first:pt-0"><div><div className="text-[12px] font-bold">Automatic deploys</div><p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">Build main whenever a new commit lands.</p></div><button type="button" role="switch" aria-checked={autoDeploy} className={`focus-ring relative h-6 w-11 shrink-0 rounded-full transition ${autoDeploy ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--secondary))]'}`} onClick={() => setAutoDeploy(!autoDeploy)} data-testid="switch-auto-deploy"><span className={`absolute top-1 h-4 w-4 rounded-full bg-[hsl(var(--primary))] transition-transform ${autoDeploy ? 'translate-x-6' : 'translate-x-1'}`} /></button></div><div className="flex items-center justify-between gap-5 py-4"><div><div className="text-[12px] font-bold">Default branch</div><p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">The branch used for production builds.</p></div><span className="mono rounded-md bg-[hsl(var(--secondary))] px-3 py-2 text-[10px] font-bold">main</span></div><div className="flex items-center justify-between gap-5 py-4 last:pb-0"><div><div className="text-[12px] font-bold">Repository URL</div><p className="mono mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">github.com/fieldnote/lumen-console</p></div><button type="button" className="button-secondary focus-ring flex shrink-0 items-center gap-2" onClick={() => showToast('Opening repository')} data-testid="button-open-repository"><ExternalLink size={13} /> <span className="hidden sm:inline">Open</span></button></div></div></section></div>
      <aside className="space-y-5"><section className="panel overflow-hidden p-5 sm:p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))]"><Code2 size={18} /></div><div><div className="section-label">Connected repository</div><div className="mt-1 text-[13px] font-extrabold">fieldnote / lumen-console</div></div></div><div className="mono mt-6 rounded-lg border border-[hsl(var(--border))] px-3 py-3 text-[9px] text-[hsl(var(--muted-foreground))]">SSH · git@github.com:fieldnote/lumen-console.git</div><div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-[hsl(77 47% 29%)]"><span className="h-2 w-2 rounded-full bg-[hsl(76 78% 42%)]" /> Connected and syncing</div><button type="button" className="button-secondary focus-ring mt-5 w-full" onClick={() => showToast('Repository connection settings opened')} data-testid="button-manage-repository">Manage connection</button></section><section className="panel p-5 sm:p-6"><div className="section-label">Access</div><h2 className="mt-2 text-[16px] font-extrabold tracking-[-.03em]">People on this project</h2><div className="mt-5 flex items-center"><div className="flex -space-x-2">{['MC', 'NW', 'JO', 'SR'].map((initials, i) => <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--card))] text-[9px] font-extrabold ${['bg-[hsl(var(--accent))]', 'bg-[hsl(205_52%_80%)]', 'bg-[hsl(22_76%_76%)]', 'bg-[hsl(280_34%_76%)]'][i]}`} key={initials}>{initials}</div>)}</div><span className="ml-3 text-[11px] text-[hsl(var(--muted-foreground))]">+ 3 teammates</span></div><button type="button" className="button-secondary focus-ring mt-5 flex w-full items-center justify-center gap-2" onClick={() => showToast('Invite panel opened')} data-testid="button-invite-member"><Plus size={14} /> Invite teammate</button></section><section className="panel border-[hsl(var(--destructive)/.24)] p-5 sm:p-6"><div className="flex items-center gap-2 text-[hsl(var(--destructive))]"><Trash2 size={15} /><div className="section-label text-[hsl(var(--destructive))]">Danger zone</div></div><p className="mt-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">Deleting a project removes its workspace data and cannot be undone.</p><button type="button" className="button-danger focus-ring mt-4 w-full" onClick={() => showToast('Deletion requires an explicit confirmation')} data-testid="button-delete-project">Delete project</button></section></aside></div>
  </div>;
}

function Workspace() {
  const [view, setView] = useState<View>('overview');
  const [toast, setToast] = useState('');
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2600); return () => window.clearTimeout(timer); }, [toast]);
  const showToast = (message: string) => setToast(message);
  const screen = view === 'overview' ? <Overview setView={setView} showToast={showToast} /> : view === 'files' ? <FilesView showToast={showToast} /> : view === 'git' ? <GitView showToast={showToast} /> : <SettingsView showToast={showToast} />;
  return <div className="app-shell"><Sidebar view={view} setView={setView} /><div className="main-stage"><Header view={view} setView={setView} />{screen}</div>{toast && <div className="toast-note" role="status" data-testid="status-toast"><Check size={14} className="mr-2 inline" />{toast}</div>}</div>;
}

function Router() {
  return <Switch><Route path="/" component={Workspace} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;