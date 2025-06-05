import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import AuthProvider from "../components/AuthProvider";
import TodoContainer from "../components/todo/TodoContainer";

Amplify.configure(outputs);

export default function App() {
  return (
    <AuthProvider>
      <main>
        <TodoContainer />
      </main>
    </AuthProvider>
  );
}
