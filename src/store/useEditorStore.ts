import { create } from 'zustand';
import { EditorTab, SupportedLanguage } from '../types/editor';
import { MemoryFS } from '../core/filesystem/MemoryFS';

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
  openFile: (path: string, fs: MemoryFS) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateBufferContent: (tabId: string, content: string) => void;
  saveActiveTab: (fs: MemoryFS) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
}

const getLanguageFromPath = (path: string): SupportedLanguage => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openFile: (path: string, fs: MemoryFS) => {
    const normalized = path.startsWith('/') ? path : '/' + path;
    const { tabs } = get();
    const existing = tabs.find((t) => t.path === normalized);

    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const content = fs.readFile(normalized) ?? '';
    const fileName = normalized.split('/').pop() || 'Untitled';
    const ext = fileName.split('.').pop() || '';

    const newTab: EditorTab = {
      id: normalized,
      path: normalized,
      name: fileName,
      extension: ext,
      isDirty: false,
      content,
      savedContent: content,
    };

    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    });
  },

  closeTab: (tabId: string) => {
    const { tabs, activeTabId } = get();
    const index = tabs.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    const newTabs = tabs.filter((t) => t.id !== tabId);
    let nextActiveId = activeTabId;

    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        nextActiveId = newTabs[Math.min(index, newTabs.length - 1)].id;
      } else {
        nextActiveId = null;
      }
    }

    set({ tabs: newTabs, activeTabId: nextActiveId });
  },

  setActiveTab: (tabId: string) => set({ activeTabId: tabId }),

  updateBufferContent: (tabId: string, content: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          content,
          isDirty: content !== tab.savedContent,
        };
      }),
    }));
  },

  saveActiveTab: (fs: MemoryFS) => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab || !activeTab.isDirty) return;

    fs.writeFile(activeTab.path, activeTab.content);

    set({
      tabs: tabs.map((t) =>
        t.id === activeTabId
          ? { ...t, savedContent: t.content, isDirty: false }
          : t
      ),
    });
  },

  closeOtherTabs: (tabId: string) => {
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id === tabId),
      activeTabId: tabId,
    }));
  },

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),
}));
