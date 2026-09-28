import { createSelector } from '@reduxjs/toolkit';

const getResponses = (state) => state.attempt.responses;
const getSections = (state) => state.attempt.sections;

// Returns counts for a specific section or overall if sectionId is omitted
export const makeSelectPaletteCounts = () => createSelector(
  [getResponses, getSections, (state, sectionId) => sectionId],
  (responses, sections, sectionId) => {
    let targetQuestionIds = [];
    
    if (sectionId) {
      const section = sections.find(s => s.id === sectionId);
      if (section) targetQuestionIds = section.questionIds || [];
    } else {
      targetQuestionIds = sections.flatMap(s => s.questionIds || []);
    }

    const counts = {
      notVisited: 0,
      notAnswered: 0,
      answered: 0,
      markedForReview: 0,
      answeredAndMarked: 0,
    };

    targetQuestionIds.forEach(qId => {
      const res = responses[qId];
      if (!res || !res.visited) {
        counts.notVisited++;
      } else if (res.selected || (res.numeric !== undefined && res.numeric !== '')) {
        if (res.marked) {
          counts.answeredAndMarked++;
        } else {
          counts.answered++;
        }
      } else {
        if (res.marked) {
          counts.markedForReview++;
        } else {
          counts.notAnswered++;
        }
      }
    });

    return counts;
  }
);
