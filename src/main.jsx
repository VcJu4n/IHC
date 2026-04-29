import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Globe2,
  Heart,
  Home,
  ListChecks,
  Menu,
  MicOff,
  RotateCcw,
  Settings,
  Train,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'idioma-vivo-user-test-v3';

const defaultState = {
  xp: 0,
  streak: 1,
  hearts: 5,
  completed: [],
  mistakes: [],
  history: [],
  events: [],
  level: 'Intermedio',
  detailMode: 'detallado',
  dailyGoal: 15,
  transportMode: false,
  cannotListen: false,
};

const exercises = [
  {
    id: 'literal-late',
    unit: 'Expresiones reales',
    type: 'translate',
    phrase: 'I am running late',
    prompt: 'Traduce al espanol de forma natural.',
    accepted: ['voy tarde', 'se me hace tarde', 'estoy llegando tarde'],
    correct: 'Voy tarde',
    trap: 'Estoy corriendo tarde',
    problem: 'Traducciones poco naturales',
    rule: 'No traduzcas expresiones palabra por palabra.',
    explanation:
      'En espanol no se usa "correr tarde" para decir que alguien esta retrasado. La frase natural depende de la situacion: "voy tarde" si estas en camino o "se me hace tarde" si aun no sales.',
    examples: ['Voy tarde a clase.', 'Se me hace tarde para la reunion.', 'Llegare tarde por el trafico.'],
    culture: {
      title: 'Avisar un retraso',
      place: 'Uso general en paises hispanohablantes',
      situation: 'Mensaje rapido antes de una clase, cita o reunion.',
      note: 'Suele acompanarse de una causa breve: trafico, transporte o una demora inesperada.',
    },
  },
  {
    id: 'restaurant-check',
    unit: 'Situaciones cotidianas',
    type: 'choice',
    phrase: 'Can I get the check?',
    prompt: 'Elige la frase mas natural en un restaurante.',
    options: ['Puedo obtener el cheque?', 'La cuenta, por favor', 'Puedo agarrar el control?'],
    accepted: ['la cuenta por favor'],
    correct: 'La cuenta, por favor',
    trap: 'Puedo obtener el cheque?',
    problem: 'Falta de contextualizacion cultural',
    rule: 'El contexto define la palabra correcta.',
    explanation:
      'En restaurante, "check" se traduce como "cuenta". "Cheque" existe, pero se usa para documentos bancarios.',
    examples: ['La cuenta, por favor.', 'Me trae la cuenta?', 'Nos puede cobrar, por favor?'],
    culture: {
      title: 'Pedir la cuenta',
      place: 'Restaurantes y cafeterias',
      situation: 'Al terminar de comer y querer pagar.',
      note: 'En varios lugares no llevan la cuenta hasta que el cliente la pide, para no apurarlo.',
    },
  },
  {
    id: 'catch-up',
    unit: 'Trabajo y estudio',
    type: 'choice',
    phrase: "Let's catch up tomorrow",
    prompt: 'Selecciona la traduccion con sentido real.',
    options: ['Atrapemonos manana', 'Nos ponemos al dia manana', 'Cogemos arriba manana'],
    accepted: ['nos ponemos al dia manana'],
    correct: 'Nos ponemos al dia manana',
    trap: 'Atrapemonos manana',
    problem: 'Retroalimentacion limitada en errores',
    rule: 'Primero entiende la intencion comunicativa.',
    explanation:
      '"Catch up" aqui significa actualizarse o conversar sobre pendientes. La traduccion literal cambia el significado.',
    examples: ['Nos ponemos al dia manana.', 'Hablamos manana y revisamos avances.', 'Te cuento todo manana.'],
    culture: {
      title: 'Ponerse al dia',
      place: 'Trabajo, universidad y amistades',
      situation: 'Retomar una conversacion o revisar informacion pendiente.',
      note: 'En trabajo suena profesional; con amigos puede ser una invitacion casual a conversar.',
    },
  },
  {
    id: 'mobility-audio',
    unit: 'Condiciones reales',
    type: 'choice',
    phrase: 'Listen and choose: I need a ticket',
    prompt: 'Estas en transporte. Elige una respuesta rapida.',
    options: ['Necesito un boleto', 'Necesito una etiqueta', 'Necesito una multa'],
    accepted: ['necesito un boleto'],
    correct: 'Necesito un boleto',
    trap: 'Necesito una etiqueta',
    problem: 'Uso en ruido o movilidad',
    rule: 'En movilidad convienen opciones grandes y poco texto.',
    explanation:
      'El modo transporte reduce carga visual y permite continuar aunque el usuario no pueda escuchar audio.',
    examples: ['Necesito un boleto.', 'Un boleto, por favor.', 'Donde compro el pasaje?'],
    culture: {
      title: 'Pedir transporte',
      place: 'Estaciones, buses y trenes',
      situation: 'Comprar un pasaje con poco tiempo o mucho ruido.',
      note: 'Boleto, billete y pasaje pueden variar por pais, por eso se muestra el contexto.',
    },
  },
  {
    id: 'device-short',
    unit: 'Multiplataforma',
    type: 'translate',
    phrase: 'How are you doing?',
    prompt: 'Escribe una version corta y natural.',
    accepted: ['como te va', 'como vas', 'que tal'],
    correct: 'Como te va?',
    trap: 'Como estas haciendo?',
    problem: 'Diferencias entre movil y web',
    rule: 'La misma tarea debe funcionar con teclado, tacto y pantallas pequenas.',
    explanation:
      'En saludos se traduce la funcion social, no cada palabra. "Como estas haciendo" no es una frase natural.',
    examples: ['Como te va?', 'Que tal?', 'Como vas con el proyecto?'],
    culture: {
      title: 'Saludo informal',
      place: 'Conversaciones breves',
      situation: 'Abrir una conversacion sin pedir una respuesta larga.',
      note: 'Muchas veces se responde con una frase corta y se sigue con el tema principal.',
    },
  },
  {
    id: 'personal-style',
    unit: 'Personalizacion',
    type: 'choice',
    phrase: 'I would like some water',
    prompt: 'Elige una forma natural y educada.',
    options: ['Quisiera agua, por favor', 'Me gustaria algo de agua', 'Yo habria agua'],
    accepted: ['quisiera agua por favor'],
    correct: 'Quisiera agua, por favor',
    trap: 'Yo habria agua',
    problem: 'Variacion en la experiencia del usuario',
    rule: 'El nivel y el modo de explicacion cambian cuanta ayuda recibe cada usuario.',
    explanation:
      'La respuesta correcta mantiene educacion y naturalidad. El prototipo permite cambiar entre explicacion rapida y detallada.',
    examples: ['Quisiera agua, por favor.', 'Me da agua, por favor?', 'Podria traerme agua?'],
    culture: {
      title: 'Pedir con cortesia',
      place: 'Restaurantes, visitas y atencion al cliente',
      situation: 'Pedir algo sin sonar brusco.',
      note: 'La cortesia cambia por pais, edad y formalidad de la relacion.',
    },
  },
];

const tabs = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'lesson', label: 'Leccion', icon: Zap },
  { id: 'context', label: 'Contexto', icon: Globe2 },
  { id: 'mobility', label: 'Movilidad', icon: Train },
  { id: 'review', label: 'Revision', icon: ListChecks },
  { id: 'testing', label: 'Pruebas', icon: ClipboardList },
  { id: 'profile', label: 'Perfil', icon: Settings },
];

const testScenarios = [
  {
    problem: 'Diferencias entre movil y web',
    task: 'Resolver una traduccion escrita y luego abrir el menu en pantalla angosta.',
    evidence: 'La interfaz debe conservar navegacion, progreso y botones sin superposicion.',
  },
  {
    problem: 'Traducciones poco naturales',
    task: 'Escribir una traduccion literal como "Estoy corriendo tarde".',
    evidence: 'Debe marcar error y explicar por que la frase no suena natural.',
  },
  {
    problem: 'Falta de contextualizacion cultural',
    task: 'Abrir Contexto despues de una respuesta.',
    evidence: 'Debe mostrar situacion, lugar de uso y nota cultural sin depender de banderas.',
  },
  {
    problem: 'Retroalimentacion limitada',
    task: 'Responder mal una pregunta de opcion multiple.',
    evidence: 'Debe mostrar respuesta correcta, regla y explicacion detallada o rapida.',
  },
  {
    problem: 'Uso en ruido o movilidad',
    task: 'Activar Modo transporte y "No puedo escuchar ahora".',
    evidence: 'Debe cambiar el flujo a botones grandes y alternativa textual.',
  },
  {
    problem: 'Variacion en la experiencia',
    task: 'Cambiar el perfil a modo rapido y repetir un error.',
    evidence: 'Debe reducir la explicacion y mantener progreso personalizado.',
  },
];

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,]/g, '')
    .trim();
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch {
    return defaultState;
  }
}

function App() {
  const [view, setView] = useState('home');
  const [state, setState] = useState(loadState);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const current = exercises[currentIndex];
  const completedCount = state.completed.length;
  const progress = Math.round((completedCount / exercises.length) * 100);
  const sessionProgress = Math.round(((currentIndex + 1) / exercises.length) * 100);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function logEvent(type, detail) {
    setState((prev) => ({
      ...prev,
      events: [
        {
          type,
          detail,
          date: new Date().toLocaleString('es-BO'),
        },
        ...prev.events,
      ].slice(0, 30),
    }));
  }

  function goTo(nextView) {
    setView(nextView);
    setMenuOpen(false);
    logEvent('navegacion', nextView);
  }

  function startLesson(index = 0) {
    setCurrentIndex(index);
    setAnswer('');
    setFeedback(null);
    setShowHelp(false);
    setView('lesson');
    logEvent('inicio_leccion', exercises[index].id);
  }

  function submitAnswer(value = answer, source = 'texto') {
    const submitted = value || 'Sin respuesta';
    const clean = normalize(submitted);
    const correct = current.accepted.some((item) => normalize(item) === clean);
    const literal = clean === normalize(current.trap);
    const result = {
      exerciseId: current.id,
      status: correct ? 'correct' : 'incorrect',
      submitted,
      source,
      problem: current.problem,
      reason: correct
        ? 'Respuesta correcta: comunica la idea de forma natural.'
        : literal
          ? 'Error detectado: traduccion literal poco natural.'
          : 'Respuesta incorrecta: no coincide con una forma natural para este contexto.',
      date: new Date().toLocaleString('es-BO'),
    };

    setFeedback(result);
    setState((prev) => {
      const completed = correct && !prev.completed.includes(current.id) ? [...prev.completed, current.id] : prev.completed;
      const mistakes = correct ? prev.mistakes.filter((id) => id !== current.id) : [...new Set([...prev.mistakes, current.id])];
      return {
        ...prev,
        xp: prev.xp + (correct ? 20 : 5),
        hearts: correct ? prev.hearts : Math.max(0, prev.hearts - 1),
        completed,
        mistakes,
        history: [result, ...prev.history].slice(0, 12),
        events: [{ type: 'respuesta', detail: `${current.id}: ${result.status}`, date: result.date }, ...prev.events].slice(0, 30),
      };
    });
  }

  function nextExercise() {
    const next = currentIndex + 1 >= exercises.length ? 0 : currentIndex + 1;
    setCurrentIndex(next);
    setAnswer('');
    setFeedback(null);
    setShowHelp(false);
    setView('lesson');
  }

  function updateSetting(key, value) {
    setState((prev) => ({ ...prev, [key]: value }));
    logEvent('configuracion', `${key}: ${value}`);
  }

  function resetAll() {
    setState(defaultState);
    setCurrentIndex(0);
    setAnswer('');
    setFeedback(null);
    setShowHelp(false);
    setView('home');
    localStorage.removeItem(STORAGE_KEY);
  }

  const appState = {
    state,
    current,
    currentIndex,
    progress,
    sessionProgress,
    answer,
    feedback,
    showHelp,
  };

  const actions = {
    goTo,
    startLesson,
    submitAnswer,
    nextExercise,
    setAnswer,
    setShowHelp,
    updateSetting,
    resetAll,
    logEvent,
  };

  return (
    <div className={`app-shell ${state.transportMode ? 'transport-ui' : ''}`}>
      <aside className={`side-nav ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="mascot">IV</div>
          <div>
            <strong>Idioma Vivo</strong>
            <span>Aprendizaje tipo Duolingo</span>
          </div>
        </div>
        <nav aria-label="Secciones principales">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={view === tab.id ? 'active' : ''} onClick={() => goTo(tab.id)}>
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main>
        <header className="top-bar">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)} title="Menu">
            <Menu size={21} />
          </button>
          <StatusBar hearts={state.hearts} xp={state.xp} streak={state.streak} progress={sessionProgress} />
          <button className="ghost-button" onClick={nextExercise}>
            <ChevronRight size={18} />
            <span>Siguiente</span>
          </button>
        </header>

        <section className="workspace">
          {view === 'home' && <HomeScreen appState={appState} actions={actions} />}
          {view === 'lesson' && <LessonScreen appState={appState} actions={actions} />}
          {view === 'context' && <ContextScreen current={current} />}
          {view === 'mobility' && <MobilityScreen appState={appState} actions={actions} />}
          {view === 'review' && <ReviewScreen appState={appState} actions={actions} />}
          {view === 'testing' && <TestingScreen state={state} actions={actions} />}
          {view === 'profile' && <ProfileScreen state={state} actions={actions} />}
        </section>
      </main>
    </div>
  );
}

function StatusBar({ hearts, xp, streak, progress }) {
  return (
    <div className="status-bar">
      <div className="stat-pill">
        <Heart size={18} />
        <strong>{hearts}</strong>
      </div>
      <div className="stat-pill">
        <Zap size={18} />
        <strong>{xp} XP</strong>
      </div>
      <div className="stat-pill">
        <Trophy size={18} />
        <strong>{streak} dia</strong>
      </div>
      <div className="progress-track" aria-label={`Progreso de sesion ${progress}%`}>
        <div style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function ScreenHeader({ eyebrow, title, description }) {
  return (
    <div className="screen-header">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function HomeScreen({ appState, actions }) {
  const { state, progress } = appState;
  return (
    <div className="single-column">
      <ScreenHeader
        eyebrow="Inicio"
        title="Ruta de ingles practico"
        description="Prototipo funcional para probar problemas reales de aprendizaje: literalidad, contexto, feedback, movilidad, multiplataforma y personalizacion."
      />
      <div className="stats-grid">
        <Metric icon={Zap} label="XP acumulado" value={state.xp} />
        <Metric icon={Heart} label="Vidas" value={state.hearts} />
        <Metric icon={Check} label="Curso" value={`${progress}%`} />
      </div>
      <div className="course-layout">
        <div className="panel">
          <div className="panel-title">
            <BookOpen size={20} />
            <h2>Lecciones</h2>
          </div>
          <div className="lesson-list">
            {exercises.map((item, index) => {
              const done = state.completed.includes(item.id);
              const review = state.mistakes.includes(item.id);
              return (
                <button className="lesson-row" key={item.id} onClick={() => actions.startLesson(index)}>
                  <span className={`lesson-state ${done ? 'done' : review ? 'review' : ''}`}>
                    {done ? <Check size={16} /> : review ? <RotateCcw size={16} /> : index + 1}
                  </span>
                  <span>
                    <strong>{item.phrase}</strong>
                    <small>{item.problem}</small>
                  </span>
                  <ChevronRight size={18} />
                </button>
              );
            })}
          </div>
        </div>
        <aside className="panel">
          <div className="panel-title">
            <ClipboardList size={20} />
            <h2>Objetivo de prueba</h2>
          </div>
          <p className="body-text">
            Pide a cada usuario iniciar una leccion, equivocarse al menos una vez, revisar la explicacion, activar movilidad y cambiar una preferencia. El historial guardara evidencia para comparar resultados.
          </p>
          <button className="primary-button full-button" onClick={() => actions.startLesson(0)}>
            <Zap size={18} />
            Empezar prueba
          </button>
        </aside>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="panel metric">
      <Icon size={24} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LessonScreen({ appState, actions }) {
  const { current, currentIndex, answer, feedback, showHelp, state } = appState;
  const compact = state.transportMode;
  return (
    <div className="screen-grid">
      <div className="panel lesson-card">
        <ScreenHeader
          eyebrow={`Leccion ${currentIndex + 1} de ${exercises.length}`}
          title={current.unit}
          description={compact ? 'Modo transporte activo: menos texto y controles grandes.' : current.problem}
        />
        <div className="prompt-box">
          <span className="label">{current.prompt}</span>
          <strong>{current.phrase}</strong>
        </div>

        {current.type === 'translate' ? (
          <label className="answer-field">
            Tu respuesta
            <textarea
              value={answer}
              onChange={(event) => actions.setAnswer(event.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={compact ? 2 : 4}
            />
          </label>
        ) : (
          <div className="option-list">
            {current.options.map((option) => (
              <button key={option} onClick={() => actions.submitAnswer(option, 'opcion')}>
                {option}
              </button>
            ))}
          </div>
        )}

        <div className="action-row">
          <button className="secondary-button" onClick={() => actions.setShowHelp(!showHelp)}>
            <CircleHelp size={18} />
            Ayuda
          </button>
          {current.type === 'translate' && (
            <button className="primary-button" onClick={() => actions.submitAnswer()}>
              <Check size={18} />
              Revisar
            </button>
          )}
        </div>

        {feedback && <FeedbackPanel current={current} feedback={feedback} state={state} actions={actions} />}
      </div>

      <aside className="panel support-panel">
        <div className="panel-title">
          <CircleHelp size={20} />
          <h2>Pista contextual</h2>
        </div>
        {showHelp ? (
          <>
            <ul className="example-list">
              {current.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
            <p className="note">{current.rule}</p>
          </>
        ) : (
          <p className="empty-state">Usa Ayuda para ver ejemplos sin resolver automaticamente la actividad.</p>
        )}
      </aside>
    </div>
  );
}

function FeedbackPanel({ current, feedback, state, actions }) {
  const isCorrect = feedback.status === 'correct';
  return (
    <div className={`feedback-sheet ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="feedback-title">
        {isCorrect ? <Check size={24} /> : <X size={24} />}
        <strong>{isCorrect ? 'Correcto' : 'Revisar respuesta'}</strong>
      </div>
      <p>{feedback.reason}</p>
      <div className="answer-compare">
        <span>Tu respuesta: <strong>{feedback.submitted}</strong></span>
        <span>Respuesta sugerida: <strong>{current.correct}</strong></span>
      </div>
      <p>{state.detailMode === 'rapido' ? current.rule : current.explanation}</p>
      <div className="action-row">
        <button className="secondary-button" onClick={() => actions.goTo('context')}>
          <Globe2 size={18} />
          Ver contexto
        </button>
        <button className="primary-button" onClick={actions.nextExercise}>
          <ChevronRight size={18} />
          Continuar
        </button>
      </div>
    </div>
  );
}

function ContextScreen({ current }) {
  return (
    <div className="single-column">
      <ScreenHeader
        eyebrow="Contexto cultural"
        title={current.culture.title}
        description="Esta pantalla resuelve la falta de contexto: muestra uso, situacion y variacion cultural sin depender solamente de banderas."
      />
      <div className="context-layout">
        <div className="panel phrase-card">
          <span className="label">Frase objetivo</span>
          <strong>{current.correct}</strong>
        </div>
        <div className="panel">
          <InfoRow label="Situacion" value={current.culture.situation} />
          <InfoRow label="Ambito" value={current.culture.place} />
          <InfoRow label="Nota cultural" value={current.culture.note} />
        </div>
      </div>
    </div>
  );
}

function MobilityScreen({ appState, actions }) {
  const { state, current } = appState;
  return (
    <div className="single-column">
      <ScreenHeader
        eyebrow="Modo movilidad"
        title="Practica en transporte o ruido"
        description="Este flujo prueba el uso en condiciones reales: botones grandes, menos lectura y alternativa cuando no se puede escuchar."
      />
      <div className="panel">
        <div className="switch-row">
          <div>
            <strong>Modo transporte</strong>
            <span>Reduce texto y aumenta el tamano de interaccion.</span>
          </div>
          <button
            className={`toggle ${state.transportMode ? 'on' : ''}`}
            onClick={() => actions.updateSetting('transportMode', !state.transportMode)}
            aria-label="Activar modo transporte"
          >
            <span />
          </button>
        </div>
        <button
          className={`wide-option ${state.cannotListen ? 'selected' : ''}`}
          onClick={() => actions.updateSetting('cannotListen', !state.cannotListen)}
        >
          <MicOff size={22} />
          No puedo escuchar ahora
        </button>
      </div>
      <div className="quick-grid">
        {[current.correct, current.trap, 'No entiendo'].map((option) => (
          <button key={option} onClick={() => actions.submitAnswer(option, 'movilidad')}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewScreen({ appState, actions }) {
  const { state } = appState;
  const reviewItems = state.history.length ? state.history : [];
  return (
    <div className="single-column">
      <ScreenHeader
        eyebrow="Revision"
        title="Errores y respuestas"
        description="Registro funcional para observar que errores aparecen y que tipo de retroalimentacion recibio cada usuario."
      />
      <div className="panel">
        {reviewItems.length ? (
          <div className="history-list">
            {reviewItems.map((item, index) => (
              <div className="history-item" key={`${item.exerciseId}-${index}`}>
                <span className={item.status}>{item.status === 'correct' ? 'Correcto' : 'Error'}</span>
                <strong>{item.problem}</strong>
                <small>{item.submitted} · {item.date}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">Aun no hay respuestas registradas.</p>
        )}
      </div>
      <button className="secondary-button fit-button" onClick={() => actions.startLesson(0)}>
        <RotateCcw size={18} />
        Repetir ruta
      </button>
    </div>
  );
}

function TestingScreen({ state, actions }) {
  const coveredProblems = new Set(state.history.map((item) => item.problem));
  return (
    <div className="single-column">
      <ScreenHeader
        eyebrow="Guia para pruebas con usuarios"
        title="Problemas funcionales del diseno"
        description="Usa esta pantalla como checklist durante las pruebas. Cada punto corresponde a un problema del diseno original y tiene evidencia observable."
      />
      <div className="test-grid">
        {testScenarios.map((scenario) => {
          const done =
            coveredProblems.has(scenario.problem) ||
            (scenario.problem === 'Uso en ruido o movilidad' && (state.transportMode || state.cannotListen)) ||
            (scenario.problem === 'Variacion en la experiencia' && state.events.some((event) => event.detail.includes('detailMode'))) ||
            state.events.some((event) => event.detail.includes(scenario.problem));
          return (
            <div className="panel test-card" key={scenario.problem}>
              <span className={`test-status ${done ? 'done' : ''}`}>{done ? 'Probado' : 'Pendiente'}</span>
              <h2>{scenario.problem}</h2>
              <p><strong>Tarea:</strong> {scenario.task}</p>
              <p><strong>Evidencia:</strong> {scenario.evidence}</p>
            </div>
          );
        })}
      </div>
      <div className="panel">
        <div className="panel-title">
          <ClipboardList size={20} />
          <h2>Eventos registrados</h2>
        </div>
        {state.events.length ? (
          <div className="history-list">
            {state.events.map((event, index) => (
              <div className="history-item" key={`${event.type}-${index}`}>
                <span>{event.type}</span>
                <strong>{event.detail}</strong>
                <small>{event.date}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">Los eventos apareceran cuando el usuario navegue, responda o cambie configuraciones.</p>
        )}
      </div>
      <button className="secondary-button fit-button" onClick={actions.resetAll}>
        <RotateCcw size={18} />
        Limpiar datos para otro usuario
      </button>
    </div>
  );
}

function ProfileScreen({ state, actions }) {
  return (
    <div className="single-column">
      <ScreenHeader
        eyebrow="Personalizacion"
        title="Experiencia adaptable"
        description="Permite probar si usuarios con distintos niveles prefieren explicaciones rapidas o detalladas."
      />
      <div className="settings-grid">
        <div className="panel">
          <span className="label">Nivel</span>
          <div className="segmented">
            {['Basico', 'Intermedio', 'Avanzado'].map((level) => (
              <button key={level} className={state.level === level ? 'selected' : ''} onClick={() => actions.updateSetting('level', level)}>
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <span className="label">Retroalimentacion</span>
          <div className="segmented">
            <button className={state.detailMode === 'rapido' ? 'selected' : ''} onClick={() => actions.updateSetting('detailMode', 'rapido')}>
              Rapida
            </button>
            <button className={state.detailMode === 'detallado' ? 'selected' : ''} onClick={() => actions.updateSetting('detailMode', 'detallado')}>
              Detallada
            </button>
          </div>
        </div>
        <div className="panel">
          <label className="range-label">
            Meta diaria: <strong>{state.dailyGoal} min</strong>
            <input
              type="range"
              min="5"
              max="45"
              step="5"
              value={state.dailyGoal}
              onChange={(event) => actions.updateSetting('dailyGoal', Number(event.target.value))}
            />
          </label>
        </div>
      </div>
      <button className="secondary-button fit-button" onClick={actions.resetAll}>
        <RotateCcw size={18} />
        Reiniciar usuario
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
