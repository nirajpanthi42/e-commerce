import { useState } from 'react';
import { createReview, updateReview } from '../services/review';

const ReviewForm = ({ productId, existingReview, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!existingReview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Comment is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = { productId, rating, comment };
      let res;
      if (isEdit) {
        res = await updateReview(existingReview._id, { rating, comment });
      } else {
        res = await createReview(data);
      }
      onSuccess(res.data);
      if (!isEdit) {
        setRating(0);
        setComment('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Star rating – kept yellow
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </button>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mt-4 bg-white text-gray-800">
      <h4 className="font-medium mb-2">
        {isEdit ? 'Edit Your Review' : 'Write a Review'}
      </h4>
      <div className="mb-3">{renderStars()}</div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full p-2 bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
        rows="3"
        disabled={loading}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
          disabled={loading}
        >
          {loading ? 'Submitting...' : isEdit ? 'Update' : 'Submit'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;