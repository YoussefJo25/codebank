import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import type { Extension } from "@codemirror/state";
import type { Language } from "../types";

interface LanguageMeta {
  label: string;
  extension: () => Extension;
  hljsAlias: string;
  sample: string;
}

export const LANGUAGES: Record<Language, LanguageMeta> = {
  cpp: {
    label: "C++",
    extension: () => cpp(),
    hljsAlias: "cpp",
    sample: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeBank!" << endl;\n    return 0;\n}\n`,
  },
  python: {
    label: "Python",
    extension: () => python(),
    hljsAlias: "python",
    sample: `def solve():\n    print("Hello, CodeBank!")\n\nif __name__ == "__main__":\n    solve()\n`,
  },
  java: {
    label: "Java",
    extension: () => java(),
    hljsAlias: "java",
    sample: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeBank!");\n    }\n}\n`,
  },
  javascript: {
    label: "JavaScript",
    extension: () => javascript(),
    hljsAlias: "javascript",
    sample: `function solve() {\n  console.log("Hello, CodeBank!");\n}\n\nsolve();\n`,
  },
};

export const LANGUAGE_ORDER: Language[] = ["cpp", "python", "java", "javascript"];
