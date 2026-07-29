import client from './client';

/**
 * One function per SurveyController endpoint. Each returns the same
 * SurveyResponse shape: { survey, userHome, desiredRegions, userName }.
 */
export default {
  start() {
    return client.post('/surveys/start').then((res) => res.data);
  },

  get(surveyId) {
    return client.get(`/surveys/${surveyId}`).then((res) => res.data);
  },

  saveCurrentHome(surveyId, payload) {
    return client.patch(`/surveys/${surveyId}/current-home`, payload).then((res) => res.data);
  },

  savePreference(surveyId, profileCode) {
    return client
      .patch(`/surveys/${surveyId}/preference`, { profileCode })
      .then((res) => res.data);
  },

  saveMortgage(surveyId, payload) {
    return client.patch(`/surveys/${surveyId}/mortgage`, payload).then((res) => res.data);
  },

  saveReserveBudget(surveyId, payload) {
    return client
      .patch(`/surveys/${surveyId}/reserve-budget`, payload)
      .then((res) => res.data);
  },

  saveDesiredRegions(surveyId, regions) {
    return client
      .post(`/surveys/${surveyId}/desired-regions`, { regions })
      .then((res) => res.data);
  },

  reset() {
    return client.post('/surveys/reset').then((res) => res.data);
  },
};
