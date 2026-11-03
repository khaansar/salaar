import apiClient from '../lib/apiClient';

function unwrapReviewResponse(value) {
  let current = value;

  // apiClient normally unwraps the standard API envelope. This also tolerates
  // raw axios/envelope responses if the interceptor or gateway differs.
  for (let i = 0; i < 3; i += 1) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      break;
    }
    if (current.attemptId || Array.isArray(current.questions)) {
      return current;
    }
    if (current.data !== undefined) {
      current = current.data;
      continue;
    }
    break;
  }

  return current;
}

export const attemptReviewService = {
  async getReview(attemptId) {
    if (!attemptId) {
      throw new Error('Attempt ID is required to load the review.');
    }

    const response = await apiClient.get(
      `/attempts-api/${encodeURIComponent(attemptId)}/review`
    );
    const review = unwrapReviewResponse(response);

    if (!review || !Array.isArray(review.questions)) {
      throw new Error(
        'The attempt review response is missing its questions. Confirm Baahubali is running the attempt-review branch.'
      );
    }

    return {
      ...review,
      sections: Array.isArray(review.sections) ? review.sections : [],
      questions: review.questions,
    };
  },
};

export default attemptReviewService;
