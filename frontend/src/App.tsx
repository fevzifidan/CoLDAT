import './App.css'
import { useTranslation } from "react-i18next";

function App() {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <h1>CoLDAT Project</h1>
      <p>Senior Design Project</p>
      <hr />
      <h1>{t("common:actions.cancel")}</h1>
      <h1>{t("common:actions.create")}</h1>

      <button onClick={() => i18n.changeLanguage("tr")}>
        TR
      </button>

      <button onClick={() => i18n.changeLanguage("en")}>
        EN
      </button>
    </div>
  )
}

export default App
