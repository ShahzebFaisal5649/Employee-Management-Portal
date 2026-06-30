const BANNER_STYLES = {
    info:    "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-green-50 border-green-200 text-green-800",
};

export default function NotificationBanner({ messages = [], onDismiss }) {
    if (!messages || messages.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 mb-5">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm ${BANNER_STYLES[msg.type] || BANNER_STYLES.info}`}
                >
                    <span>{msg.text}</span>
                    {onDismiss && (
                        <button
                            onClick={() => onDismiss(msg.id)}
                            className="ml-4 text-current opacity-50 hover:opacity-100 text-base leading-none"
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
