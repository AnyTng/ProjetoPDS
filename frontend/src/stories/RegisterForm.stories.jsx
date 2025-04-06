import RegisterForm from "../components/registerformUser";
import { MemoryRouter } from "react-router-dom";

export default {
  title: "Forms/RegisterForm",
  component: RegisterForm,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

export const Default = () => <RegisterForm />;
