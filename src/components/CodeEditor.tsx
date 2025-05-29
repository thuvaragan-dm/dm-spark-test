import Editor from "@monaco-editor/react";
import { type Monaco } from "@monaco-editor/react";
import "monaco-themes/themes/Monokai.json";
import { Dispatch, SetStateAction, useRef, useEffect, useState } from "react";
import { cn } from "../utilities/cn";
import {
  IDisposable,
  editor as MonacoEditorNamespaceType,
} from "monaco-editor";
import { formatCodeWithPrettier } from "../utilities/codeFormatter"; // Your working formatter

interface ICodeEditor {
  value: string;
  language?: string;
  readOnly?: boolean;
  handleSave?: (formattedValue: string) => Promise<void>;
  onChange?: (value: string | undefined) => void;
  setEditor?: Dispatch<
    SetStateAction<MonacoEditorNamespaceType.IStandaloneCodeEditor | null>
  >;
  className?: string;
  editorOptions?: MonacoEditorNamespaceType.IStandaloneEditorConstructionOptions;
}

const CodeEditor = ({
  value,
  language = "json", // Default language
  readOnly,
  onChange,
  setEditor,
  handleSave,
  className,
  editorOptions,
}: ICodeEditor) => {
  const editorRef =
    useRef<MonacoEditorNamespaceType.IStandaloneCodeEditor | null>(null);
  const monacoInstanceRef = useRef<Monaco | null>(null);
  const formattingProviderDisposableRef = useRef<IDisposable | null>(null);
  const initialFormatDoneRef = useRef<boolean>(false);

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isFormattingProviderRegistered, setIsFormattingProviderRegistered] =
    useState(false);

  const onSave = async () => {
    if (editorRef.current && monacoInstanceRef.current) {
      const editor = editorRef.current;
      const isReadOnlyEditor = editor.getOption(
        monacoInstanceRef.current.editor.EditorOption.readOnly,
      );
      console.log(
        "[CodeEditor] onSave triggered. Editor is readOnly:",
        isReadOnlyEditor,
      );

      let savedViewState: MonacoEditorNamespaceType.ICodeEditorViewState | null =
        null;

      if (!isReadOnlyEditor) {
        // Formatting on save still respects readOnly
        console.log(
          "[CodeEditor] Attempting format on save via editor.action.formatDocument...",
        );
        const formatAction = editor.getAction("editor.action.formatDocument");
        if (formatAction) {
          savedViewState = editor.saveViewState();
          console.log(
            "[CodeEditor] View state saved before formatting on save.",
          );

          await formatAction.run();
          console.log(
            "[CodeEditor] formatDocument action run completed on save.",
          );

          if (savedViewState) {
            editor.restoreViewState(savedViewState);
            console.log(
              "[CodeEditor] View state restored after formatting on save.",
            );
          }
        } else {
          console.warn(
            "[CodeEditor] 'editor.action.formatDocument' not found.",
          );
        }
      } else {
        console.log(
          "[CodeEditor] Editor is readOnly, skipping format on save.",
        );
      }

      const currentText = editor.getValue();
      console.log(
        "[CodeEditor] Model text after format action (first 100 chars):",
        currentText.substring(0, 100) + (currentText.length > 100 ? "..." : ""),
      );
      if (typeof currentText === "string") {
        handleSave?.(currentText);
      } else if (handleSave && currentText === undefined) {
        handleSave?.("");
      }
    } else {
      console.warn(
        "[CodeEditor] onSave triggered, but editorRef or monacoInstanceRef is not set.",
      );
    }
  };

  const handleEditorDidMount = (
    editor: MonacoEditorNamespaceType.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    console.log("[CodeEditor] Editor did mount. Setting refs and ready state.");
    editorRef.current = editor;
    monacoInstanceRef.current = monaco;
    setEditor?.(editor);
    initialFormatDoneRef.current = false;
    setIsEditorReady(true);

    editor.onDidChangeModelContent((e) => {
      console.log(
        "[CodeEditor] onDidChangeModelContent event. Is an undo/redo operation:",
        e.isFlush,
      );
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });
  };

  useEffect(() => {
    const monacoApi = monacoInstanceRef.current;
    const currentLanguage = language || "plaintext";
    console.log(
      "[CodeEditor] Provider Effect: Running. Language:",
      currentLanguage,
      "Editor/API Ready:",
      isEditorReady,
    );

    formattingProviderDisposableRef.current?.dispose();
    setIsFormattingProviderRegistered(false);
    initialFormatDoneRef.current = false;

    if (isEditorReady && monacoApi) {
      console.log(
        `[CodeEditor] Provider Effect: Registering provider for language: ${currentLanguage}`,
      );
      formattingProviderDisposableRef.current =
        monacoApi.languages.registerDocumentFormattingEditProvider(
          currentLanguage,
          {
            async provideDocumentFormattingEdits(model, _options, _token) {
              console.log(
                "[CodeEditor] provideDocumentFormattingEdits called. Language:",
                model.getLanguageId(),
              );
              const unformattedText = model.getValue();
              let formattedText = unformattedText;

              try {
                formattedText = await formatCodeWithPrettier(
                  unformattedText,
                  model.getLanguageId(),
                );
                console.log("[CodeEditor] --- Before Comparison ---");
                console.log(
                  "[CodeEditor] Unformatted Text (raw, stringified):",
                  JSON.stringify(unformattedText),
                );
                console.log(
                  "[CodeEditor] Formatted Text (raw, stringified):",
                  JSON.stringify(formattedText),
                );
                const areDifferent = formattedText !== unformattedText;
                console.log(
                  "[CodeEditor] Are they different (formattedText !== unformattedText)?",
                  areDifferent,
                );

                if (areDifferent) {
                  console.log(
                    "[CodeEditor] Texts ARE different. Providing edits to Monaco.",
                  );
                  return [
                    {
                      range: model.getFullModelRange(),
                      text: formattedText,
                    },
                  ];
                }
                console.log(
                  "[CodeEditor] Texts are considered THE SAME. No edits provided.",
                );
                return [];
              } catch (error) {
                console.error(
                  "[CodeEditor] Error in provideDocumentFormattingEdits (outer try/catch):",
                  error,
                );
                return [];
              }
            },
          },
        );
      setIsFormattingProviderRegistered(true);
    } else {
      console.log(
        "[CodeEditor] Provider Effect: Editor/Monaco API not yet ready.",
      );
    }

    return () => {
      console.log("[CodeEditor] Provider Effect: Cleanup. Disposing provider.");
      formattingProviderDisposableRef.current?.dispose();
      setIsFormattingProviderRegistered(false);
    };
  }, [language, isEditorReady]);

  // Effect for formatting the initial content on mount
  useEffect(() => {
    const editor = editorRef.current;
    const monacoApi = monacoInstanceRef.current; // Get monaco instance for checking readOnly option if needed

    console.log(
      "[CodeEditor] Format-on-Mount Effect: Evaluating. Conditions:",
      {
        editorAvailable: !!editor,
        providerRegistered: isFormattingProviderRegistered,
        isReadOnlyProp: readOnly, // Log the prop value
        isEditorOptionReadOnly:
          editor && monacoApi
            ? editor.getOption(monacoApi.editor.EditorOption.readOnly)
            : undefined,
        initialFormatAlreadyDone: initialFormatDoneRef.current,
        contentLength: editor?.getModel()?.getValueLength() ?? 0,
        isEditorReadyState: isEditorReady,
      },
    );

    if (
      editor &&
      isEditorReady &&
      isFormattingProviderRegistered &&
      !initialFormatDoneRef.current &&
      (editor.getModel()?.getValueLength() ?? 0) > 0
    ) {
      console.log(
        "[CodeEditor] Format-on-Mount Effect: Conditions met (readOnly check removed from this effect). Attempting format.",
      );
      const timerId = setTimeout(() => {
        if (editorRef.current) {
          let savedViewStateOnMount: MonacoEditorNamespaceType.ICodeEditorViewState | null =
            null;
          savedViewStateOnMount = editorRef.current.saveViewState();
          console.log("[CodeEditor] Format-on-Mount: View state saved.");

          editorRef.current
            .getAction("editor.action.formatDocument")
            ?.run()
            .then(() => {
              console.log(
                "[CodeEditor] Format-on-Mount Effect: Action completed.",
              );
              if (editorRef.current && savedViewStateOnMount) {
                editorRef.current.restoreViewState(savedViewStateOnMount);
                console.log(
                  "[CodeEditor] Format-on-Mount: View state restored.",
                );
              }
              initialFormatDoneRef.current = true;
            })
            .catch((err) => {
              console.error(
                "[CodeEditor] Format-on-Mount Effect: Action error:",
                err,
              );
            });
        }
      }, 100);

      return () => clearTimeout(timerId);
    } else {
      console.log(
        "[CodeEditor] Format-on-Mount Effect: Conditions NOT met or already done.",
      );
    }
  }, [
    isEditorReady,
    isFormattingProviderRegistered,
    language,
    readOnly,
    value,
  ]);

  return (
    <Editor
      onMount={handleEditorDidMount}
      defaultLanguage={language}
      language={language}
      height="100%"
      defaultValue={value}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        readOnly: readOnly, // This is what makes the editor instance read-only
        ...editorOptions,
      }}
      onChange={onChange}
      className={cn("", className)}
    />
  );
};

export default CodeEditor;
