export default function Button({ children, onClick, type = "button" }) {
  return (
    <button
      onClick={onClick}
      type={type}
      className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-500"
    >
      {children}
    </button>
  );
}
