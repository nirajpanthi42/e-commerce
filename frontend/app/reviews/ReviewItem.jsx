import { useAuth } from '../context/AuthContext';
import { deleteReview } from '../services/review';

const ReviewItem = ({ review, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAuthor = user && user._id === review.user._id;
  const isAdmin = user && user.role === 'admin';

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(review._id);
        onDelete(review._id); // notify parent to refresh list
      } catch (error) {
        console.error('Delete review error:', error);
        alert('Failed to delete review');
      }
    }
  };

  return (
    <div className="border-b py-4 text-black">
      <div className="flex justify-between items-start ">
        <div>
          <div className="font-semibold">{review.user.name}</div>
          <div className="flex items-center gap-1 text-yellow-500">
            {'⭐'.repeat(review.rating)}
            <span className="text-gray-500 text-sm ml-1">({review.rating})</span>
          </div>
          <p className="text-gray-700 mt-1">{review.comment}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        {(isAuthor || isAdmin) && (
          <div className="flex gap-2">
            {isAuthor && (
              <button
                onClick={() => onEdit(review)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;