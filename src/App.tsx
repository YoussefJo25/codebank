import { useState } from "react";
import { FileCode2 } from "lucide-react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { TopicView } from "./components/Editor/TopicView";
import { ExportModal, type ExportScope } from "./components/Export/ExportModal";
import { useStore } from "./store/useStore";

function App() {
  const topics = useStore((s) => s.topics);
  const folders = useStore((s) => s.folders);
  const selectedTopicId = useStore((s) => s.selectedTopicId);

  const [exportScope, setExportScope] = useState<ExportScope | null>(null);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);
  const selectedFolder = selectedTopic ? folders.find((f) => f.id === selectedTopic.folderId) : undefined;

  return (
    <div className="flex h-full flex-col">
      <Header onExportAll={() => setExportScope({ type: "all" })} />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="min-w-0 flex-1">
          {selectedTopic ? (
            <TopicView
              key={selectedTopic.id}
              topic={selectedTopic}
              folder={selectedFolder}
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
