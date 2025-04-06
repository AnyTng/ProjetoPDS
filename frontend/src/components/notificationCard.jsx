import Button from "./button";

const NotificationCard = ({ title, message, onActionClick, actionLabel = "Tomar Ação" }) => {
    return (
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl px-8 py-6 flex flex-col gap-4 shadow-sm">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="text-base text-slate-600">{message}</p>
            </div>
            <Button
                text={actionLabel}
                variant="primary"
                onClick={onActionClick}
                className="self-end px-6 py-2 text-base"
            />
        </div>
    );
};

export default NotificationCard;
