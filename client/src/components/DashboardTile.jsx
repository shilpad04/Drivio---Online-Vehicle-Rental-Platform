export default function DashboardTile({
  title,
  value,
  color,
  icon,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`${color} text-white rounded-xl shadow-lg p-6 cursor-pointer hover:scale-[1.03] transition-transform`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-xl font-semibold mt-2">{value}</p>
        </div>
        <i className={`fa-solid ${icon} text-4xl opacity-80`} />
      </div>
    </div>
  );
}
