import { useEffect, useState } from 'react';
import { getProductReviews } from '../services/review';
import ReviewItem from './ReviewItem';

const ReviewList = ({ productId, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getProductReviews(productId);
      setReviews(res.data);
    } catch (err) {
      setError('Failed to load reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger]);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-black">
        Reviews ({reviews.length})
      </h3>
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-black">No reviews yet. Be the first!</p>
      ) : (
        reviews.map((review) => (
          <ReviewItem
            key={review._id}
            review={review}
            onEdit={() => {}} // you'll implement edit mode via parent state
            onDelete={(id) => setReviews(reviews.filter(r => r._id !== id))}
          />
        ))
      )}
    </div>
  );
};

export default ReviewList;