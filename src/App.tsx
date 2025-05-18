import Login from "./screens/Login";

function App() {
  // useEffect(() => {
  //   window.electronAPI.onTokenReceived((token) => {
  //     setAccessToken(token);
  //     refetchUser();
  //   });
  // }, [setAccessToken, refetchUser]);

  return (
    <main className="@container flex h-dvh w-full flex-col font-sans">
      <nav className="app-region-drag dark:bg-primary-dark-foreground w-full bg-gray-100 py-3.5"></nav>

      <section className="dark:from-primary-dark-foreground dark:to-primary-dark flex w-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
        <Login />
      </section>
    </main>
  );
}

export default App;
