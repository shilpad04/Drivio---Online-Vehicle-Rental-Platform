import { useNavigate } from "react-router-dom";

export default function BackButton({
  to,
  onClick,
  label = "Back",
  className = "",
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to !== undefined) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 ${className}`}
    >
      <i className="fa-solid fa-arrow-left"></i>
      {label}
    </button>
  );
}
