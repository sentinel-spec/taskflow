"use client";

export enum TOAST_TYPE {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
  WARNING = "warning",
}

interface ToastOptions {
  type: TOAST_TYPE;
  title: string;
  message: string;
  duration?: number;
}

const toastContainerId = "toast-container";

const getToastStyles = (type: TOAST_TYPE) => {
  switch (type) {
    case TOAST_TYPE.SUCCESS:
      return "bg-green-500";
    case TOAST_TYPE.ERROR:
      return "bg-red-500";
    case TOAST_TYPE.INFO:
      return "bg-blue-500";
    case TOAST_TYPE.WARNING:
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const getIcon = (type: TOAST_TYPE) => {
  switch (type) {
    case TOAST_TYPE.SUCCESS:
      return "✓";
    case TOAST_TYPE.ERROR:
      return "✕";
    case TOAST_TYPE.INFO:
      return "ℹ";
    case TOAST_TYPE.WARNING:
      return "⚠";
    default:
      return "•";
  }
};

export function setToast(options: ToastOptions) {
  const { type, title, message, duration = 3000 } = options;

  // Get or create container
  let container = document.getElementById(toastContainerId);
  if (!container) {
    container = document.createElement("div");
    container.id = toastContainerId;
    container.className = "fixed top-4 right-4 z-[100] flex flex-col gap-2";
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `${getToastStyles(type)} text-white px-4 py-3 rounded-lg shadow-lg min-w-[300px] flex items-start gap-3 animate-slide-in`;

  toast.innerHTML = `
    <span class="text-lg font-bold">${getIcon(type)}</span>
    <div class="flex-1">
      <div class="font-semibold text-sm">${title}</div>
      <div class="text-xs opacity-90 mt-0.5">${message}</div>
    </div>
    <button class="opacity-70 hover:opacity-100 text-lg leading-none" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
