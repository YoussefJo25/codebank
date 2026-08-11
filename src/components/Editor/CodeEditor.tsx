import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";
import { codeBankEditorTheme } from "../../lib/editorTheme";
import { LANGUAGES } from "../../lib/languages";
import type { Language } from "../../types";

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (code: string) => void;
}

export function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const extensions = useMemo(() => [LANGUAGES[language].extension()], [language]);

  return (
    <div className="ltr-scope h-full overflow-hidden rounded-lg border border-ink-600">
      <CodeMirror
        value={code}
        onChange={onChange}
        theme={codeBankEditorTheme}
        extensions={extensions}
        height="100%"
        style={{ height: "100%", fontSize: 13.5 }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          tabSize: 4,
        }}
        placeholder="اكتب أو الصق كود الحل هنا…"
      />
    </div>
  );
}
