const InputField = ({ placeholder, type, value, onChange }) => {
    return (
        <div className="w-full">
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full p-2 mt-1 border rounded"
                placeholder={placeholder}
            />
        </div>
    );
};
export default InputField;
