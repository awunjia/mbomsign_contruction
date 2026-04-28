import { useEffect, useMemo, useState } from "react";
import CookieConsent from "react-cookie-consent";
import "./App.css";

const CONSENT_COOKIE_NAME = "mbomsign_cookie_consent_v1";

const COPY = {
  en: {
    comingSoon: "Coming Soon",
    intro:
      "Our platform is currently under construction but you can enter your email to get launch updates and product notifications.",
    timeLabel: "Days : Hours : Minutes : Seconds",
    daysLeft: "days left",
    subscribePrompt: "Don't want to miss updates? Subscribe now",
    emailPlaceholder: "Email address",
    saving: "Saving...",
    notify: "Notify Me",
    follow: "Follow Us On",
    whatWeDo:
      "We empower businesses and teams with a secure, scalable digital trust infrastructure enabling advanced contract signing, identity verification, e-invoicing, intelligent forms, workflow automation, and document certification. Built as Cameroon's first sign and trust platform aligned with Nordic standards, we deliver reliability, compliance, and cutting-edge security by design.",
    cookieBanner:
      "We use a cookie to remember your choice on this device. If you join the waitlist, we collect your email address only to notify you about our release date and other product updates. We do not collect names and we do not sell your data.",
    cookieAccept: "Accept",
    cookiePolicyDetailsLink: "Full policy",
    cookiePolicyTitle: "Privacy and cookie policy",
    cookiePolicyP1:
      "MbomSign stores a consent cookie so we do not ask you again on each visit. That cookie is not used to track you across other websites.",
    cookiePolicyP2:
      "When you subscribe, we collect your email address only. We use it solely to notify you about our product launch, release timing, and related product updates. We do not collect names on this page and we do not sell your personal information.",
    cookieClose: "Close",
    cookieFooterLink: "Privacy & cookies",
    language: "Language",
    poweredBy: "Powered by",
  },
  fr: {
    comingSoon: "Bientot Disponible",
    intro:
      "Notre plateforme est en cours de construction, mais vous pouvez entrer votre adresse e-mail pour recevoir les mises a jour du lancement et les notifications produit.",
    timeLabel: "Jours : Heures : Minutes : Secondes",
    daysLeft: "jours restants",
    subscribePrompt: "Ne manquez aucune mise a jour. Abonnez-vous",
    emailPlaceholder: "Adresse e-mail",
    saving: "Enregistrement...",
    notify: "Me notifier",
    follow: "Suivez-nous",
    whatWeDo:
      "Nous donnons aux entreprises et aux equipes une infrastructure de confiance numerique securisee et evolutive permettant la signature avancee de contrats, la verification d'identite, la facturation electronique, les formulaires intelligents, l'automatisation des workflows et la certification des documents. En tant que premiere plateforme de signature et de confiance au Cameroun, alignee sur les standards nordiques, nous offrons fiabilite, conformite et securite de pointe des la conception.",
    cookieBanner:
      "Nous utilisons un cookie pour memoriser votre choix sur cet appareil. Si vous rejoignez la liste d'attente, nous collectons uniquement votre adresse e-mail pour vous informer de la date de sortie et d'autres mises a jour produit. Nous ne collectons pas les noms et nous ne vendons pas vos donnees.",
    cookieAccept: "Accepter",
    cookiePolicyDetailsLink: "Politique complete",
    cookiePolicyTitle: "Politique de confidentialite et cookies",
    cookiePolicyP1:
      "MbomSign enregistre un cookie de consentement pour ne pas vous le redemander a chaque visite. Ce cookie ne sert pas a vous suivre sur d'autres sites.",
    cookiePolicyP2:
      "Lorsque vous vous inscrivez, nous collectons uniquement votre adresse e-mail. Nous l'utilisons seulement pour vous informer du lancement du produit, du calendrier de publication et des mises a jour liees au produit. Nous ne collectons pas les noms sur cette page et nous ne vendons pas vos donnees personnelles.",
    cookieClose: "Fermer",
    cookieFooterLink: "Confidentialite et cookies",
    language: "Langue",
    poweredBy: "Propulse par",
  },
  es: {
    comingSoon: "Proximamente",
    intro:
      "Nuestra plataforma esta en construccion, pero puedes introducir tu correo para recibir actualizaciones del lanzamiento y notificaciones del producto.",
    timeLabel: "Dias : Horas : Minutos : Segundos",
    daysLeft: "dias restantes",
    subscribePrompt: "No quieres perderte novedades? Suscribete",
    emailPlaceholder: "Correo electronico",
    saving: "Guardando...",
    notify: "Notificarme",
    follow: "Siguenos",
    whatWeDo:
      "Impulsamos a empresas y equipos con una infraestructura de confianza digital segura y escalable que permite firma avanzada de contratos, verificacion de identidad, facturacion electronica, formularios inteligentes, automatizacion de flujos de trabajo y certificacion de documentos. Como primera plataforma de firma y confianza de Camerun, alineada con estandares nordicos, ofrecemos fiabilidad, cumplimiento y seguridad de vanguardia desde el diseno.",
    cookieBanner:
      "Usamos una cookie para recordar tu eleccion en este dispositivo. Si te apuntas a la lista de espera, solo recopilamos tu correo electronico para avisarte de la fecha de lanzamiento y otras novedades del producto. No recopilamos nombres y no vendemos tus datos.",
    cookieAccept: "Aceptar",
    cookiePolicyDetailsLink: "Politica completa",
    cookiePolicyTitle: "Privacidad y cookies",
    cookiePolicyP1:
      "MbomSign guarda una cookie de consentimiento para no volver a preguntarte en cada visita. Esa cookie no se usa para rastrearte en otros sitios.",
    cookiePolicyP2:
      "Al suscribirte, solo recopilamos tu correo electronico. Lo usamos unicamente para informarte del lanzamiento del producto, los plazos de publicacion y actualizaciones relacionadas. No recopilamos nombres en esta pagina y no vendemos tu informacion personal.",
    cookieClose: "Cerrar",
    cookieFooterLink: "Privacidad y cookies",
    language: "Idioma",
    poweredBy: "Impulsado por",
  },
  de: {
    comingSoon: "Demnachst Verfugbar",
    intro:
      "Unsere Plattform befindet sich derzeit im Aufbau, aber du kannst deine E-Mail-Adresse eingeben, um Start-Updates und Produktbenachrichtigungen zu erhalten.",
    timeLabel: "Tage : Stunden : Minuten : Sekunden",
    daysLeft: "Tage ubrig",
    subscribePrompt: "Keine Updates verpassen? Jetzt abonnieren",
    emailPlaceholder: "E-Mail-Adresse",
    saving: "Speichern...",
    notify: "Benachrichtigen",
    follow: "Folge uns",
    whatWeDo:
      "Wir unterstutzen Unternehmen und Teams mit einer sicheren, skalierbaren digitalen Vertrauensinfrastruktur fur fortgeschrittene Vertragsunterzeichnung, Identitatsprufung, E-Rechnung, intelligente Formulare, Workflow-Automatisierung und Dokumentenzertifizierung. Als erste Signatur- und Vertrauensplattform Kameruns nach nordischen Standards bieten wir Zuverlassigkeit, Compliance und modernste Sicherheit by Design.",
    cookieBanner:
      "Wir verwenden ein Cookie, um deine Entscheidung auf diesem Gerat zu speichern. Wenn du dich eintragst, erfassen wir nur deine E-Mail-Adresse, um dich uber Veroffentlichungstermine und weitere Produktupdates zu informieren. Wir erfassen keine Namen und verkaufen deine Daten nicht.",
    cookieAccept: "Akzeptieren",
    cookiePolicyDetailsLink: "Vollstandige Richtlinie",
    cookiePolicyTitle: "Datenschutz und Cookies",
    cookiePolicyP1:
      "MbomSign speichert ein Einwilligungs-Cookie, damit wir dich nicht bei jedem Besuch erneut fragen. Dieses Cookie dient nicht zur Nachverfolgung auf anderen Websites.",
    cookiePolicyP2:
      "Bei der Anmeldung erfassen wir nur deine E-Mail-Adresse. Wir nutzen sie ausschliesslich, um dich uber Produktstart, Zeitplan und zugehorige Produktupdates zu informieren. Auf dieser Seite erfassen wir keine Namen und verkaufen keine personenbezogenen Daten.",
    cookieClose: "Schliessen",
    cookieFooterLink: "Datenschutz & Cookies",
    language: "Sprache",
    poweredBy: "Bereitgestellt von",
  },
  ar: {
    comingSoon: "قريبا",
    intro:
      "منصتنا قيد الانشاء حاليا، ويمكنك ادخال بريدك الالكتروني للحصول على تحديثات الاطلاق واشعارات المنتج.",
    timeLabel: "ايام : ساعات : دقائق : ثوان",
    daysLeft: "ايام متبقية",
    subscribePrompt: "لا تريد ان تفوت التحديثات؟ اشترك الان",
    emailPlaceholder: "البريد الالكتروني",
    saving: "جار الحفظ...",
    notify: "اخطرني",
    follow: "تابعنا",
    whatWeDo:
      "نمكن الشركات والفرق من بنية تحتية رقمية للثقة تكون امنة وقابلة للتوسع، وتدعم توقيع العقود المتقدم، والتحقق من الهوية، والفوترة الالكترونية، والنماذج الذكية، واتمتة سير العمل، وتصديق المستندات. وباعتبارنا اول منصة توقيع وثقة في الكاميرون ومتوافقة مع المعايير الاسكندنافية، نقدم الموثوقية والامتثال والامن المتقدم منذ التصميم.",
    cookieBanner:
      "نستخدم ملف تعريف ارتباط لتذكر اختيارك على هذا الجهاز. اذا انضممت الى قائمة الانتظار، نجمع عنوان بريدك الالكتروني فقط لاخبارك بموعد الاطلاق وتحديثات المنتج الاخرى. لا نجمع الاسماء ولا نبيع بياناتك.",
    cookieAccept: "موافقة",
    cookiePolicyDetailsLink: "السياسة الكاملة",
    cookiePolicyTitle: "الخصوصية وملفات تعريف الارتباط",
    cookiePolicyP1:
      "تحفظ MbomSign ملف تعريف ارتباط للموافقة حتى لا نعيد السؤال في كل زيارة. لا يُستخدم لتتبعك عبر مواقع اخرى.",
    cookiePolicyP2:
      "عند الاشتراك نجمع عنوان بريدك الالكتروني فقط. نستخدمه فقط لاخبارك باطلاق المنتج وجدول النشر والتحديثات المتعلقة بالمنتج. لا نجمع الاسماء في هذه الصفحة ولا نبيع معلوماتك الشخصية.",
    cookieClose: "اغلاق",
    cookieFooterLink: "الخصوصية وملفات الارتباط",
    language: "اللغة",
    poweredBy: "مدعوم من",
  },
  fi: {
    comingSoon: "Tulossa Pian",
    intro:
      "Alustamme on parhaillaan rakenteilla, mutta voit syottaa sahkopostiosoitteesi saadaksesi julkaisupaivityksia ja tuotetiedotteita.",
    timeLabel: "Paivaa : Tuntia : Minuuttia : Sekuntia",
    daysLeft: "paivaa jaljella",
    subscribePrompt: "Etkö halua missaata paivityksia? Tilaa nyt",
    emailPlaceholder: "Sahkoposti",
    saving: "Tallennetaan...",
    notify: "Ilmoita minulle",
    follow: "Seuraa meita",
    whatWeDo:
      "Tuemme yrityksia ja tiimeja turvallisella ja skaalautuvalla digitaalisen luottamuksen infrastruktuurilla, joka mahdollistaa kehittyneen sopimusten allekirjoituksen, henkilon tunnistamisen, verkkolaskutuksen, alykkaat lomakkeet, tyonkulkujen automaation ja asiakirjojen sertifioinnin. Kamerunin ensimmaisena allekirjoitus- ja luottamusalustana, joka on linjassa pohjoismaisten standardien kanssa, tarjoamme luotettavuutta, vaatimustenmukaisuutta ja huipputason turvallisuutta suunnittelusta alkaen.",
    cookieBanner:
      "Kaytamme evastetta tallentaaksemme valintasi talla laitteella. Jos liityt odotuslistalle, keräämme vain sahkopostiosoitteesi ilmoittaaksemme julkaisupaivasta ja muista tuotepaivityksista. Emme kerää nimia talla sivulla. Emme myy tietojasi.",
    cookieAccept: "Hyvaksy",
    cookiePolicyDetailsLink: "Taysi kaytanto",
    cookiePolicyTitle: "Tietosuoja ja evasteet",
    cookiePolicyP1:
      "MbomSign tallentaa suostumusevasteen, jotta emme kysy uudelleen jokaisella kaynnilla. Evastetta ei kayteta seurantaan muilla sivustoilla.",
    cookiePolicyP2:
      "Tilatessasi keräämme vain sahkopostiosoitteesi. Kaytamme sita vain tiedottaaksemme tuotejulkaisusta, aikataulusta ja niihin liittyvista paivityksista. Emme kerää nimia talla sivulla. Emme myy henkilotietojasi.",
    cookieClose: "Sulje",
    cookieFooterLink: "Tietosuoja ja evasteet",
    language: "Kieli",
    poweredBy: "Palvelun tarjoaa",
  },
  sv: {
    comingSoon: "Kommer Snart",
    intro:
      "Var plattform ar under uppbyggnad just nu, men du kan ange din e-postadress for att fa lanseringsuppdateringar och produktmeddelanden.",
    timeLabel: "Dagar : Timmar : Minuter : Sekunder",
    daysLeft: "dagar kvar",
    subscribePrompt: "Vill du inte missa uppdateringar? Prenumerera nu",
    emailPlaceholder: "E-postadress",
    saving: "Sparar...",
    notify: "Meddela mig",
    follow: "Folj oss",
    whatWeDo:
      "Vi ger foretag och team en saker och skalbar digital tillitsinfrastruktur som mojliggor avancerad avtalssignering, identitetsverifiering, e-fakturering, intelligenta formular, arbetsflodesautomatisering och dokumentcertifiering. Som Kameruns forsta signatur- och tillitsplattform, i linje med nordiska standarder, levererar vi tillforlitlighet, efterlevnad och banbrytande sakerhet redan i designen.",
    cookieBanner:
      "Vi anvander en kaka for att komma ihag ditt val pa den har enheten. Om du anmaler dig samlar vi endast in din e-postadress for att meddela dig om lanseringsdatum och andra produktuppdateringar. Vi samlar inte in namn och vi saljer inte dina uppgifter.",
    cookieAccept: "Godkann",
    cookiePolicyDetailsLink: "Full policy",
    cookiePolicyTitle: "Integritet och kakor",
    cookiePolicyP1:
      "MbomSign lagrar en samtyckeskaka sa att vi inte behover fraga igen vid varje besok. Den anvands inte for att spara dig pa andra webbplatser.",
    cookiePolicyP2:
      "Nar du prenumererar samlar vi endast in din e-postadress. Vi anvander den bara for att informera dig om produktlansering, tidplan och relaterade produktuppdateringar. Vi samlar inte in namn pa den har sidan och vi saljer inte dina personuppgifter.",
    cookieClose: "Stang",
    cookieFooterLink: "Integritet & kakor",
    language: "Sprak",
    poweredBy: "Drivs av",
  },
};

function App() {
  const [email, setEmail] = useState("");
  const [policyOpen, setPolicyOpen] = useState(false);
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
    () => new Date(2026, 5, 1, 23, 59, 59),
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

  useEffect(() => {
    if (!policyOpen) return;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setPolicyOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [policyOpen]);

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

        <p className="what-we-do">{t.whatWeDo}</p>

        <footer className="powered-by">
          <button
            type="button"
            className="footer-privacy-link"
            onClick={() => setPolicyOpen(true)}
          >
            {t.cookieFooterLink}
          </button>
          <span className="footer-sep" aria-hidden="true">
            {" · "}
          </span>
          {t.poweredBy}{" "}
          <a href="https://www.asatek.io" target="_blank" rel="noreferrer">
            AsaTek
          </a>
        </footer>
      </section>

      <CookieConsent
        location="bottom"
        buttonText={t.cookieAccept}
        cookieName={CONSENT_COOKIE_NAME}
        expires={365}
        sameSite="lax"
        style={{
          alignItems: "center",
          background: "rgba(15, 35, 92, 0.97)",
          color: "#e8edff",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          left: 0,
          position: "fixed",
          width: "100%",
          zIndex: 9998,
          boxShadow: "0 -8px 32px rgba(15, 23, 42, 0.2)",
        }}
        contentStyle={{
          flex: "1 1 280px",
          margin: "14px 18px",
          fontSize: "0.9rem",
          lineHeight: 1.55,
        }}
        buttonStyle={{
          background: "#465fff",
          border: 0,
          borderRadius: "10px",
          boxShadow: "none",
          color: "#fff",
          cursor: "pointer",
          flex: "0 0 auto",
          fontWeight: 700,
          margin: "12px 18px",
          padding: "12px 22px",
        }}
        containerClasses="cookie-consent-container"
        contentClasses="cookie-consent-text"
        buttonClasses="cookie-consent-btn"
        buttonWrapperClasses="cookie-consent-actions"
        ariaAcceptLabel={t.cookieAccept}
      >
        <span className="cookie-consent-msg">
          {t.cookieBanner}{" "}
          <button
            type="button"
            className="cookie-consent-inline-link"
            onClick={() => setPolicyOpen(true)}
          >
            {t.cookiePolicyDetailsLink}
          </button>
        </span>
      </CookieConsent>

      {policyOpen ? (
        <div
          className="policy-backdrop"
          role="presentation"
          onClick={() => setPolicyOpen(false)}
        >
          <div
            className="policy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-policy-title"
            dir={language === "ar" ? "rtl" : "ltr"}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="cookie-policy-title">{t.cookiePolicyTitle}</h2>
            <p>{t.cookiePolicyP1}</p>
            <p>{t.cookiePolicyP2}</p>
            <button
              type="button"
              className="policy-modal-close"
              onClick={() => setPolicyOpen(false)}
            >
              {t.cookieClose}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
