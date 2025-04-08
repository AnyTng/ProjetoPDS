
const ClientSidebarPanel = ({ userImage, userName, showDivider = true }) => {
    return (
        <div
            className={`col-span-1 flex flex-col justify-center items-center text-center gap-4 pr-10
        ${showDivider ? "border-r border-gray-200" : ""}`}
        >
            <img
                src={userImage}
                alt="Foto do utilizador"
                className="rounded-full w-40 h-40 object-cover border"
            />
            <div>
                <p className="text-lg font-semibold">Olá,</p>
                <p className="text-xl font-bold">{userName}</p>
            </div>
        </div>
    );
};

export default ClientSidebarPanel;