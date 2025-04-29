const PlaceholderUserIcon = () => (
    <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ClientSidebarPanel = ({ userImage, userName, showDivider = true }) => {
    return (
        <div
            className={`col-span-1 flex flex-col justify-center items-center text-center gap-4 pr-10
        ${showDivider ? "border-r border-gray-200" : ""}`}
        >
            <div className="rounded-full w-40 h-40 object-cover border overflow-hidden bg-gray-100 flex items-center justify-center">
                {userImage ? (
                    <img
                        src={userImage}
                        alt="Foto do utilizador"
                        className="w-full h-full"
                    />
                ) : (
                    <PlaceholderUserIcon />
                )}
            </div>
            <div>
                <p className="text-lg font-semibold">Olá,</p>
                <p className="text-xl font-bold">{userName}</p>
            </div>
        </div>
    );
};

export default ClientSidebarPanel;
