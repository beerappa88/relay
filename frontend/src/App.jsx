import Header from "./components/Header.jsx";
import PipelineBoard from "./components/PipelineBoard.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <PipelineBoard />
      </main>
      <ChatWidget />
    </div>
  );
}
