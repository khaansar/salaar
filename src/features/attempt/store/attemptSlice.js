import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  attempt: null,
  sections: [],
  questions: {},
  responses: {},
  ui: {
    currentQuestionId: null,
    currentSectionId: null,
    paletteOpen: false,
    submitModalOpen: false,
    connection: 'offline', // connecting, connected, offline
  },
  status: 'idle', // loading, succeeded, failed
  error: null,
};

const attemptSlice = createSlice({
  name: 'attempt',
  initialState,
  reducers: {
    setAttemptData(state, action) {
      const { attempt, sections, questions, responses } = action.payload;
      state.attempt = attempt;
      state.sections = sections || [];
      state.questions = questions || {};
      state.responses = responses || {};
      
      // Auto-select first section and question if not set
      if (sections && sections.length > 0 && !state.ui.currentSectionId) {
        state.ui.currentSectionId = sections[0].id;
        if (sections[0].questionIds && sections[0].questionIds.length > 0) {
          state.ui.currentQuestionId = sections[0].questionIds[0];
        }
      }
      
      state.status = 'succeeded';
    },
    setConnectionState(state, action) {
      state.ui.connection = action.payload;
    },
    updateRemainingTime(state, action) {
      if (state.attempt) {
        state.attempt.remainingSeconds = action.payload;
      }
    },
    setCurrentQuestion(state, action) {
      const qId = action.payload;
      state.ui.currentQuestionId = qId;
      // Also update section ID if needed
      const sec = state.sections.find(s => s.questionIds?.includes(qId));
      if (sec) {
        state.ui.currentSectionId = sec.id;
      }
      // Mark visited
      if (!state.responses[qId]) {
        state.responses[qId] = { visited: true, marked: false, saveState: 'synced' };
      } else {
        state.responses[qId].visited = true;
      }
    },
    setCurrentSection(state, action) {
      state.ui.currentSectionId = action.payload;
      const sec = state.sections.find(s => s.id === action.payload);
      if (sec && sec.questionIds?.length > 0) {
        state.ui.currentQuestionId = sec.questionIds[0];
        const qId = sec.questionIds[0];
        if (!state.responses[qId]) {
          state.responses[qId] = { visited: true, marked: false, saveState: 'synced' };
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
    setAnswer(state, action) {
      const { qId, value, isNumeric } = action.payload;
      if (!state.responses[qId]) state.responses[qId] = { visited: true, marked: false };
      
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
      const { qId, value } = action.payload;
      if (!state.responses[qId]) state.responses[qId] = { visited: true, marked: false, selected: [] };
      
      let current = state.responses[qId].selected || [];
      if (current.includes(value)) {
        current = current.filter(v => v !== value);
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
      if (!state.responses[qId]) state.responses[qId] = { visited: true };
      state.responses[qId].marked = !state.responses[qId].marked;
      state.responses[qId].saveState = 'pending';
    },
    setSaveState(state, action) {
      const { qId, saveState } = action.payload;
      if (state.responses[qId]) {
        state.responses[qId].saveState = saveState;
      }
    }
  }
});

export const { 
  setAttemptData, setConnectionState, updateRemainingTime, 
  setCurrentQuestion, setCurrentSection, setPaletteOpen, setSubmitModalOpen,
  setAnswer, toggleAnswer, clearAnswer, toggleMarkForReview, setSaveState
} = attemptSlice.actions;
export default attemptSlice.reducer;
