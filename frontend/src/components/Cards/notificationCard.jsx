import Button from "../button.jsx";

const NotificationCard = ({
                              title,
                              message,
                              actionLabel = "Tomar Ação",
                              actionLink = "#",
                          }) => {
    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl px-8 py-6 flex flex-col gap-4 shadow-sm">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="text-base text-slate-600">{message}</p>
            </div>
            <a href={actionLink} className="self-end">
                <Button
                    text={actionLabel}
                    variant="primary"
                    className="px-6 py-2 text-base"
                />
            </a>
        </div>
    );
};

export default NotificationCard;