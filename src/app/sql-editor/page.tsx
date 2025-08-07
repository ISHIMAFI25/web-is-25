// src/app/sql-editor/page.tsx
'use client';

import React, { useState } from 'react';
import Sidebar from "@/components/ui/sidebar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Compass, ScrollText, Database, Play } from "lucide-react";

interface QueryResult {
  success: boolean;
  data?: any[];
  columns?: string[];
  error?: string;
  rowCount?: number;
}

export default function SQLEditorPage() {
  const [query, setQuery] = useState<string>('-- Contoh query untuk melihat semua submissions\nSELECT * FROM task_submissions ORDER BY submitted_at DESC;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const executeQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a SQL query');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/sql-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Error executing query:', error);
      setResult({
        success: false,
        error: 'Network error: Could not execute query',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedQueries = [
    {
      name: 'Lihat Semua Submissions',
      query: 'SELECT student_name, student_email, submission_file_name, is_submitted, CASE WHEN is_submitted THEN \'Submitted\' ELSE \'Unsubmitted\' END as status, created_at, submitted_at FROM task_submissions ORDER BY created_at DESC;'
    },
    {
      name: 'Files Submitted (Final)',
      query: 'SELECT student_name, student_email, submission_file_name, submitted_at FROM task_submissions WHERE task_id = \'task-0\' AND is_submitted = true ORDER BY submitted_at DESC;'
    },
    {
      name: 'Files Unsubmitted (Draft)',
      query: 'SELECT student_name, student_email, submission_file_name, created_at, updated_at FROM task_submissions WHERE task_id = \'task-0\' AND is_submitted = false ORDER BY created_at DESC;'
    },
    {
      name: 'Status Summary per Task',
      query: 'SELECT task_id, task_day, SUM(CASE WHEN is_submitted = true THEN 1 ELSE 0 END) as submitted_count, SUM(CASE WHEN is_submitted = false THEN 1 ELSE 0 END) as unsubmitted_count, COUNT(*) as total_files FROM task_submissions GROUP BY task_id, task_day ORDER BY task_day;'
    },
    {
      name: 'Files yang Dapat Diganti',
      query: 'SELECT student_name, student_email, submission_file_name, created_at, \'Can be replaced\' as note FROM task_submissions WHERE is_submitted = false ORDER BY created_at DESC;'
    }
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex min-h-screen items-start justify-center p-4">
        {/* Efek kompas di pojok */}
        <div className="fixed top-10 right-10 w-32 h-32 opacity-30 z-10">
          <Compass size={128} className="text-amber-800" />
        </div>
        
        {/* Efek gulungan di pojok kiri */}
        <div className="fixed bottom-10 left-10 w-24 h-24 opacity-35 z-10">
          <ScrollText size={96} className="text-amber-900" />
        </div>

        {/* Sidebar Component */}
        <Sidebar />
        
        {/* SQL Editor Content */}
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6 rounded-lg shadow-lg" 
          style={{ 
            backgroundColor: "#f4e4bc",
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(101, 67, 33, 0.15) 3px, transparent 3px),
              radial-gradient(circle at 75% 75%, rgba(101, 67, 33, 0.1) 2px, transparent 2px),
              radial-gradient(circle at 60% 40%, rgba(101, 67, 33, 0.08) 4px, transparent 4px),
              radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.12) 2px, transparent 2px),
              radial-gradient(circle at 90% 20%, rgba(160, 82, 45, 0.1) 3px, transparent 3px)
            `,
            backgroundSize: "40px 40px, 30px 30px, 50px 50px, 35px 35px, 45px 45px",
            borderStyle: "solid",
            borderColor: "#8B4513",
            borderWidth: "4px",
            boxShadow: `
              0 0 0 2px #654321,
              0 0 0 4px #8B4513,
              inset 0 0 20px rgba(139, 69, 19, 0.3),
              inset 0 0 40px rgba(101, 67, 33, 0.2),
              0 10px 30px rgba(0, 0, 0, 0.4)
            `
          }}>
          
          <div className="flex items-center space-x-3 mb-6">
            <Database size={32} className="text-amber-800" />
            <h1 className="text-3xl md:text-4xl font-bold" style={{ 
              color: "#603017",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              fontFamily: "serif"
            }}>
              SQL Editor - Task Submissions
            </h1>
          </div>

          {/* Predefined Queries */}
          <div className="p-4 rounded-lg border-2" style={{
            backgroundColor: "#fff2d4",
            borderColor: "#A0522D",
          }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: "#603017" }}>
              Quick Queries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {predefinedQueries.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(item.query)}
                  className="text-left p-2 rounded text-sm hover:bg-amber-100 transition-colors"
                  style={{ color: "#8B4513" }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* SQL Query Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: "#603017" }}>
                SQL Query
              </h3>
              <button
                onClick={executeQuery}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "#603017",
                  color: "white",
                }}
              >
                <Play size={16} />
                <span>{isLoading ? 'Executing...' : 'Execute'}</span>
              </button>
            </div>
            
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-40 p-4 rounded-lg border-2 font-mono text-sm"
              style={{
                backgroundColor: "#fff2d4",
                borderColor: "#8B4513",
                color: "#603017",
              }}
              placeholder="Enter your SQL query here..."
            />
          </div>

          {/* Query Results */}
          {result && (
            <div className="p-4 rounded-lg border-2" style={{
              backgroundColor: "#fff2d4",
              borderColor: "#A0522D",
            }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "#603017" }}>
                Query Result
              </h3>
              
              {result.success ? (
                <>
                  {result.data && result.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <p className="text-sm mb-2" style={{ color: "#8B4513" }}>
                        {result.rowCount || result.data.length} row(s) returned
                      </p>
                      <table className="min-w-full border border-amber-800">
                        <thead>
                          <tr style={{ backgroundColor: "#603017" }}>
                            {result.columns ? result.columns.map((col, index) => (
                              <th key={index} className="border border-amber-800 px-2 py-1 text-left text-white text-sm">
                                {col}
                              </th>
                            )) : Object.keys(result.data[0]).map((key, index) => (
                              <th key={index} className="border border-amber-800 px-2 py-1 text-left text-white text-sm">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.data.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-amber-50" : "bg-white"}>
                              {Object.values(row).map((value: any, colIndex) => (
                                <td key={colIndex} className="border border-amber-800 px-2 py-1 text-sm" style={{ color: "#603017" }}>
                                  {value !== null ? String(value) : 'NULL'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: "#8B4513" }}>
                      Query executed successfully. {result.rowCount || 0} row(s) affected.
                    </p>
                  )}
                </>
              ) : (
                <div className="p-3 rounded bg-red-100 border border-red-300">
                  <p className="text-red-800 text-sm font-medium">Error:</p>
                  <p className="text-red-700 text-sm">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
