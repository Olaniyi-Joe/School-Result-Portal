// src/components/Modal.jsx
export default function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-96 relative">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
