import "@aws-amplify/ui-react/styles.css";

type Todo = {
  content?: string | null;
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Props = {
  todos: Todo[];
  onCreate: () => void;
  onDelete: (id: string) => void;
};

export default function TodoPresentation({ todos, onCreate, onDelete }: Props) {
  return (
    <>
      <h1>My todos</h1>
      <button onClick={onCreate}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => onDelete(todo.id)}>
            {todo.content}
          </li>
        ))}
      </ul>
    </>
  );
}
