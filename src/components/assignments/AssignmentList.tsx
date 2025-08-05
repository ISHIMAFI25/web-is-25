// src/components/assignments/AssignmentList.tsx
"use client"; // This is a Client Component because there is user interaction (search, expand)

import React, { useState, useMemo } from 'react';
import { DayGroup, Assignment } from '@/types/assignment';
import { format } from 'date-fns'; // For date formatting
import { id } from 'date-fns/locale'; // For date formatting in Indonesian

interface AssignmentListProps {
  assignmentsData: DayGroup[]; // Receives assignment data as props
}

const AssignmentList: React.FC<AssignmentListProps> = ({ assignmentsData }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  // State to track which assignment is expanded
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  // Function to check if the deadline has passed
  const isDeadlinePassed = (deadline: string): boolean => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate < now;
  };

  // Function to toggle expand/collapse assignment
  const toggleExpand = (assignmentId: string) => {
    setExpandedAssignmentId(prevId => (prevId === assignmentId ? null : assignmentId));
  };

  // Filter assignments based on search term
  const filteredAssignments = useMemo(() => {
    if (!searchTerm) {
      return assignmentsData;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return assignmentsData.map(dayGroup => ({
      ...dayGroup,
      assignments: dayGroup.assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        assignment.description.toLowerCase().includes(lowerCaseSearchTerm) // Also search in description
      ),
    })).filter(dayGroup => dayGroup.assignments.length > 0); // Remove DayGroup if no matching assignments
  }, [assignmentsData, searchTerm]);

  return (
    <div className="w-full max-w-xl md:max-w-4xl lg:max-w-6xl mx-auto p-4 md:p-8 space-y-6 rounded-lg shadow-lg" 
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
      <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ 
        color: "#603017",
        textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
        fontFamily: "serif"
      }}>
        Tugas
      </h1>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari tugas"
          className="w-full p-3 pl-10 rounded-md border-2 focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: "#fff2d4",
            borderColor: "#8B4513",
            color: "#603017",
            boxShadow: "inset 0 2px 4px rgba(139, 69, 19, 0.1)"
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" fill="none" stroke="#603017" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      {/* Assignment List */}
      <div className="space-y-6">
        {filteredAssignments.length === 0 && (
          <p className="text-center" style={{ color: "#8B4513" }}>Tidak ada tugas yang ditemukan.</p>
        )}

        {filteredAssignments.map((dayGroup) => (
          <div key={dayGroup.day} className="p-4 rounded-lg shadow-md border-2"
            style={{
              backgroundColor: "#fff2d4",
              borderColor: "#A0522D",
              boxShadow: "0 4px 12px rgba(139, 69, 19, 0.2)"
            }}>
            <h2 className="text-xl font-bold mb-4" style={{ 
              color: "#603017",
              fontFamily: "serif"
            }}>
              DAY {dayGroup.day}
            </h2>
            <div className="space-y-4">
              {dayGroup.assignments.map((assignment) => {
                const passed = isDeadlinePassed(assignment.deadline);
                const deadlineDate = new Date(assignment.deadline);
                const formattedDate = format(deadlineDate, 'd MMMM yyyy', { locale: id });
                const formattedTime = format(deadlineDate, 'HH.mm');
                // Check if this assignment is expanded
                const isExpanded = expandedAssignmentId === assignment.id;

                return (
                  <div key={assignment.id} className="p-3 rounded-md shadow-sm border-2"
                    style={{
                      backgroundColor: "#f4e4bc",
                      borderColor: "#8B4513",
                      boxShadow: "0 2px 8px rgba(101, 67, 33, 0.15)"
                    }}>
                    <div className="flex items-center justify-between"> {/* Flex for title and button */}
                      <div className="flex items-center space-x-3">
                        {/* Deadline Indicator Dot */}
                        <span
                          className={`block w-3 h-3 rounded-full ${passed ? 'bg-red-600' : 'bg-green-600'}`}
                          title={passed ? 'Deadline sudah lewat' : 'Deadline belum lewat'}
                        ></span>
                        <div>
                          <h3 className="text-lg font-semibold" style={{ 
                            color: "#603017",
                            fontFamily: "serif"
                          }}>
                            {assignment.title}
                          </h3>
                          <p className="text-sm" style={{ color: "#8B4513" }}>
                            Deadline: {formattedDate}, pukul {formattedTime}
                          </p>
                        </div>
                      </div>
                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleExpand(assignment.id)}
                        className="p-2 rounded-full transition-transform duration-200 hover:scale-110"
                        style={{
                          backgroundColor: "#603017",
                          color: "white"
                        }}
                      >
                        <svg
                          className={`w-6 h-6 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 space-y-3 animate-fade-in border-t-2"
                        style={{ borderColor: "#A0522D" }}>
                        <p className="text-sm" style={{ color: "#8B4513" }}>
                          {assignment.description}
                        </p>
                        {assignment.attachmentUrl && (
                          <a
                            href={assignment.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium hover:underline transition-colors"
                            style={{ color: "#603017" }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                            </svg>
                            Lihat Lampiran Tugas (PDF)
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentList;
