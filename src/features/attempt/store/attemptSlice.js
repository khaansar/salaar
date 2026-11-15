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
    // Inline exam-wide notice: { key, message } or null.
    notice: null,
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

      // The question on screen counts as visited, like any question opened later.
      const shownQId = state.ui.currentQuestionId;
      // state.responses was just set to the API's frozen object, which Immer
      // does not draft in this call, so add the entry on a new object.
      if (
        attempt?.status === 'IN_PROGRESS' &&
        shownQId &&
        !state.responses[shownQId]
      ) {
        state.responses = {
          ...state.responses,
          [shownQId]: {
            visited: true,
            marked: false,
            saveState: 'pending',
          },
        };
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

      // A first visit is saved too, so "not answered" survives a reload.
      if (!state.responses[qId]) {
        state.responses[qId] = {
          visited: true,
          marked: false,
          saveState: 'pending',
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
            saveState: 'pending',
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
          marked: false,
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

    updateSectionTiming(state, action) {
      if (state.attempt) {
        state.attempt.currentSectionStartedAt = action.payload.currentSectionStartedAt;
        state.attempt.sectionTimeSpentSec = action.payload.sectionTimeSpentSec || {};
      }
    },

    markExpired(state) {
      state.ui.isExpired = true;
    },

    showExamNotice(state, action) {
      state.ui.notice = action.payload;
    },

    /** Clears the notice; with a key, only when that notice is the one showing. */
    clearExamNotice(state, action) {
      if (!action.payload || state.ui.notice?.key === action.payload) {
        state.ui.notice = null;
      }
    },

    resetAttemptState() {
      return initialState;
    },
  },
});

export const EXAM_NOTICES = {
  sectionSwitch: {
    key: 'section-switch',
    message: "Your section change couldn't be confirmed with the server. Check your connection; your answers are still being saved.",
  },
  autosave: {
    key: 'autosave',
    message: "Some answers haven't been saved yet. We'll keep retrying — please check your internet connection.",
  },
  autoSubmit: {
    key: 'auto-submit',
    message: "Time is up, but automatic submission couldn't be confirmed. Keep this page open — use Submit Test to retry.",
  },
};

export const {
  showExamNotice,
  clearExamNotice,
  setAttemptData,
  setConnectionState,
  updateRemainingTime,
  updateAttemptVersion,
  updateSectionTiming,
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