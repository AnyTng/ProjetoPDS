import Button from './button';

const MenuBar = ({
                     menuItems = [],
                     logoutText = "Desconectar",
                     onLogout = () => {},
                 }) => {
    return (
        <div className="bg-white border border-gray-200 w-64 flex flex-col">
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    onClick={item.onClick}
                    className="border-b border-gray-200 px-6 py-4 text-left hover:bg-gray-50 cursor-pointer rounded-none"
                >
                    <span className="text-lg font-semibold text-black">{item.label}</span>
                </button>
            ))}

            <div className="border-t border-gray-200 px-6 py-6 flex justify-center">
                <Button
                    text={logoutText}
                    variant="danger"
                    onClick={onLogout}
                    className="w-full !py-1"
                />
            </div>
        </div>
    );
};

export default MenuBar;