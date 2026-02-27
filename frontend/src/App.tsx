import './App.css'
// import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner"

function App() {
  // const { t, i18n } = useTranslation();

  return (
    <>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
