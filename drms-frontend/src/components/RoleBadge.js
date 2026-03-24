export default function RoleBadge({ role }) {
  return <span className="user-chip__role-badge" data-role={role}>{role}</span>;
}
