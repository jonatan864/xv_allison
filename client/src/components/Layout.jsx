import {
  Camera,
  ClipboardList,
  LogOut,
  QrCode,
  Sparkles,
  Ticket,
  Users
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Panel', icon: ClipboardList, roles: ['ADMIN'] },
  { id: 'guests', label: 'Invitados', icon: Users, roles: ['ADMIN'] },
  { id: 'tickets', label: 'Tickets', icon: Ticket, roles: ['ADMIN'] },
  { id: 'scanner', label: 'Acceso', icon: Camera, roles: ['ADMIN', 'ACCESO'] }
];

export function Layout({ activePage, setActivePage, usuario, onLogout, children }) {
  const visibleItems = navItems.filter((item) => item.roles.includes(usuario.rol));

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="eyebrow">XV Allison</p>
            <h1>Control QR</h1>
          </div>
        </div>

        <div className="user-chip">
          <QrCode size={16} />
          <span>{usuario.rol}</span>
          <button className="icon-button" type="button" onClick={onLogout} title="Cerrar sesion">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <nav className="tabs">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={activePage === item.id ? 'tab active' : 'tab'}
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="content">{children}</main>
    </div>
  );
}
