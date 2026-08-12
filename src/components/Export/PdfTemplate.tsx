import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Folder, PdfExportSettings, Topic } from "../../types";
import { LANGUAGES } from "../../lib/languages";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('javascript', javascript);

interface PdfTemplateProps {
  topics: Topic[];
  folders: Folder[];
  settings: PdfExportSettings;
  mode: "full" | "single";
}

export const PdfTemplate = forwardRef<HTMLDivElement, PdfTemplateProps>(
  ({ topics, folders, settings, mode }, ref) => {
    
    const topicsByFolder = new Map<string, Topic[]>();
    for (const topic of topics) {
      const list = topicsByFolder.get(topic.folderId);
      if (list) list.push(topic);
      else topicsByFolder.set(topic.folderId, [topic]);
    }

    const folderCount = new Set(topics.map((t) => t.folderId)).size;
    const dateLabel = new Intl.DateTimeFormat("ar", { year: "numeric", month: "long", day: "numeric" }).format(
      new Date(),
    );

    const renderCode = (code: string, language: string) => {
      const alias = LANGUAGES[language as keyof typeof LANGUAGES]?.hljsAlias || "plaintext";
      return (
        <div className="my-4 ltr-scope font-mono" style={{ fontSize: `${settings.codeFontSize}pt` }}>
          <SyntaxHighlighter
            language={alias}
            style={atomOneDark}
            customStyle={{
              padding: '1rem',
              borderRadius: '0.375rem',
              direction: 'ltr',
              margin: 0,
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    };

    let globalTopicIndex = 0;

    const renderTOCNode = (folderId: string, depth: number = 0) => {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return null;
      
      const folderTopics = topicsByFolder.get(folder.id) || [];
      const childFolders = folders.filter(f => f.parentId === folder.id);
      
      // If a folder has no topics and no child folders, skip it to save space
      const hasTopicsDeep = (id: string): boolean => {
        if ((topicsByFolder.get(id) || []).length > 0) return true;
        return folders.filter(f => f.parentId === id).some(child => hasTopicsDeep(child.id));
      };

      if (!hasTopicsDeep(folder.id)) return null;

      return (
        <li key={folder.id} className={depth === 0 ? "mb-4" : "mt-2"} style={{ paddingInlineStart: `${depth * 1.5}rem` }}>
          <span className={`font-bold text-orange-600 ${depth === 0 ? 'text-lg' : 'text-base'}`}>{folder.name}</span>
          {folderTopics.length > 0 && (
            <ul className="mt-2 pr-6 space-y-1 list-disc list-inside text-gray-700">
              {folderTopics.map(topic => (
                <li key={topic.id}>{topic.title}</li>
              ))}
            </ul>
          )}
          {childFolders.length > 0 && (
            <ul className="mt-2 space-y-2">
              {childFolders.map(child => renderTOCNode(child.id, depth + 1))}
            </ul>
          )}
        </li>
      );
    };

    const renderContentNode = (folderId: string, depth: number = 0) => {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return null;
      
      const folderTopics = topicsByFolder.get(folder.id) || [];
      const childFolders = folders.filter(f => f.parentId === folder.id);
      
      const hasTopicsDeep = (id: string): boolean => {
        if ((topicsByFolder.get(id) || []).length > 0) return true;
        return folders.filter(f => f.parentId === id).some(child => hasTopicsDeep(child.id));
      };

      if (!hasTopicsDeep(folder.id)) return null;

      const HeadingTag = depth === 0 ? 'h2' : (depth === 1 ? 'h3' : 'h4');
      const headingClasses = depth === 0 
        ? "text-xl font-bold text-orange-600 mb-6 pb-2 border-b-2 border-orange-200"
        : (depth === 1 ? "text-lg font-bold text-orange-500 mb-4 pb-1 border-b border-orange-100 mt-6" : "text-base font-bold text-orange-400 mb-3 mt-4");

      return (
        <div key={folder.id} className="mb-8 avoid-break" style={{ paddingInlineStart: depth > 0 ? '1.5rem' : '0' }}>
          <HeadingTag className={headingClasses}>
            {folder.name}
          </HeadingTag>
          {folderTopics.map(topic => {
            globalTopicIndex++;
            return (
              <TopicSection 
                key={topic.id} 
                topic={topic} 
                index={globalTopicIndex} 
                renderCode={renderCode} 
              />
            );
          })}
          {childFolders.map(child => renderContentNode(child.id, depth + 1))}
        </div>
      );
    };

    return (
      <div 
        ref={ref} 
        className="print-container bg-white text-gray-900 print:text-black hidden print:block w-full"
        style={{ direction: 'rtl' }}
      >
        <style>{`
          @media print {
            body { background: white !important; }
            .print-container { 
              display: block !important; 
              width: 100%; 
              padding: 0;
              margin: 0;
            }
            .page-break { break-after: page; }
            .avoid-break { break-inside: avoid; }
            /* Reset dark mode styles for print */
            * { color-scheme: light !important; }
            a { text-decoration: none !important; color: black !important; }
          }
          .md-preview-print h1 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.25em; }
          .md-preview-print h2 { font-size: 1.25em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
          .md-preview-print h3 { font-size: 1.1em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
          .md-preview-print p { margin-bottom: 0.75em; line-height: 1.6; }
          .md-preview-print ul, .md-preview-print ol { margin-bottom: 0.75em; padding-inline-start: 1.5em; }
          .md-preview-print li { margin-bottom: 0.25em; }
          .md-preview-print code { font-family: monospace; direction: ltr; unicode-bidi: isolate; }
          .md-preview-print pre { direction: ltr; unicode-bidi: isolate; background: #f9fafb; border: 1px solid #e5e7eb; padding: 1em; border-radius: 4px; overflow-x: auto; margin-bottom: 1em; }
          .md-preview-print blockquote { border-inline-start: 4px solid #d1d5db; padding-inline-start: 1em; color: #4b5563; margin-bottom: 1em; }
          .md-preview-print table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
          .md-preview-print th, .md-preview-print td { border: 1px solid #d1d5db; padding: 0.5em; text-align: start; }
          .md-preview-print th { background: #f3f4f6; }
        `}</style>

        {mode === "full" && (
          <>
            {/* Cover Page */}
            <div className="page-break flex h-[297mm] flex-col items-center justify-center text-center p-8">
              <h1 className="text-5xl font-bold text-orange-600 mb-6">CodeBank</h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{settings.title || "مرجع حلول البرمجة التنافسية"}</h2>
              {settings.subtitle && <p className="text-xl text-gray-600 mb-8">{settings.subtitle}</p>}
              
              <div className="w-16 h-px bg-gray-300 my-8 mx-auto" />
              
              <p className="text-lg text-gray-600 mb-4">
                {folderCount} فولدر · {topics.length} مسألة
              </p>
              <p className="text-sm font-mono text-gray-400">{dateLabel}</p>
            </div>

            {/* Table of Contents */}
            <div className="page-break p-8">
              <h2 className="text-2xl font-bold mb-6 border-b pb-2">المحتويات</h2>
              <ul className="space-y-2">
                {folders.filter(f => !f.parentId).map(folder => renderTOCNode(folder.id))}
              </ul>
            </div>
          </>
        )}

        {/* Content */}
        <div className={`p-8 ${settings.columns === 2 ? 'columns-2 gap-8' : ''}`}>
          {topics.length === 0 && (
            <div className="text-center text-gray-500 mt-20">لا توجد مسائل متضمنة في التصدير.</div>
          )}

          {mode === "single" ? (
            <TopicSection topic={topics[0]} index={1} renderCode={renderCode} />
          ) : (
            folders.filter(f => !f.parentId).map(folder => renderContentNode(folder.id))
          )}
        </div>

        {/* Print Watermark Footer */}
        <div className="hidden print:block print:fixed print:bottom-0 print:left-0 print:w-full text-center text-xs text-gray-400 pb-2">
          Generated by CodeBank | Developed by Youssef Abdellatif Jo
        </div>
      </div>
    );
  }
);

function TopicSection({ 
  topic, 
  index, 
  renderCode 
}: { 
  topic: Topic; 
  index: number; 
  renderCode: (code: string, lang: string) => React.ReactNode 
}) {
  const lang = LANGUAGES[topic.language];
  
  return (
    <div className="mb-8 avoid-break">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {index}. {topic.title}
      </h3>
      
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
        <span className="font-bold text-orange-600">{lang?.label}</span>
        {topic.complexity && (
          <>
            <span className="text-gray-300">·</span>
            <span className="font-mono text-emerald-600">{topic.complexity}</span>
          </>
        )}
        {topic.tags.length > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span className="font-mono text-gray-500">{topic.tags.map(t => `#${t}`).join("  ")}</span>
          </>
        )}
      </div>

      {topic.explanation.trim() && (
        <div className="md-preview-print mt-4 mb-4 text-gray-800">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const lang = match ? match[1] : "";
                
                if (!inline && lang) {
                  return (
                    <div className="ltr-scope my-2 font-mono" style={{ fontSize: '10pt' }}>
                      <SyntaxHighlighter
                        language={lang}
                        style={atomOneDark}
                        customStyle={{
                          padding: '1rem',
                          borderRadius: '0.375rem',
                          direction: 'ltr',
                          margin: 0,
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {topic.explanation}
          </ReactMarkdown>
        </div>
      )}

      {renderCode(topic.code, topic.language)}
      
      <div className="mt-6 mb-6 border-b border-gray-200 w-full" />
    </div>
  );
}
