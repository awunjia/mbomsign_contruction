import { useEffect, useMemo, useState } from "react";
import "./App.css";

const COPY = {
  en: {
    comingSoon: "Coming Soon",
    intro:
      "Our website is currently under construction. Enter your email to get launch updates and product notifications.",
    timeLabel: "Days : Hours : Minutes : Seconds",
    daysLeft: "days left",
    subscribePrompt: "Don't want to miss updates? Subscribe now",
    emailPlaceholder: "Email address",
    saving: "Saving...",
    notify: "Notify Me",
    follow: "Follow Us On",
    whatWeDo:
      "We empower businesses and teams with secure contract signing, identity verification, e-invoicing, smart forms and automation, and document certification.",
    language: "Language",
    poweredBy: "Powered by",
  },
  fr: {
    comingSoon: "Bientot disponible",
    intro:
      "Notre site est en cours de construction. Entrez votre email pour recevoir les mises a jour de lancement et des produits.",
    timeLabel: "Jours : Heures : Minutes : Secondes",
    daysLeft: "jours restants",
    subscribePrompt: "Ne manquez aucune mise a jour. Abonnez-vous",
    emailPlaceholder: "Adresse e-mail",
    saving: "Enregistrement...",
    notify: "Me notifier",
    follow: "Suivez-nous",
    whatWeDo:
      "Nous aidons les entreprises avec la signature de contrats, la verification d'identite, la facturation electronique, les formulaires intelligents, l'automatisation et la certification de documents.",
    language: "Langue",
    poweredBy: "Propulse par",
  },
  es: {
    comingSoon: "Proximamente",
    intro:
      "Nuestro sitio web esta en construccion. Ingresa tu correo para recibir actualizaciones de lanzamiento y del producto.",
    timeLabel: "Dias : Horas : Minutos : Segundos",
    daysLeft: "dias restantes",
    subscribePrompt: "No quieres perderte novedades? Suscribete",
    emailPlaceholder: "Correo electronico",
    saving: "Guardando...",
    notify: "Notificarme",
    follow: "Siguenos",
    whatWeDo:
      "Apoyamos a empresas con firma de contratos, verificacion de identidad, facturacion electronica, formularios inteligentes, automatizacion y certificacion de documentos.",
    language: "Idioma",
    poweredBy: "Impulsado por",
  },
  de: {
    comingSoon: "Demnachst verfugbar",
    intro:
      "Unsere Website wird derzeit erstellt. Trage deine E-Mail ein, um Start- und Produkt-Updates zu erhalten.",
    timeLabel: "Tage : Stunden : Minuten : Sekunden",
    daysLeft: "Tage ubrig",
    subscribePrompt: "Keine Updates verpassen? Jetzt abonnieren",
    emailPlaceholder: "E-Mail-Adresse",
    saving: "Speichern...",
    notify: "Benachrichtigen",
    follow: "Folge uns",
    whatWeDo:
      "Wir unterstutzen Unternehmen mit Vertragsunterzeichnung, Identitatsprufung, E-Rechnung, smarten Formularen, Automatisierung und Dokumentenzertifizierung.",
    language: "Sprache",
    poweredBy: "Bereitgestellt von",
  },
  ar: {
    comingSoon: "قريبا",
    intro:
      "موقعنا قيد الانشاء حاليا. ادخل بريدك الالكتروني للحصول على تحديثات الاطلاق والمنتج.",
    timeLabel: "ايام : ساعات : دقائق : ثوان",
    daysLeft: "ايام متبقية",
    subscribePrompt: "لا تريد ان تفوت التحديثات؟ اشترك الان",
    emailPlaceholder: "البريد الالكتروني",
    saving: "جار الحفظ...",
    notify: "اخطرني",
    follow: "تابعنا",
    whatWeDo:
      "نساعد الشركات على توقيع العقود، التحقق من الهوية، الفوترة الالكترونية، النماذج الذكية والاتمتة، وتصديق المستندات.",
    language: "اللغة",
    poweredBy: "مدعوم من",
  },
  fi: {
    comingSoon: "Tulossa pian",
    intro:
      "Verkkosivumme on rakenteilla. Anna sahkopostisi saadaksesi julkaisu- ja tuotepaivitykset.",
    timeLabel: "Paivaa : Tuntia : Minuuttia : Sekuntia",
    daysLeft: "paivaa jaljella",
    subscribePrompt: "Etkö halua missaata paivityksia? Tilaa nyt",
    emailPlaceholder: "Sahkoposti",
    saving: "Tallennetaan...",
    notify: "Ilmoita minulle",
    follow: "Seuraa meita",
    whatWeDo:
      "Autamme yrityksia turvallisessa sopimusten allekirjoituksessa, henkilollisyyden varmennuksessa, verkkolaskutuksessa, alykkaissa lomakkeissa, automaatiossa ja asiakirjojen sertifioinnissa.",
    language: "Kieli",
    poweredBy: "Palvelun tarjoaa",
  },
  sv: {
    comingSoon: "Kommer snart",
    intro:
      "Var webbplats ar under uppbyggnad. Ange din e-post for att fa lanserings- och produktuppdateringar.",
    timeLabel: "Dagar : Timmar : Minuter : Sekunder",
    daysLeft: "dagar kvar",
    subscribePrompt: "Vill du inte missa uppdateringar? Prenumerera nu",
    emailPlaceholder: "E-postadress",
    saving: "Sparar...",
    notify: "Meddela mig",
    follow: "Folj oss",
    whatWeDo:
      "Vi hjalper foretag med saker avtalssignering, identitetsverifiering, e-fakturering, smarta formular och automatisering samt dokumentcertifiering.",
    language: "Sprak",
    poweredBy: "Drivs av",
  },
};

function App() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const launchDate = useMemo(
    () => new Date(2026, 3, 30, 23, 59, 59),
    [],
  );
  const t = COPY[language];

  useEffect(() => {
    function pad(value) {
      return String(value).padStart(2, "0");
    }

    function updateTimer() {
      const now = new Date();
      const diff = launchDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      });
    }

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [launchDate]);

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(
      /\/$/,
      "",
    );
    const subscribeUrl = apiBase
      ? `${apiBase}/api/subscribe`
      : `${window.location.origin}/api/subscribe`;

    try {
      const response = await fetch(subscribeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setStatus("error");
        setMessage(
          `Something went wrong (HTTP ${response.status}). The site may be updating — please try again in a moment.`,
        );
        return;
      }

      if (!response.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "Could not save email right now.");
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(
        "Network error. Check your connection, or try again if the page was opened from a cached copy.",
      );
    }
  }

  return (
    <main className="page">
      <section className="coming-soon" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="language-chooser">
          <span className="language-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.93 9h-3.03a15.3 15.3 0 00-1.23-5A8.02 8.02 0 0118.93 11zM12 4c.78 1.12 1.74 3.14 2.14 7H9.86C10.26 7.14 11.22 5.12 12 4zM9.33 6a15.3 15.3 0 00-1.23 5H5.07a8.02 8.02 0 014.26-5zM5.07 13H8.1c.19 1.81.63 3.57 1.23 5a8.02 8.02 0 01-4.26-5zM12 20c-.78-1.12-1.74-3.14-2.14-7h4.28c-.4 3.86-1.36 5.88-2.14 7zm2.67-2a15.3 15.3 0 001.23-5h3.03a8.02 8.02 0 01-4.26 5z" />
            </svg>
          </span>
          <select
            id="language"
            aria-label={t.language}
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
            <option value="fi">Finnish</option>
            <option value="sv">Swedish</option>
          </select>
        </div>

        <div className="brand-row">
          <img
            src="/mbomsign-logo.png"
            alt="MbomSign logo"
            className="brand-logo"
          />
          <span className="brand-name">MbomSign</span>
        </div>

        <div className="hero-copy">
          <h1>{t.comingSoon}</h1>
          <p>{t.intro}</p>
        </div>

        <div className="timer" aria-label="Launch countdown">
          <span>{timeLeft.days}</span>
          <em>:</em>
          <span>{timeLeft.hours}</span>
          <em>:</em>
          <span>{timeLeft.minutes}</span>
          <em>:</em>
          <span>{timeLeft.seconds}</span>
        </div>

        <p className="time-label">{t.timeLabel}</p>
        <p className="days-left">
          {timeLeft.days} {t.daysLeft}
        </p>

        <p className="pre-form">{t.subscribePrompt}</p>

        <form className="notify-form" onSubmit={onSubmit}>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
          <button type="submit" disabled={status === "loading"}>
            <span className="button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2z" />
              </svg>
            </span>
            {status === "loading" ? t.saving : t.notify}
          </button>
        </form>

        {message && (
          <p
            className={`form-message ${
              status === "success" ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}

        <p className="what-we-do">
            We empower businesses and teams with a secure, scalable digital trust infrastructure enabling advanced contract signing, identity verification, e-invoicing, intelligent forms, workflow automation, and document certification. <br /> <br /> Built as Cameroon’s first sign and trust platform aligned with Nordic standards, we deliver reliability, compliance, and cutting-edge security by design.
        </p>

        <footer className="powered-by">
          {t.poweredBy}{" "}
          <a href="https://www.asatek.io" target="_blank" rel="noreferrer">
            AsaTek
          </a>
        </footer>
      </section>
    </main>
  );
}

export default App;
