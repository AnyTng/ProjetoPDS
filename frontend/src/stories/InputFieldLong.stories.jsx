import InputFieldLong from "../components/inputFieldLong";
import { useState } from "react";

export default {
  title: "Components/InputFieldLong",
  component: InputFieldLong,
};

export const Default = () => {
  const [value, setValue] = useState("");
  return (
    <InputFieldLong
      placeholder="Enter text"
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};