import { Button } from "./components/Button";

function App() {
  const handleGetToken = () => {
    const token = window.electronAPI.getToken();
    console.log({ token });
  };

  const handleDeleteToken = () => {
    window.electronAPI.deleteToken();
  };

  return (
    <section>
      <h1 className="text-4xl text-primary">Hello</h1>
      <Button onClick={handleGetToken}>click to get token</Button>
      <Button onClick={handleDeleteToken}>delete token</Button>
    </section>
  );
}

export default App;
