import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  attempt: null,
  sections: [],
  questions: {},
  responses: {},

  ui: {
    currentQuestionId: null,
    currentSectionId: null,
    targetSectionId: null,
    paletteOpen: false,
    submitModalOpen: false,
    sectionSubmitModalOpen: false,
    connection: 'offline',
    isExpired: false,
  },

  status: 'idle',
  error: null,
};

const attemptSlice = createSlice({
  name: 'attempt',

  initialState,

  reducers: {
    setAttemptData(state, action) {
      const {
        attempt,
        sections,
        questions,
        responses,
      } = action.payload;

      state.attempt = attempt;
      state.sections = sections || [];
      state.questions = questions || {};
      state.responses = responses || {};

      console.log('Restoring attempt data:', { attemptId: attempt?.id, currentQuestionIndex: attempt?.currentQuestionIndex });

      if (
        sections &&
        sections.length > 0
      ) {
        let restoredQId = null;
        let restoredSectionId = null;

        if (attempt.currentSectionId) {
          restoredSectionId = attempt.currentSectionId;
          if (typeof attempt.currentQuestionIndex === 'number') {
            let currentIndex = 0;
            for (const sec of sections) {
              if (!sec.questionIds) continue;
              if (
                attempt.currentQuestionIndex >= currentIndex &&
                attempt.currentQuestionIndex < currentIndex + sec.questionIds.length
              ) {
                restoredQId = sec.questionIds[attempt.currentQuestionIndex - currentIndex];
                break;
              }
              currentIndex += sec.questionIds.length;
            }
          }
        } else if (typeof attempt.currentQuestionIndex === 'number') {
          let currentIndex = 0;
          for (const sec of sections) {
            if (!sec.questionIds) continue;
            if (
              attempt.currentQuestionIndex >= currentIndex &&
              attempt.currentQuestionIndex < currentIndex + sec.questionIds.length
            ) {
              restoredSectionId = sec.id;
              restoredQId = sec.questionIds[attempt.currentQuestionIndex - currentIndex];
              break;
            }
            currentIndex += sec.questionIds.length;
          }
        }

        if (restoredQId && restoredSectionId) {
          state.ui.currentSectionId = restoredSectionId;
          state.ui.currentQuestionId = restoredQId;
        } else if (!state.ui.currentSectionId) {
          state.ui.currentSectionId = sections[0].id;
          if (
            sections[0].questionIds &&
            sections[0].questionIds.length > 0
          ) {
            state.ui.currentQuestionId = sections[0].questionIds[0];
          }
        }
      }

      state.status = 'succeeded';
      state.error = null;
    },

    setConnectionState(state, action) {
      state.ui.connection = action.payload;
    },

    updateRemainingTime(state, action) {
      if (state.attempt) {
        state.attempt.remainingSeconds =
          Math.max(0, action.payload);
      }
    },

    setCurrentQuestion(state, action) {
      const qId = action.payload;

      state.ui.currentQuestionId = qId;

      const section = state.sections.find((section) =>
        section.questionIds?.includes(qId)
      );

      if (section) {
        state.ui.currentSectionId = section.id;
      }

      if (!state.responses[qId]) {
        state.responses[qId] = {
          visited: true,
          marked: false,
          saveState: 'synced',
        };
      } else {
        state.responses[qId].visited = true;
      }
    },

    setCurrentSection(state, action) {
      state.ui.currentSectionId = action.payload;

      const section = state.sections.find(
        (item) => item.id === action.payload
      );

      if (
        section &&
        section.questionIds?.length > 0
      ) {
        const qId = section.questionIds[0];

        state.ui.currentQuestionId = qId;

        if (!state.responses[qId]) {
          state.responses[qId] = {
            visited: true,
            marked: false,
            saveState: 'synced',
          };
        } else {
          state.responses[qId].visited = true;
        }
      }
    },

    setPaletteOpen(state, action) {
      state.ui.paletteOpen = action.payload;
    },

    setSubmitModalOpen(state, action) {
      state.ui.submitModalOpen = action.payload;
    },

    setSectionSubmitModalOpen(state, action) {
      state.ui.sectionSubmitModalOpen = action.payload;
    },

    setTargetSectionId(state, action) {
      state.ui.targetSectionId = action.payload;
    },

    setAnswer(state, action) {
      const {
        qId,
        value,
        isNumeric,
      } = action.payload;

      if (!state.responses[qId]) {
        state.responses[qId] = {
          visited: true,
          marked: false,
        };
      }

      if (isNumeric) {
        state.responses[qId].numeric = value;
        state.responses[qId].selected = undefined;
      } else {
        state.responses[qId].selected = [value];
        state.responses[qId].numeric = undefined;
      }

      state.responses[qId].saveState = 'pending';
    },

    toggleAnswer(state, action) {
      const {
        qId,
        value,
      } = action.payload;

      if (!state.responses[qId]) {
        state.responses[qId] = {
          visited: true,
          marked: false,
          selected: [],
        };
      }

      let current =
        state.responses[qId].selected || [];

      if (current.includes(value)) {
        current = current.filter(
          (item) => item !== value
        );
      } else {
        current = [...current, value];
      }

      state.responses[qId].selected = current;
      state.responses[qId].numeric = undefined;
      state.responses[qId].saveState = 'pending';
    },

    clearAnswer(state, action) {
      const qId = action.payload;

      if (state.responses[qId]) {
        state.responses[qId].selected = undefined;
        state.responses[qId].numeric = undefined;
        state.responses[qId].saveState = 'pending';
      }
    },

    toggleMarkForReview(state, action) {
      const qId = action.payload;

      if (!state.responses[qId]) {
        state.responses[qId] = {
          visited: true,
        };
      }

      state.responses[qId].marked =
        !state.responses[qId].marked;

      state.responses[qId].saveState = 'pending';
    },

    setSaveState(state, action) {
      const {
        qId,
        saveState,
      } = action.payload;

      if (state.responses[qId]) {
        state.responses[qId].saveState = saveState;
      }
    },

    /*
     * Important race-condition protection.
     *
     * If:
     *
     *   A → request starts
     *   A → user changes answer to B
     *   A → request completes
     *
     * We must NOT mark B as synced.
     */
    markSyncedIfUnchanged(state, action) {
      const {
        qId,
        selected,
        numeric,
        marked,
      } = action.payload;

      const current = state.responses[qId];

      if (!current) {
        return;
      }

      const currentSelected =
        current.selected || null;

      const savedSelected =
        selected || null;

      const sameSelected =
        JSON.stringify(currentSelected) ===
        JSON.stringify(savedSelected);

      const sameNumeric =
        current.numeric === numeric;

      const sameMarked =
        current.marked === marked;

      if (
        sameSelected &&
        sameNumeric &&
        sameMarked &&
        current.saveState === 'pending'
      ) {
        current.saveState = 'synced';
      }
    },

    updateAttemptVersion(state, action) {
      if (state.attempt) {
        state.attempt.attemptVersion = action.payload;
      }
    },

    markExpired(state) {
      state.ui.isExpired = true;
    },

    resetAttemptState() {
      return initialState;
    },
  },
});

export const {
  setAttemptData,
  setConnectionState,
  updateRemainingTime,
  updateAttemptVersion,
  markExpired,
  setCurrentQuestion,
  setCurrentSection,
  setPaletteOpen,
  setSubmitModalOpen,
  setSectionSubmitModalOpen,
  setTargetSectionId,
  setAnswer,
  toggleAnswer,
  clearAnswer,
  toggleMarkForReview,
  setSaveState,
  markSyncedIfUnchanged,
  resetAttemptState,
} = attemptSlice.actions;

export default attemptSlice.reducer;