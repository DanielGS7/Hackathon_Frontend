"use client";

import React, { useState } from 'react';

interface DebugPanelProps {
  className?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

let logStore: LogEntry[] = [];
let listeners: Array<(logs: LogEntry[]) => void> = [];

export const addDebugLog = (level: LogEntry['level'], message: string, details?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  const entry: LogEntry = {
    timestamp,
    level,
    message,
    details: details ? JSON.stringify(details, null, 2) : undefined
  };

  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, details || '');

  logStore = [...logStore.slice(-99), entry]; // Keep last 100 logs
  listeners.forEach(listener => listener(logStore));
};

export const DebugPanel: React.FC<DebugPanelProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(logStore);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  React.useEffect(() => {
    const listener = (newLogs: LogEntry[]) => setLogs(newLogs);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  const clearLogs = () => {
    logStore = [];
    setLogs([]);
    addDebugLog('info', 'Debug logs cleared');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Debug ({logs.length})
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-2xl w-96 max-h-96 flex flex-col ${className}`}>
      <div className="bg-gray-800 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-semibold">Debug Console</h3>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">{logs.length} logs</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="hover:bg-gray-700 p-1 rounded transition-colors"
            title="Clear logs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-gray-700 p-1 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No debug logs yet</p>
            <p className="text-xs mt-1">Actions will appear here</p>
          </div>
        ) : (
          [...logs].reverse().map((log, index) => (
            <div
              key={index}
              className={`text-xs rounded p-2 border cursor-pointer transition-all ${getLevelColor(log.level)}`}
              onClick={() => setExpandedLog(expandedLog === index ? null : index)}
            >
              <div className="flex items-start gap-2">
                <span className="font-bold text-base">{getLevelIcon(log.level)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs opacity-75">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 font-medium break-words">{log.message}</p>
                  {log.details && expandedLog === index && (
                    <pre className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs overflow-x-auto">
                      {log.details}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
