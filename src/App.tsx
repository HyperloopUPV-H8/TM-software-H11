import { toast } from "sonner";
import "./App.css";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { getFormattedDate } from "./lib/utils";

function App() {
  const handleButtonClick = () => {
    toast("Event has been created", {
      description: getFormattedDate(new Date()),
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });
    console.log("Button clicked");
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-black mb-10">
          Training Month - Hyperloop H11
        </h1>
        <Button onClick={handleButtonClick}>Click me</Button>
      </div>

      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
