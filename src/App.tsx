import { useState, useEffect } from "react";
import { FileCode2 } from "lucide-react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { TopicView } from "./components/Editor/TopicView";
import { ExportModal, type ExportScope } from "./components/Export/ExportModal";
import { useStore } from "./store/useStore";
import { Auth } from "./components/Auth";
import { supabase } from "./lib/supabaseClient";

function App() {
  const topics = useStore((s) => s.topics);
  const folders = useStore((s) => s.folders);
  const selectedTopicId = useStore((s) => s.selectedTopicId);
  const session = useStore((s) => s.session);

  const loadFolders = useStore((s) => s.loadFolders);
  const loadTopics = useStore((s) => s.loadTopics);
  const loadUserProfile = useStore((s) => s.loadUserProfile);
  const setSession = useStore((s) => s.setSession);

  const [exportScope, setExportScope] = useState<ExportScope | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (session) {
      loadUserProfile();
      loadFolders();
      loadTopics();
    }
  }, [session, loadFolders, loadTopics, loadUserProfile]);

  if (!session) {
    return <Auth />;
  }

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  return (
    <div className="flex h-full flex-col">
      <Header 
        onExportAll={() => setExportScope({ type: "all" })} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-h-0 flex-1 relative overflow-hidden">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 z-40 bg-ink-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Wrapper */}
        <div className={`
          absolute inset-y-0 right-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <main className="min-w-0 flex-1 w-full lg:w-auto h-full overflow-y-auto">
          {selectedTopic ? (
            <TopicView
              key={selectedTopic.id}
              topic={selectedTopic}
              folders={folders}
              onExportTopic={(topicId) => setExportScope({ type: "topic", topicId })}
            />
          ) : (
            <EmptyState hasTopics={topics.length > 0} />
          )}
        </main>
      </div>

      <ExportModal scope={exportScope} onClose={() => setExportScope(null)} />
    </div>
  );
}

function EmptyState({ hasTopics }: { hasTopics: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-750 text-mist-500">
        <FileCode2 size={26} />
      </div>
      <h2 className="font-display text-lg font-bold text-mist-200">
        {hasTopics ? "اختر مسألة من الشريط الجانبي" : "ابدأ بإنشاء أول مسألة"}
      </h2>
      <p className="max-w-xs text-sm leading-relaxed text-mist-500">
        {hasTopics
          ? "هتقدر تعدّل الكود والشرح والبيانات من هنا."
          : "أنشئ فولدر من الشريط الجانبي، وبعدين أضف أول مسألة جواه عشان تبدأ تنظّم حلولك."}
      </p>
    </div>
  );
}

export default App;
