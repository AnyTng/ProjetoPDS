import LoginForm from "../components/loginformUser";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../contexts/authcontext";

export default {
  title: "Forms/LoginForm",
  component: LoginForm,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={{ login: () => {} }}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export const Default = () => <LoginForm />;
