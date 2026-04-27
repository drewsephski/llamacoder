"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { getMonacoLanguage } from "@/lib/utils";
import { Tree, Folder, File, type TreeViewElement } from "@/components/ui/file-tree";

export default function SyntaxHighlighter({
  files,
  activePath,
  disableSelection,
  isStreaming,
}: {
  files: Array<{ path: string; content: string; language: string }>;
  activePath?: string;
  disableSelection?: boolean;
  isStreaming?: boolean;
}) {
  const [activeFile, setActiveFile] = useState(0);
  const editorRef = useRef<any>(null);

  // Keep the active file synced when an external activePath is provided
  useEffect(() => {
    if (!activePath) return;
    const idx = files.findIndex((f) => f.path === activePath);
    if (idx !== -1 && idx !== activeFile) {
      setActiveFile(idx);
    }
  }, [activePath, files, activeFile]);

  const file = files[activeFile];
  const monacoLanguage = useMemo(
    () => (file ? getMonacoLanguage(file.language) : "plaintext"),
    [file?.language],
  );

  // Auto-scroll the editor to bottom when streaming updates arrive
  useEffect(() => {
    if (!isStreaming || !editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel?.();
    const lineCount = model?.getLineCount?.() || 1;
    // Reveal last line and ensure scroll position at bottom
    editor.revealLine?.(lineCount);
    const scrollHeight = editor.getScrollHeight?.();
    if (typeof scrollHeight === "number") {
      editor.setScrollTop?.(scrollHeight);
    }
  }, [file?.content, activeFile, isStreaming]);

  if (files.length === 0) {
    return <div className="p-4 text-muted-foreground">No files to display</div>;
  }

  // Convert files to TreeViewElement format
  const treeElements = useMemo(() => buildTreeElements(files), [files]);

  // Handle file selection from tree
  const handleFileSelect = useCallback((id: string) => {
    if (disableSelection) return;
    const index = files.findIndex((f) => f.path === id);
    if (index !== -1) setActiveFile(index);
  }, [disableSelection, files]);

  return (
    <div className="flex h-full flex-col md:flex-row">
      {files.length > 1 && (
        <>
          {/* Mobile: File tree above code editor */}
          <div className="block border-b border-border bg-muted md:hidden">
            <div className="border-b border-border p-2 text-sm font-medium text-foreground">
              Files ({files.length})
            </div>
            <div className="h-32">
              <Tree
                elements={treeElements}
                initialSelectedId={files[activeFile]?.path}
                indicator={true}
                className="h-full"
              >
                {treeElements.map((element) => renderTreeNode(element, handleFileSelect, files[activeFile]?.path))}
              </Tree>
            </div>
          </div>

          {/* Desktop: File tree as sidebar */}
          <div
            className={`hidden w-fit max-w-48 border-r border-border bg-muted md:block md:w-64 ${isStreaming ? "pointer-events-none opacity-60" : ""}`}
          >
            <div className="border-b border-border p-2 text-sm font-medium text-foreground">
              Files ({files.length})
            </div>
            <div className="h-[calc(100%-2.5rem)]">
              <Tree
                elements={treeElements}
                initialSelectedId={files[activeFile]?.path}
                indicator={true}
                className="h-full"
              >
                {treeElements.map((element) => renderTreeNode(element, handleFileSelect, files[activeFile]?.path))}
              </Tree>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          {file?.path}
        </div>
        <div className="flex-1">
          <div className="relative h-full">
            <Editor
              value={file?.content || ""}
              language={monacoLanguage}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                scrollbar: isStreaming
                  ? { vertical: "hidden", horizontal: "hidden" }
                  : { vertical: "auto", horizontal: "auto" },
              }}
              onMount={(editor) => {
                editorRef.current = editor;
                if (isStreaming) {
                  const model = editor.getModel?.();
                  const lineCount = model?.getLineCount?.() || 1;
                  editor.revealLine?.(lineCount);
                  const scrollHeight = editor.getScrollHeight?.();
                  if (typeof scrollHeight === "number") {
                    editor.setScrollTop?.(scrollHeight);
                  }
                }
              }}
              height="82vh"
            />
            {isStreaming && (
              <>
                <div
                  className="absolute inset-0 z-10 cursor-not-allowed bg-transparent"
                  onWheel={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseMove={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onScroll={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onKeyDown={(e) => {
                    // Prevent arrow keys, page up/down, home/end from scrolling
                    if (
                      [
                        "ArrowUp",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowRight",
                        "PageUp",
                        "PageDown",
                        "Home",
                        "End",
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  tabIndex={-1}
                  style={{ pointerEvents: "all" }}
                />
                <div className="absolute bottom-4 left-0 right-0 z-20 pb-4 pt-8">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm dark:bg-primary/20">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                      </div>
                      <span>
                        AI is writing your{" "}
                        {activePath ? activePath.split("/").pop() : "code"}...
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Build tree elements from files array
function buildTreeElements(
  files: Array<{ path: string; content: string; language: string }>,
): TreeViewElement[] {
  const folderMap = new Map<string, TreeViewElement>();

  // First pass: create all folders
  files.forEach((file) => {
    const parts = file.path.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];

      if (!folderMap.has(currentPath)) {
        const folder: TreeViewElement = {
          id: currentPath,
          name: parts[i],
          type: "folder",
          isSelectable: true,
          children: [],
        };
        folderMap.set(currentPath, folder);
      }
    }
  });

  // Second pass: assign children to folders
  folderMap.forEach((folder, path) => {
    const directChildren: TreeViewElement[] = [];

    // Add child folders
    folderMap.forEach((child, childPath) => {
      if (childPath !== path) {
        const childParent = childPath.substring(0, childPath.lastIndexOf("/"));
        if (childParent === path) {
          directChildren.push(child);
        }
      }
    });

    // Add files that are direct children of this folder
    files.forEach((file) => {
      const lastSlashIndex = file.path.lastIndexOf("/");
      const fileParent = lastSlashIndex === -1 ? "" : file.path.substring(0, lastSlashIndex);
      
      if (fileParent === path) {
        const fileName = file.path.split("/").pop()!;
        directChildren.push({
          id: file.path,
          name: fileName,
          type: "file",
          isSelectable: true,
        });
      }
    });

    folder.children = directChildren;
  });

  // Get root level items
  const rootItems: TreeViewElement[] = [];

  folderMap.forEach((folder, path) => {
    if (!path.includes("/")) {
      rootItems.push(folder);
    }
  });

  // Add root level files (files with no parent folder)
  files.forEach((file) => {
    if (!file.path.includes("/")) {
      rootItems.push({
        id: file.path,
        name: file.path,
        type: "file",
        isSelectable: true,
      });
    }
  });

  return rootItems;
}

// Recursive render function for tree nodes

function renderTreeNode(
  element: TreeViewElement,
  onSelect: (id: string) => void,
  activePath?: string,
): React.ReactNode {
  if (element.type === "folder" || element.children) {
    return (
      <Folder
        key={element.id}
        value={element.id}
        element={element.name}
        isSelectable={true}
        isSelect={activePath?.startsWith(element.id)}
      >
        {element.children?.map((child) =>
          renderTreeNode(child, onSelect, activePath)
        )}
      </Folder>
    );
  }

  return (
    <File
      key={element.id}
      value={element.id}
      isSelectable={true}
      isSelect={element.id === activePath}
      handleSelect={onSelect}
    >
      <span>{element.name}</span>
    </File>
  );
}
