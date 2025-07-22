import api from './api';

export const todoService = {
  async getTodos(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.due_date) params.append('due_date', filters.due_date);
    
    const response = await api.get(`/todos?${params}`);
    return response.data.todos;
  },

  async createTodo(todoData) {
    const response = await api.post('/todos', todoData);
    return response.data.todo;
  },

  async updateTodo(id, todoData) {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  async deleteTodo(id) {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },

  async getTodoStats() {
    const response = await api.get('/todos/stats');
    return response.data.stats;
  }
};

export const habitService = {
  async getHabits() {
    const response = await api.get('/habits');
    return response.data.habits;
  },

  async createHabit(habitData) {
    const response = await api.post('/habits', habitData);
    return response.data.habit;
  },

  async updateHabit(id, habitData) {
    const response = await api.put(`/habits/${id}`, habitData);
    return response.data;
  },

  async deleteHabit(id) {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },

  async addHabitEntry(id, entryData) {
    const response = await api.post(`/habits/${id}/entry`, entryData);
    return response.data.entry;
  },

  async getHabitStats() {
    const response = await api.get('/habits/stats');
    return response.data.stats;
  }
};

export const noteService = {
  async getNotes() {
    const response = await api.get('/notes');
    return response.data.notes;
  },

  async createNote(noteData) {
    const response = await api.post('/notes', noteData);
    return response.data.note;
  },

  async updateNote(id, noteData) {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  async deleteNote(id) {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  async summarizeNote(content, options = {}) {
    const response = await api.post('/notes/summarize', {
      content,
      ...options
    });
    return response.data;
  },

  async generateGlossary(content, options = {}) {
    const response = await api.post('/notes/generate-glossary', {
      content,
      ...options
    });
    return response.data;
  },

  async generateFlashcards(content, options = {}) {
    const response = await api.post('/notes/generate-flashcards', {
      content,
      ...options
    });
    return response.data;
  }
};

export const pomodoroService = {
  async getSessions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    
    const response = await api.get(`/pomodoro/sessions?${params}`);
    return response.data.sessions;
  },

  async startSession(sessionData) {
    const response = await api.post('/pomodoro/sessions', sessionData);
    return response.data.session;
  },

  async completeSession(id, data = {}) {
    const response = await api.put(`/pomodoro/sessions/${id}/complete`, data);
    return response.data;
  },

  async cancelSession(id) {
    const response = await api.put(`/pomodoro/sessions/${id}/cancel`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/pomodoro/stats');
    return response.data.stats;
  },

  async getSettings() {
    const response = await api.get('/pomodoro/settings');
    return response.data.settings;
  },

  async updateSettings(settings) {
    const response = await api.put('/pomodoro/settings', settings);
    return response.data;
  }
};

export const pdfQaService = {
  async uploadPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/pdf-qa/upload', formData);
    return response.data;
  },

  async getDocuments() {
    const response = await api.get('/pdf-qa/documents');
    return response.data.documents;
  },

  async askQuestion(documentId, question) {
    const response = await api.post('/pdf-qa/ask', {
      document_id: documentId,
      question
    });
    return response.data;
  },

  async getQaHistory(documentId = null) {
    const params = documentId ? `?document_id=${documentId}` : '';
    const response = await api.get(`/pdf-qa/history${params}`);
    return response.data.history;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/pdf-qa/documents/${id}`);
    return response.data;
  },

  async generateQuestions(documentId, options = {}) {
    const response = await api.post('/pdf-qa/generate-questions', {
      document_id: documentId,
      ...options
    });
    return response.data;
  }
};
